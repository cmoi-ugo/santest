"""
Schémas Pydantic pour les types de questionnaires.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class QuizTypeBase(BaseModel):
    """Schéma de base pour les types de questionnaires."""
    name: str = Field(..., min_length=2, max_length=100)


class QuizTypeCreate(QuizTypeBase):
    """Schéma pour la création d'un type de questionnaire."""
    pass


class QuizTypeUpdate(BaseModel):
    """Schéma pour la mise à jour d'un type de questionnaire."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)


class QuizTypeInDB(QuizTypeBase):
    """Schéma pour un type de questionnaire en base de données."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuizType(QuizTypeInDB):
    """Schéma pour un type de questionnaire retourné par l'API."""
    pass