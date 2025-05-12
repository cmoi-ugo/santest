"""
Service pour la gestion des quiz.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate, QuizUpdate


class QuizService:
    """Service pour gérer les opérations sur les quiz."""

    @staticmethod
    def get_quizzes(db: Session, skip: int = 0, limit: int = 100):
        """
        Récupère la liste des quiz.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            limit: Nombre maximal d'éléments à retourner
            
        Returns:
            Liste des quiz
        """
        return db.query(Quiz).offset(skip).limit(limit).all()

    @staticmethod
    def get_quiz(db: Session, quiz_id: int):
        """
        Récupère un quiz par son ID.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz à récupérer
            
        Returns:
            Le quiz trouvé
            
        Raises:
            HTTPException: Si le quiz n'existe pas
        """
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        return quiz

    @staticmethod
    def create_quiz(db: Session, quiz_data: QuizCreate):
        """
        Crée un nouveau quiz.
        
        Args:
            db: Session de base de données
            quiz_data: Données du quiz à créer
            
        Returns:
            Le quiz créé
        """
        quiz = Quiz(**quiz_data.dict())
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        return quiz

    @staticmethod
    def update_quiz(db: Session, quiz_id: int, quiz_data: QuizUpdate):
        """
        Met à jour un quiz existant.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz à mettre à jour
            quiz_data: Nouvelles données du quiz
            
        Returns:
            Le quiz mis à jour
            
        Raises:
            HTTPException: Si le quiz n'existe pas
        """
        quiz = QuizService.get_quiz(db, quiz_id)

        update_data = quiz_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(quiz, key, value)
            
        db.commit()
        db.refresh(quiz)
        return quiz

    @staticmethod
    def delete_quiz(db: Session, quiz_id: int):
        """
        Supprime un quiz.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz à supprimer
            
        Returns:
            True si le quiz a été supprimé
            
        Raises:
            HTTPException: Si le quiz n'existe pas
        """
        quiz = QuizService.get_quiz(db, quiz_id)
        db.delete(quiz)
        db.commit()
        return True
