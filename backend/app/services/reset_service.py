"""
Service pour la réinitialisation de l'application.
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from typing import Dict, Any

from app.models.quiz import Quiz
from app.models.question import Question, Answer
from app.models.dimension import Dimension, DimensionScoringRule, DimensionAdvice
from app.models.favorite import Favorite
from app.models.quiz_type import QuizType
from app.services.initialization_service import InitializationService
from app.config.constants import DEFAULT_TYPES


class ResetService:
    """Service pour gérer la réinitialisation de l'application."""

    @staticmethod
    def reset_application(db: Session, confirm_reset: bool = False) -> Dict[str, Any]:
        """
        Réinitialise complètement l'application en supprimant toutes les données utilisateur.
        
        Args:
            db: Session de base de données
            confirm_reset: Confirmation explicite de la réinitialisation
            
        Returns:
            Dictionnaire avec les statistiques de suppression
            
        Raises:
            HTTPException: Si la confirmation n'est pas fournie
        """
        if not confirm_reset:
            raise HTTPException(
                status_code=400, 
                detail="La réinitialisation doit être confirmée explicitement avec 'confirm_reset=true'"
            )

        try:
            stats_before = ResetService._get_database_stats(db)
 
            answers_deleted = db.query(Answer).delete()
            favorites_deleted = db.query(Favorite).delete()
            scoring_rules_deleted = db.query(DimensionScoringRule).delete()
            advices_deleted = db.query(DimensionAdvice).delete()
            dimensions_deleted = db.query(Dimension).delete()
            questions_deleted = db.query(Question).delete()
            quizzes_deleted = db.query(Quiz).delete()
            custom_types_deleted = ResetService._reset_quiz_types(db)
            
            db.commit()
            InitializationService.initialize_all_defaults()
            stats_after = ResetService._get_database_stats(db)
            
            return {
                "message": "Application réinitialisée avec succès",
                "deleted_items": {
                    "quizzes": quizzes_deleted,
                    "questions": questions_deleted,
                    "answers": answers_deleted,
                    "dimensions": dimensions_deleted,
                    "scoring_rules": scoring_rules_deleted,
                    "advices": advices_deleted,
                    "favorites": favorites_deleted,
                    "custom_quiz_types": custom_types_deleted
                },
                "stats_before": stats_before,
                "stats_after": stats_after,
                "reset_timestamp": db.execute(text("SELECT datetime('now')")).scalar()
            }
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de la réinitialisation: {str(e)}"
            )

    @staticmethod
    def _reset_quiz_types(db: Session) -> int:
        """
        Remet les types de quiz à leur état par défaut.
        
        Args:
            db: Session de base de données
            
        Returns:
            Nombre de types personnalisés supprimés
        """
        deleted_count = db.query(QuizType).delete()
        
        for type_name in DEFAULT_TYPES:
            quiz_type = QuizType(name=type_name)
            db.add(quiz_type)
        
        return deleted_count

    @staticmethod
    def _get_database_stats(db: Session) -> Dict[str, int]:
        """
        Récupère les statistiques actuelles de la base de données.
        
        Args:
            db: Session de base de données
            
        Returns:
            Dictionnaire avec le nombre d'éléments par type
        """
        return {
            "quizzes": db.query(Quiz).count(),
            "questions": db.query(Question).count(),
            "answers": db.query(Answer).count(),
            "dimensions": db.query(Dimension).count(),
            "scoring_rules": db.query(DimensionScoringRule).count(),
            "advices": db.query(DimensionAdvice).count(),
            "favorites": db.query(Favorite).count(),
            "quiz_types": db.query(QuizType).count()
        }

    @staticmethod
    def get_reset_preview(db: Session) -> Dict[str, Any]:
        """
        Donne un aperçu de ce qui sera supprimé lors de la réinitialisation.
        
        Args:
            db: Session de base de données
            
        Returns:
            Statistiques des éléments qui seront supprimés
        """
        stats = ResetService._get_database_stats(db)
        
        return {
            "message": "Aperçu de la réinitialisation",
            "items_to_delete": stats,
            "confirmation_required": "Pour procéder, utilisez confirm_reset=true"
        }