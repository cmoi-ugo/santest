"""
Schémas Pydantic pour les questions et réponses.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator

from app.models.question import QuestionType


class OptionBase(BaseModel):
    """Schéma de base pour une option de question."""
    label: str
    value: str


class LinearScaleOptions(BaseModel):
    """Options pour une question de type échelle linéaire."""
    min_value: int = Field(..., ge=0)
    max_value: int = Field(..., gt=0)
    min_label: Optional[str] = None
    max_label: Optional[str] = None

    @validator('max_value')
    def max_greater_than_min(cls, v, values):
        if 'min_value' in values and v <= values['min_value']:
            raise ValueError('max_value doit être supérieur à min_value')
        return v


class QuestionBase(BaseModel):
    """Schéma de base pour les questions."""
    text: str = Field(..., min_length=3)
    question_type: str = Field(..., description="Type de question: multiple_choice, checkbox, dropdown, linear_scale, text")
    options: Optional[Union[List[OptionBase], LinearScaleOptions, None]] = None
    required: bool = False
    order: int = 0

    @validator('question_type')
    def check_question_type(cls, v):
        valid_types = [
            QuestionType.MULTIPLE_CHOICE,
            QuestionType.CHECKBOX,
            QuestionType.DROPDOWN,
            QuestionType.LINEAR_SCALE,
            QuestionType.TEXT
        ]
        if v not in valid_types:
            raise ValueError(f"Le type de question doit être l'un des suivants: {', '.join(valid_types)}")
        return v

    @validator('options')
    def check_options(cls, v, values):
        if 'question_type' not in values:
            return v
            
        q_type = values['question_type']
        
        # Vérifications spécifiques selon le type de question
        if q_type in [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN]:
            if not isinstance(v, list) or len(v) < 2:
                raise ValueError(f"Les questions de type {q_type} doivent avoir au moins 2 options")
        elif q_type == QuestionType.LINEAR_SCALE:
            if not isinstance(v, dict) and not isinstance(v, LinearScaleOptions):
                raise ValueError(f"Les questions de type {q_type} doivent avoir des options d'échelle (min, max)")
        elif q_type == QuestionType.TEXT:
            pass
            
        return v


class QuestionCreate(QuestionBase):
    """Schéma pour la création d'une question."""
    quiz_id: int


class QuestionUpdate(BaseModel):
    """Schéma pour la mise à jour d'une question."""
    text: Optional[str] = Field(None, min_length=3)
    question_type: Optional[str] = None
    options: Optional[Union[List[OptionBase], LinearScaleOptions, None]] = None
    required: Optional[bool] = None
    order: Optional[int] = None
    
    _check_type = validator('question_type', allow_reuse=True)(QuestionBase.check_question_type)
    _check_options = validator('options', allow_reuse=True)(QuestionBase.check_options)


class QuestionReorder(BaseModel):
    """Schéma pour réorganiser les questions."""
    quiz_id: int
    questions: List[Dict[str, int]] = Field(..., description="Liste des questions avec leur nouvel ordre")
    
    @validator('questions')
    def validate_questions(cls, v):
        for item in v:
            if 'id' not in item or 'order' not in item:
                raise ValueError("Chaque élément doit avoir 'id' et 'order'")
        return v


class QuestionInDB(QuestionBase):
    """Schéma pour une question en base de données."""
    id: int
    quiz_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Question(QuestionInDB):
    """Schéma pour une question retournée par l'API."""
    pass


class AnswerBase(BaseModel):
    """Schéma de base pour les réponses."""
    question_id: int
    value: Any 


class AnswerCreate(AnswerBase):
    """Schéma pour la création d'une réponse."""
    session_id: str


class AnswerUpdate(BaseModel):
    """Schéma pour la mise à jour d'une réponse."""
    value: Optional[Any] = None


class AnswerInDB(AnswerBase):
    """Schéma pour une réponse en base de données."""
    id: int
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class Answer(AnswerInDB):
    """Schéma pour une réponse retournée par l'API."""
    pass


class QuestionWithAnswers(Question):
    """Schéma pour une question avec ses réponses."""
    answers: List[Answer] = []


class SubmitAnswers(BaseModel):
    """Schéma pour soumettre plusieurs réponses en une fois."""
    session_id: str = Field(..., description="Identifiant unique de la session")
    answers: List[Dict[str, Any]] = Field(..., description="Liste des réponses aux questions")