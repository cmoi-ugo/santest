"""
Routes pour l'importation et l'exportation de questionnaires.
"""
from typing import Dict, Any, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json

from app.config.database import get_db
from app.services.quiz_service import QuizService
from app.services.question_service import QuestionService
from app.services.dimension_service import DimensionService
from app.models.dimension import question_dimension
from app.schemas.quiz import QuizCreate, Quiz
from app.schemas.question import QuestionCreate
from app.schemas.dimension import DimensionCreate, DimensionAdviceCreate, DimensionScoringRuleCreate


class QuizExport(BaseModel):
    """Schéma pour les données d'export d'un questionnaire."""
    quiz: Dict[str, Any]
    questions: List[Dict[str, Any]]
    dimensions: List[Dict[str, Any]]
    dimension_advices: List[Dict[str, Any]]
    scoring_rules: List[Dict[str, Any]]
    question_dimensions: List[Dict[str, Any]]
    version: str = "1.0.0"


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
    
    quiz_export = QuizExport(
        quiz={
            "title": quiz.title,
            "description": quiz.description,
            "image_url": quiz.image_url
        },
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
        quiz_data = json.loads(content)
        
        if "version" not in quiz_data:
            raise HTTPException(status_code=400, detail="Format de fichier invalide : version manquante")
        
        quiz_create = QuizCreate(
            title=quiz_data["quiz"]["title"],
            description=quiz_data["quiz"]["description"],
            image_url=quiz_data["quiz"].get("image_url")
        )
        
        new_quiz = QuizService.create_quiz(db, quiz_create)
        
        question_id_mapping = {}
        for i, q_data in enumerate(quiz_data["questions"]):
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
        for i, d_data in enumerate(quiz_data["dimensions"]):
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
            
            q_idx = next((i for i, qid in enumerate(question_id_mapping.keys()) if qid == old_question_id), None)
            d_idx = next((i for i, did in enumerate(dimension_id_mapping.keys()) if did == old_dimension_id), None)
            
            if q_idx is not None and d_idx is not None:
                DimensionService.link_question_to_dimension(
                    db,
                    question_id=question_id_mapping[q_idx],
                    dimension_id=dimension_id_mapping[d_idx],
                    weight=rel["weight"]
                )
        
        for rule in quiz_data["scoring_rules"]:
            old_dimension_id = rule["dimension_id"]
            old_question_id = rule["question_id"]
            
            q_idx = next((i for i, qid in enumerate(question_id_mapping.keys()) if qid == old_question_id), None)
            d_idx = next((i for i, did in enumerate(dimension_id_mapping.keys()) if did == old_dimension_id), None)
            
            if q_idx is not None and d_idx is not None:
                rule_create = DimensionScoringRuleCreate(
                    dimension_id=dimension_id_mapping[d_idx],
                    question_id=question_id_mapping[q_idx],
                    answer_value=rule["answer_value"],
                    score=rule["score"]
                )
                
                DimensionService.create_scoring_rule(db, rule_create)
        
        for advice in quiz_data["dimension_advices"]:
            old_dimension_id = advice["dimension_id"]
            
            d_idx = next((i for i, did in enumerate(dimension_id_mapping.keys()) if did == old_dimension_id), None)
            if d_idx is not None:
                advice_create = DimensionAdviceCreate(
                    dimension_id=dimension_id_mapping[d_idx],
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


@router.post("/import-json", response_model=Quiz)
async def import_quiz_json(
    quiz_data: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Importe un questionnaire à partir de données JSON directement dans le corps de la requête.
    """
    try:
        if "version" not in quiz_data:
            raise HTTPException(status_code=400, detail="Format de données invalide : version manquante")
        
        quiz_create = QuizCreate(
            title=quiz_data["quiz"]["title"],
            description=quiz_data["quiz"]["description"],
            image_url=quiz_data["quiz"].get("image_url")
        )
        
        new_quiz = QuizService.create_quiz(db, quiz_create)
        
        question_id_mapping = {}
        for i, q_data in enumerate(quiz_data["questions"]):
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
        for i, d_data in enumerate(quiz_data["dimensions"]):
            dimension_create = DimensionCreate(
                quiz_id=new_quiz.id,
                name=d_data["name"],
                description=d_data["description"],
                order=d_data["order"]
            )
            
            new_dimension = DimensionService.create_dimension(db, dimension_create)
            dimension_id_mapping[i] = new_dimension.id
        
        for rel in quiz_data["question_dimensions"]:
            q_idx = int(rel["question_id"])
            d_idx = int(rel["dimension_id"])
            
            if q_idx in question_id_mapping and d_idx in dimension_id_mapping:
                DimensionService.link_question_to_dimension(
                    db,
                    question_id=question_id_mapping[q_idx],
                    dimension_id=dimension_id_mapping[d_idx],
                    weight=rel["weight"]
                )
        
        for rule in quiz_data["scoring_rules"]:
            d_idx = int(rule["dimension_id"])
            q_idx = int(rule["question_id"])
            
            if d_idx in dimension_id_mapping and q_idx in question_id_mapping:
                rule_create = DimensionScoringRuleCreate(
                    dimension_id=dimension_id_mapping[d_idx],
                    question_id=question_id_mapping[q_idx],
                    answer_value=rule["answer_value"],
                    score=rule["score"]
                )
                
                DimensionService.create_scoring_rule(db, rule_create)
        
        for advice in quiz_data["dimension_advices"]:
            d_idx = int(advice["dimension_id"])
            
            if d_idx in dimension_id_mapping:
                advice_create = DimensionAdviceCreate(
                    dimension_id=dimension_id_mapping[d_idx],
                    min_score=advice["min_score"],
                    max_score=advice["max_score"],
                    title=advice["title"],
                    advice=advice["advice"],
                    severity=advice["severity"]
                )
                
                DimensionService.create_advice(db, advice_create)
        
        return new_quiz
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Donnée manquante dans le fichier: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'importation: {str(e)}")