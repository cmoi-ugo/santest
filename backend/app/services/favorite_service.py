"""
Service pour la gestion des favoris.
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.models.favorite import Favorite
from app.models.quiz import Quiz
from app.schemas.favorite import FavoriteCreate


class FavoriteService:
    """Service pour gérer les opérations sur les favoris."""

    @staticmethod
    def get_favorites(db: Session, skip: int = 0):
        """
        Récupère la liste des favoris
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            
        Returns:
            Liste des favoris
        """
        query = db.query(Favorite)
        return query.offset(skip).all()


    @staticmethod
    def create_favorite(db: Session, favorite_data: FavoriteCreate):
        """
        Ajoute un questionnaire aux favoris.
        
        Args:
            db: Session de base de données
            favorite_data: Données du favori à créer
            
        Returns:
            Le favori créé
            
        Raises:
            HTTPException: Si le quiz n'existe pas ou si le favori existe déjà
        """
        quiz = db.query(Quiz).filter(Quiz.id == favorite_data.quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
            
        favorite = Favorite(**favorite_data.dict())
        
        try:
            db.add(favorite)
            db.commit()
            db.refresh(favorite)
            return favorite
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail="This quiz is already in favorites"
            )

    @staticmethod
    def delete_favorite(db: Session, quiz_id: int):
        """
        Supprime un favori.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz
            
        Returns:
            True si le favori a été supprimé
            
        Raises:
            HTTPException: Si le favori n'existe pas
        """
        favorite = db.query(Favorite).filter(
            Favorite.quiz_id == quiz_id
        ).first()
        
        if not favorite:
            raise HTTPException(status_code=404, detail="Favorite not found")
            
        db.delete(favorite)
        db.commit()
        return True
        
    @staticmethod
    def is_favorite(db: Session, quiz_id: int):
        """
        Vérifie si un quiz est dans les favoris.
        
        Args:
            db: Session de base de données
            quiz_id: ID du quiz
            
        Returns:
            True si le quiz est dans les favoris, False sinon
        """
        favorite = db.query(Favorite).filter(
            Favorite.quiz_id == quiz_id
        ).first()
        
        return favorite is not None