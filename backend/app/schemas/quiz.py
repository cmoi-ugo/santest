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
    quiz_type_id: Optional[int] = Field(None, description="ID du type associé")


class QuizUpdate(BaseModel):
    """Schéma pour la mise à jour d'un quiz."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None
    quiz_type_id: Optional[int] = Field(None, description="ID du type associé")


class QuizType(BaseModel):
    """Schéma pour les types dans les réponses Quiz."""
    id: int
    name: str

    class Config:
        from_attributes = True


class QuizInDB(QuizBase):
    """Schéma pour un quiz en base de données."""
    id: int
    quiz_type_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Quiz(QuizInDB):
    """Schéma pour un quiz retourné par l'API."""
    quiz_type: Optional[QuizType] = Field(None, description="Type associé au quiz")