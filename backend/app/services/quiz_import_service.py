"""
Service pour l'importation de questionnaires depuis des données JSON.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Dict, Any

from app.services.quiz_service import QuizService
from app.services.question_service import QuestionService
from app.services.dimension_service import DimensionService
from app.services.quiz_type_service import QuizTypeService
from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate
from app.schemas.question import QuestionCreate
from app.schemas.dimension import DimensionCreate, DimensionAdviceCreate, DimensionScoringRuleCreate
from app.schemas.quiz_type import QuizTypeCreate


class QuizImportService:
    """Service pour l'importation de questionnaires."""

    @staticmethod
    def import_quiz_from_data(db: Session, quiz_data: Dict[str, Any], check_existing: bool = True):
        """
        Importe un questionnaire à partir de données JSON.
        
        Args:
            db: Session de base de données
            quiz_data: Données du questionnaire au format JSON
            check_existing: Vérifier si le questionnaire existe déjà
            
        Returns:
            Le questionnaire créé
            
        Raises:
            HTTPException: Si le format est invalide ou en cas d'erreur
        """
        if "version" not in quiz_data:
            raise HTTPException(status_code=400, detail="Format de fichier invalide : version manquante")
        
        if check_existing:
            existing_quiz = db.query(Quiz).filter(Quiz.title == quiz_data["quiz"]["title"]).first()
            if existing_quiz:
                return existing_quiz
        
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
                order=q_data["order"],
                image_url=q_data.get("image_url"),
            )
            
            new_question = QuestionService.create_question(db, question_create)
            original_question_id = q_data.get("id", i)
            question_id_mapping[original_question_id] = new_question.id
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
            original_dimension_id = d_data.get("id", i)
            dimension_id_mapping[original_dimension_id] = new_dimension.id
            dimension_id_mapping[i] = new_dimension.id
        
        for rule in quiz_data.get("scoring_rules", []):
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
        
        for advice in quiz_data.get("dimension_advices", []):
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