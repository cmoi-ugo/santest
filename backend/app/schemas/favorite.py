"""
Schémas Pydantic pour les favoris.
"""
from datetime import datetime
from pydantic import BaseModel


class FavoriteBase(BaseModel):
    """Schéma de base pour les favoris."""
    quiz_id: int


class FavoriteCreate(FavoriteBase):
    """Schéma pour la création d'un favori."""
    pass


class FavoriteInDB(FavoriteBase):
    """Schéma pour un favori en base de données."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Favorite(FavoriteInDB):
    """Schéma pour un favori retourné par l'API."""
    pass