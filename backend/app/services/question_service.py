"""
Service pour la gestion des questions.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate


class QuestionService:
    """Service pour gérer les opérations sur les questions."""

    @staticmethod
    def get_questions(db: Session, skip: int = 0, limit: int = 100, quiz_id: int = None):
        """
        Récupère la liste des questions, optionnellement filtrées par quiz.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            limit: Nombre maximal d'éléments à retourner
            quiz_id: ID du quiz pour filtrer les questions
            
        Returns:
            Liste des questions
        """
        query = db.query(Question)
        if quiz_id is not None:
            query = query.filter(Question.quiz_id == quiz_id)
        return query.order_by(Question.order).offset(skip).limit(limit).all()

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
        question = Question(**question_data.dict())
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
        Supprime une question.
        
        Args:
            db: Session de base de données
            question_id: ID de la question à supprimer
            
        Returns:
            True si la question a été supprimée
            
        Raises:
            HTTPException: Si la question n'existe pas
        """
        question = QuestionService.get_question(db, question_id)
        db.delete(question)
        db.commit()
        return True