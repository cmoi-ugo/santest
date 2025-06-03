"""
Routes pour l'importation et l'exportation de questionnaires.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import tempfile
import datetime
import json
import os

from app.config.database import get_db
from app.config.constants import APP_VERSION
from app.services.quiz_service import QuizService
from app.services.question_service import QuestionService
from app.services.dimension_service import DimensionService
from app.services.quiz_import_service import QuizImportService
from app.schemas.quiz import Quiz
from app.schemas.quiz_exchange import QuizExport


router = APIRouter(
    prefix="/quiz-exchange",
    tags=["Quiz Exchange"],
    responses={404: {"description": "Quiz non trouvé"}},
)


@router.get("/export/{quiz_id}")
async def export_quiz(quiz_id: int, db: Session = Depends(get_db)) -> QuizExport:
    """
    Exporte un questionnaire complet avec toutes ses données associées.
    """
    quiz = QuizService.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    questions = QuestionService.get_questions(db, quiz_id=quiz_id)
    dimensions = DimensionService.get_dimensions(db, quiz_id=quiz_id)

    dimension_advices = []
    scoring_rules = []
    
    for dimension in dimensions:
        rules = DimensionService.get_dimension_scoring_rules(db, dimension.id)
        for rule in rules:
            scoring_rules.append({
                "dimension_id": rule.dimension_id,
                "question_id": rule.question_id,
                "answer_value": rule.answer_value,
                "score": rule.score
            })
        
        advices = DimensionService.get_dimension_advices(db, dimension.id)
        for advice in advices:
            dimension_advices.append({
                "dimension_id": advice.dimension_id,
                "min_score": advice.min_score,
                "max_score": advice.max_score,
                "title": advice.title,
                "advice": advice.advice,
                "severity": advice.severity
            })
    
    quiz_data = {
        "title": quiz.title,
        "description": quiz.description,
        "image_url": quiz.image_url,
        "quiz_type_id": quiz.quiz_type_id
    }
    
    quiz_type_data = None
    if quiz.quiz_type:
        quiz_type_data = {
            "id": quiz.quiz_type.id,
            "name": quiz.quiz_type.name
        }
    
    quiz_export = QuizExport(
        quiz=quiz_data,
        quiz_type=quiz_type_data,
        questions=[{
            "text": q.text,
            "question_type": q.question_type,
            "options": q.options,
            "required": q.required,
            "order": q.order,
            "image_url": q.image_url,
        } for q in questions],
        dimensions=[{
            "name": d.name,
            "description": d.description,
            "order": d.order
        } for d in dimensions],
        dimension_advices=dimension_advices,
        scoring_rules=scoring_rules,
    )
    
    return quiz_export


@router.get("/export/{quiz_id}/download")
async def export_quiz_download(quiz_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Exporte un questionnaire complet avec toutes ses données associées
    et renvoie un fichier JSON téléchargeable.
    """
    quiz_data = await export_quiz(quiz_id, db)
    quiz = QuizService.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    export_data = {
        "content": quiz_data.dict(),
        "metadata": {
            "export_date": datetime.datetime.now().isoformat(),
            "app_version": APP_VERSION
        }
    }
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w", encoding="utf-8") as temp_file:
        json.dump(export_data, temp_file, ensure_ascii=False, indent=2)
        temp_file_path = temp_file.name
    
    safe_filename = "".join(x for x in quiz.title if x.isalnum() or x in " -_").strip()
    safe_filename = safe_filename.replace(" ", "_")
    filename = f"{safe_filename}_{datetime.datetime.now().strftime('%Y%m%d')}.json"
    
    def remove_temp_file(temp_file_path: str):
        try:
            os.unlink(temp_file_path)
        except Exception:
            pass
    
    background_tasks.add_task(remove_temp_file, temp_file_path)
    
    return FileResponse(
        path=temp_file_path, 
        filename=filename,
        media_type="application/json; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{filename}",
            "Content-Type": "application/json; charset=utf-8"
        }
    )


@router.post("/import", response_model=Quiz)
async def import_quiz(
    quiz_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importe un questionnaire à partir d'un fichier JSON.
    """
    try:
        content = await quiz_file.read()
        content_str = content.decode(encoding='utf-8', errors='ignore')
        file_data = json.loads(content_str)
        
        quiz_data = file_data.get("content", file_data)
        new_quiz = QuizImportService.import_quiz_from_data(db, quiz_data, check_existing=False)
        
        return new_quiz
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Format de fichier JSON invalide")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'importation: {str(e)}")