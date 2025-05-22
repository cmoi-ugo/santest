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
    def get_quizzes(db: Session, skip: int = 0, quiz_type_ids: Optional[List[int]] = None):
        """
        Récupère la liste des quiz.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            quiz_type_ids: Liste des IDs de types pour filtrer les quiz
            
        Returns:
            Liste des quiz
        """
        query = db.query(Quiz).options(joinedload(Quiz.quiz_types))
        
        if quiz_type_ids:
            query = query.join(Quiz.quiz_types).filter(QuizType.id.in_(quiz_type_ids)).distinct()
        
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
        quiz = db.query(Quiz).options(joinedload(Quiz.quiz_types)).filter(Quiz.id == quiz_id).first()
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
            HTTPException: Si un des types spécifiés n'existe pas
        """
        quiz_dict = quiz_data.dict(exclude={'quiz_type_ids'})
        quiz = Quiz(**quiz_dict)
        
        if quiz_data.quiz_type_ids:
            quiz_types = db.query(QuizType).filter(QuizType.id.in_(quiz_data.quiz_type_ids)).all()

            found_ids = {qt.id for qt in quiz_types}
            missing_ids = set(quiz_data.quiz_type_ids) - found_ids
            if missing_ids:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Types de questionnaire non trouvés: {list(missing_ids)}"
                )
            
            quiz.quiz_types = quiz_types
        
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        quiz = db.query(Quiz).options(joinedload(Quiz.quiz_types)).filter(Quiz.id == quiz.id).first()
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
            HTTPException: Si le quiz n'existe pas ou si un type spécifié n'existe pas
        """
        quiz = QuizService.get_quiz(db, quiz_id)
        
        update_data = quiz_data.dict(exclude_unset=True, exclude={'quiz_type_ids'})
        
        for key, value in update_data.items():
            setattr(quiz, key, value)
        
        if quiz_data.quiz_type_ids is not None:
            if quiz_data.quiz_type_ids:
                quiz_types = db.query(QuizType).filter(QuizType.id.in_(quiz_data.quiz_type_ids)).all()
                
                found_ids = {qt.id for qt in quiz_types}
                missing_ids = set(quiz_data.quiz_type_ids) - found_ids
                if missing_ids:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Types de questionnaire non trouvés: {list(missing_ids)}"
                    )
                
                quiz.quiz_types = quiz_types
            else:
                quiz.quiz_types = []
            
        db.commit()
        db.refresh(quiz)
        
        quiz = db.query(Quiz).options(joinedload(Quiz.quiz_types)).filter(Quiz.id == quiz.id).first()
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
        
        return db.query(Quiz).options(joinedload(Quiz.quiz_types)).join(
            Quiz.quiz_types
        ).filter(QuizType.id == quiz_type_id).order_by(
            Quiz.created_at.desc()
        ).offset(skip).all()

    @staticmethod
    def add_type_to_quiz(db: Session, quiz_id: int, quiz_type_id: int):
        """
        Ajoute un type à un quiz.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz
            quiz_type_id: ID du type à ajouter
            
        Returns:
            Le quiz mis à jour
        """
        quiz = QuizService.get_quiz(db, quiz_id)
        quiz_type = db.query(QuizType).filter(QuizType.id == quiz_type_id).first()
        
        if not quiz_type:
            raise HTTPException(status_code=404, detail="Quiz type not found")
        
        if quiz_type not in quiz.quiz_types:
            quiz.quiz_types.append(quiz_type)
            db.commit()
            db.refresh(quiz)
        
        return quiz

    @staticmethod
    def remove_type_from_quiz(db: Session, quiz_id: int, quiz_type_id: int):
        """
        Retire un type d'un quiz.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz
            quiz_type_id: ID du type à retirer
            
        Returns:
            Le quiz mis à jour
        """
        quiz = QuizService.get_quiz(db, quiz_id)
        quiz_type = db.query(QuizType).filter(QuizType.id == quiz_type_id).first()
        
        if not quiz_type:
            raise HTTPException(status_code=404, detail="Quiz type not found")
        
        if quiz_type in quiz.quiz_types:
            quiz.quiz_types.remove(quiz_type)
            db.commit()
            db.refresh(quiz)
        
        return quiz

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
        ).outerjoin(Quiz.quiz_types).group_by(QuizType.id).all()
        
        return [
            {
                "type_id": stat.id,
                "type_name": stat.name,
                "quiz_count": stat.quiz_count
            }
            for stat in stats
        ]