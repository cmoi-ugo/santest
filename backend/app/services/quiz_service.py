"""
Service pour la gestion des quiz.
"""
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import List, Optional

from app.models.quiz import Quiz
from app.models.quiz_type import QuizType
from app.schemas.quiz import QuizCreate, QuizUpdate


class QuizService:
    """Service pour gérer les opérations sur les quiz."""

    @staticmethod
    def get_quizzes(db: Session, skip: int = 0, quiz_type_id: Optional[int] = None):
        """
        Récupère la liste des quiz.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            quiz_type_id: ID du type pour filtrer les quiz
            
        Returns:
            Liste des quiz
        """
        query = db.query(Quiz).options(joinedload(Quiz.quiz_type))
        
        if quiz_type_id is not None:
            query = query.filter(Quiz.quiz_type_id == quiz_type_id)
        
        return query.order_by(Quiz.created_at.desc()).offset(skip).all()

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
        quiz = db.query(Quiz).options(joinedload(Quiz.quiz_type)).filter(Quiz.id == quiz_id).first()
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
            
        Raises:
            HTTPException: Si le type spécifié n'existe pas
        """
        if quiz_data.quiz_type_id is not None:
            quiz_type = db.query(QuizType).filter(QuizType.id == quiz_data.quiz_type_id).first()
            if not quiz_type:
                raise HTTPException(status_code=404, detail="Quiz type not found")
        
        quiz = Quiz(**quiz_data.dict())
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        quiz = db.query(Quiz).options(joinedload(Quiz.quiz_type)).filter(Quiz.id == quiz.id).first()
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
            HTTPException: Si le quiz n'existe pas ou si le type spécifié n'existe pas
        """
        quiz = QuizService.get_quiz(db, quiz_id)
        
        update_data = quiz_data.dict(exclude_unset=True)
        
        if 'quiz_type_id' in update_data and update_data['quiz_type_id'] is not None:
            quiz_type = db.query(QuizType).filter(QuizType.id == update_data['quiz_type_id']).first()
            if not quiz_type:
                raise HTTPException(status_code=404, detail="Quiz type not found")

        for key, value in update_data.items():
            setattr(quiz, key, value)
            
        db.commit()
        db.refresh(quiz)
        
        quiz = db.query(Quiz).options(joinedload(Quiz.quiz_type)).filter(Quiz.id == quiz.id).first()
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

    @staticmethod
    def get_quizzes_by_type(db: Session, quiz_type_id: int, skip: int = 0):
        """
        Récupère tous les quiz d'un type donné.
        
        Args:
            db: Session de base de données
            quiz_type_id: ID du type de questionnaire
            skip: Nombre d'éléments à sauter
            
        Returns:
            Liste des quiz du type spécifié
        """
        quiz_type = db.query(QuizType).filter(QuizType.id == quiz_type_id).first()
        if not quiz_type:
            raise HTTPException(status_code=404, detail="Quiz type not found")
        
        return db.query(Quiz).options(joinedload(Quiz.quiz_type)).filter(
            Quiz.quiz_type_id == quiz_type_id
        ).order_by(Quiz.created_at.desc()).offset(skip).all()

    @staticmethod
    def get_quiz_stats_by_type(db: Session):
        """
        Récupère les statistiques de quiz par type.
        
        Args:
            db: Session de base de données
            
        Returns:
            Dictionnaire avec les statistiques par type
        """
        from sqlalchemy import func
        
        stats = db.query(
            QuizType.id,
            QuizType.name,
            func.count(Quiz.id).label('quiz_count')
        ).outerjoin(Quiz).group_by(QuizType.id).all()
        
        return [
            {
                "type_id": stat.id,
                "type_name": stat.name,
                "quiz_count": stat.quiz_count
            }
            for stat in stats
        ]