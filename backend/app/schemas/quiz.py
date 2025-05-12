"""
Schémas Pydantic pour les quiz.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class QuizBase(BaseModel):
    """Schéma de base pour les quiz."""
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None


class QuizCreate(QuizBase):
    """Schéma pour la création d'un quiz."""
    pass


class QuizUpdate(BaseModel):
    """Schéma pour la mise à jour d'un quiz."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None


class QuizInDB(QuizBase):
    """Schéma pour un quiz en base de données."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Quiz(QuizInDB):
    """Schéma pour un quiz retourné par l'API."""
    pass