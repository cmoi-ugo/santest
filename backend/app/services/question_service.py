"""
Service pour la gestion des questions.
"""
from typing import List, Dict
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate


class QuestionService:
    """Service pour gérer les opérations sur les questions."""

    @staticmethod
    def get_questions(db: Session, skip: int = 0, quiz_id: int = None):
        """
        Récupère la liste des questions, optionnellement filtrées par quiz.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            quiz_id: ID du quiz pour filtrer les questions
            
        Returns:
            Liste des questions
        """
        query = db.query(Question)
        if quiz_id is not None:
            query = query.filter(Question.quiz_id == quiz_id)
        return query.order_by(Question.order).offset(skip).all()

    @staticmethod
    def get_question(db: Session, question_id: int):
        """
        Récupère une question par son ID.
        
        Args:
            db: Session de base de données
            question_id: ID de la question à récupérer
            
        Returns:
            La question trouvée
            
        Raises:
            HTTPException: Si la question n'existe pas
        """
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        return question

    @staticmethod
    def create_question(db: Session, question_data: QuestionCreate):
        """
        Crée une nouvelle question.
        
        Args:
            db: Session de base de données
            question_data: Données de la question à créer
            
        Returns:
            La question créée
        """
        question_dict = question_data.dict()
    
        if question_dict.get('order') is None or question_dict.get('order') == 0:
            max_order = db.query(func.max(Question.order)).filter(
                Question.quiz_id == question_dict['quiz_id']
            ).scalar()
            
            question_dict['order'] = (max_order or 0) + 1
        
        question = Question(**question_dict)
        db.add(question)
        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def update_question(db: Session, question_id: int, question_data: QuestionUpdate):
        """
        Met à jour une question existante.
        
        Args:
            db: Session de base de données
            question_id: ID de la question à mettre à jour
            question_data: Nouvelles données de la question
            
        Returns:
            La question mise à jour
            
        Raises:
            HTTPException: Si la question n'existe pas
        """
        question = QuestionService.get_question(db, question_id)

        update_data = question_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(question, key, value)
            
        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def delete_question(db: Session, question_id: int):
        """
        Supprime une question et réajuste l'ordre des questions restantes.
        
        Args:
            db: Session de base de données
            question_id: ID de la question à supprimer
            
        Returns:
            True si la question a été supprimée
            
        Raises:
            HTTPException: Si la question n'existe pas
        """
        question = QuestionService.get_question(db, question_id)
        quiz_id = question.quiz_id
        deleted_order = question.order
        
        db.delete(question)
        
        remaining_questions = db.query(Question).filter(
            Question.quiz_id == quiz_id,
            Question.order > deleted_order
        ).all()
        
        for q in remaining_questions:
            q.order -= 1
        
        db.commit()
        return True
    
    @staticmethod
    def reorder_questions(db: Session, quiz_id: int, questions_order: List[Dict[str, int]]):
        """
        Réorganise l'ordre des questions d'un quiz.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz
            questions_order: Liste des questions avec leur nouvel ordre
            
        Returns:
            True si la réorganisation a réussi
            
        Raises:
            HTTPException: Si le quiz n'existe pas ou si une question n'existe pas
        """
        quiz = db.query(Question).filter(Question.quiz_id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        for item in questions_order:
            question_id = item['id']
            new_order = item['order']
            
            question = db.query(Question).filter(
                Question.id == question_id,
                Question.quiz_id == quiz_id
            ).first()
            
            if not question:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Question {question_id} not found in quiz {quiz_id}"
                )
            
            question.order = new_order
        
        db.commit()
        return True