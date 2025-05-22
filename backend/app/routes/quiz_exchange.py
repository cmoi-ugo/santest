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
from app.services.quiz_type_service import QuizTypeService
from app.models.dimension import question_dimension
from app.schemas.quiz import QuizCreate, Quiz
from app.schemas.question import QuestionCreate
from app.schemas.dimension import DimensionCreate, DimensionAdviceCreate, DimensionScoringRuleCreate
from app.schemas.quiz_type import QuizTypeCreate
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
    
    question_dimensions = []
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
            
    question_dim_assoc = db.query(question_dimension).all()
    for assoc in question_dim_assoc:
        question_dimensions.append({
            "question_id": assoc.question_id,
            "dimension_id": assoc.dimension_id,
            "weight": assoc.weight
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
            "order": q.order
        } for q in questions],
        dimensions=[{
            "name": d.name,
            "description": d.description,
            "order": d.order
        } for d in dimensions],
        dimension_advices=dimension_advices,
        scoring_rules=scoring_rules,
        question_dimensions=question_dimensions
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
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w") as temp_file:
        json.dump(export_data, temp_file, ensure_ascii=True, indent=2)
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
        media_type="application/json"
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
        content_str = content.decode(encoding='ascii', errors='ignore')
        file_data = json.loads(content_str)
        quiz_data = file_data["content"]
        
        if "version" not in quiz_data:
            raise HTTPException(status_code=400, detail="Format de fichier invalide : version manquante")
        
        imported_quiz_type_id = None
        if quiz_data.get("quiz_type") and quiz_data["quiz_type"].get("name"):
            type_name = quiz_data["quiz_type"]["name"]
            
            existing_type = QuizTypeService.get_quiz_type_by_name(db, type_name)
            if existing_type:
                imported_quiz_type_id = existing_type.id
            else:
                type_create = QuizTypeCreate(name=type_name)
                new_type = QuizTypeService.create_quiz_type(db, type_create)
                imported_quiz_type_id = new_type.id
        
        quiz_create = QuizCreate(
            title=quiz_data["quiz"]["title"],
            description=quiz_data["quiz"]["description"],
            image_url=quiz_data["quiz"].get("image_url"),
            quiz_type_id=imported_quiz_type_id
        )
        
        new_quiz = QuizService.create_quiz(db, quiz_create)
        
        question_id_mapping = {}
        for i, q_data in enumerate(quiz_data["questions"], 1): 
            question_create = QuestionCreate(
                quiz_id=new_quiz.id,
                text=q_data["text"],
                question_type=q_data["question_type"],
                options=q_data["options"],
                required=q_data["required"],
                order=q_data["order"]
            )
            
            new_question = QuestionService.create_question(db, question_create)
            question_id_mapping[i] = new_question.id
        
        dimension_id_mapping = {} 
        for i, d_data in enumerate(quiz_data["dimensions"], 1):
            dimension_create = DimensionCreate(
                quiz_id=new_quiz.id,
                name=d_data["name"],
                description=d_data["description"],
                order=d_data["order"]
            )
            
            new_dimension = DimensionService.create_dimension(db, dimension_create)
            dimension_id_mapping[i] = new_dimension.id
        
        for rel in quiz_data["question_dimensions"]:
            old_question_id = rel["question_id"]
            old_dimension_id = rel["dimension_id"]
            
            if old_question_id in question_id_mapping and old_dimension_id in dimension_id_mapping:
                DimensionService.link_question_to_dimension(
                    db,
                    question_id=question_id_mapping[old_question_id],
                    dimension_id=dimension_id_mapping[old_dimension_id],
                    weight=rel["weight"]
                )
        
        for rule in quiz_data["scoring_rules"]:
            old_dimension_id = rule["dimension_id"]
            old_question_id = rule["question_id"]
            
            if old_question_id in question_id_mapping and old_dimension_id in dimension_id_mapping:
                rule_create = DimensionScoringRuleCreate(
                    dimension_id=dimension_id_mapping[old_dimension_id],
                    question_id=question_id_mapping[old_question_id],
                    answer_value=rule["answer_value"],
                    score=rule["score"]
                )
                
                DimensionService.create_scoring_rule(db, rule_create)
        
        for advice in quiz_data["dimension_advices"]:
            old_dimension_id = advice["dimension_id"]

            if old_dimension_id in dimension_id_mapping:
                advice_create = DimensionAdviceCreate(
                    dimension_id=dimension_id_mapping[old_dimension_id],
                    min_score=advice["min_score"],
                    max_score=advice["max_score"],
                    title=advice["title"],
                    advice=advice["advice"],
                    severity=advice["severity"]
                )
                
                DimensionService.create_advice(db, advice_create)
        
        return new_quiz
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Format de fichier JSON invalide")
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Donnée manquante dans le fichier: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'importation: {str(e)}")