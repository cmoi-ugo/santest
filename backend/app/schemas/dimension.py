"""
Schémas Pydantic pour les dimensions et conseils.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class DimensionBase(BaseModel):
    """Schéma de base pour les dimensions."""
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    order: int = 0


class DimensionCreate(DimensionBase):
    """Schéma pour la création d'une dimension."""
    quiz_id: int


class DimensionUpdate(BaseModel):
    """Schéma pour la mise à jour d'une dimension."""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    order: Optional[int] = None


class DimensionInDB(DimensionBase):
    """Schéma pour une dimension en base de données."""
    id: int
    quiz_id: int

    model_config = ConfigDict(from_attributes=True)


class Dimension(DimensionInDB):
    """Schéma pour une dimension retournée par l'API."""
    pass


class QuestionDimensionLink(BaseModel):
    """Schéma pour lier une question à une dimension."""
    question_id: int
    dimension_id: int
    weight: float = 1.0


class DimensionScoringRuleBase(BaseModel):
    """Schéma de base pour les règles de scoring."""
    question_id: int
    answer_value: str
    score: float


class DimensionScoringRuleCreate(DimensionScoringRuleBase):
    """Schéma pour la création d'une règle de scoring."""
    dimension_id: int


class DimensionScoringRuleInDB(DimensionScoringRuleBase):
    """Schéma pour une règle de scoring en base de données."""
    id: int
    dimension_id: int

    model_config = ConfigDict(from_attributes=True)


class DimensionScoringRule(DimensionScoringRuleInDB):
    """Schéma pour une règle de scoring retournée par l'API."""
    pass


class DimensionAdviceBase(BaseModel):
    """Schéma de base pour les conseils."""
    min_score: float
    max_score: float
    title: str = Field(..., min_length=3, max_length=255)
    advice: str
    severity: str = Field("info", pattern="^(info|warning|danger)$")
    
    @field_validator('max_score')
    def max_greater_than_min(cls, v, info):
        if 'min_score' in info.data and v <= info.data['min_score']:
            raise ValueError('max_score doit être supérieur à min_score')
        return v


class DimensionAdviceCreate(DimensionAdviceBase):
    """Schéma pour la création d'un conseil."""
    dimension_id: int


class DimensionAdviceUpdate(BaseModel):
    """Schéma pour la mise à jour d'un conseil."""
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    advice: Optional[str] = None
    severity: Optional[str] = Field(None, pattern="^(info|warning|danger)$")


class DimensionAdviceInDB(DimensionAdviceBase):
    """Schéma pour un conseil en base de données."""
    id: int
    dimension_id: int

    model_config = ConfigDict(from_attributes=True)


class DimensionAdvice(DimensionAdviceInDB):
    """Schéma pour un conseil retourné par l'API."""
    pass


class DimensionScore(BaseModel):
    """Schéma pour un score de dimension calculé."""
    dimension_id: int
    dimension_name: str
    score: float
    max_score: float
    percentage: float
    advice: Optional[DimensionAdvice] = None


class QuizScoreResult(BaseModel):
    """Schéma pour le résultat complet des scores d'un quiz."""
    session_id: str
    quiz_id: int
    dimension_scores: List[DimensionScore]
    completion_date: datetime