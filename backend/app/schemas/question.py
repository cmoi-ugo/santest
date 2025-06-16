"""
Schémas Pydantic pour les questions et réponses.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.models.question import QuestionType


class OptionBase(BaseModel):
    """Schéma de base pour une option de question."""
    label: str
    value: str


class LinearScaleOptions(BaseModel):
    """Options pour une question de type échelle linéaire."""
    min_value: int = Field(..., ge=1, le=10, description="Valeur minimale (1-10)")
    max_value: int = Field(..., ge=1, le=10, description="Valeur maximale (1-10)")
    min_label: Optional[str] = None
    max_label: Optional[str] = None

    @field_validator('max_value')
    def max_greater_than_min(cls, v, info):
        if 'min_value' in info.data:
            min_val = info.data['min_value']
            if v <= min_val:
                raise ValueError('max_value doit être supérieur à min_value')
            if v - min_val > 9:
                raise ValueError('La plage de l\'échelle ne peut pas dépasser 10 valeurs')
        return v

    @field_validator('min_value')
    def validate_min_value(cls, v):
        if v < 1 or v > 10:
            raise ValueError('min_value doit être entre 1 et 10')
        return v


class QuestionBase(BaseModel):
    """Schéma de base pour les questions."""
    text: str = Field(..., min_length=3)
    question_type: str = Field(..., description="Type de question: multiple_choice, checkbox, dropdown, linear_scale, text")
    options: Optional[Union[List[OptionBase], LinearScaleOptions, None]] = None
    required: bool = False
    order: int = 0
    image_url: Optional[str] = None

    @field_validator('question_type')
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

    @field_validator('options')
    def check_options(cls, v, info):
        if 'question_type' not in info.data:
            return v
            
        q_type = info.data['question_type']
        
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
    image_url: Optional[str] = None
    
    @field_validator('question_type')
    def check_question_type(cls, v):
        valid_types = [
            QuestionType.MULTIPLE_CHOICE,
            QuestionType.CHECKBOX,
            QuestionType.DROPDOWN,
            QuestionType.LINEAR_SCALE,
            QuestionType.TEXT
        ]
        if v is not None and v not in valid_types:
            raise ValueError(f"Le type de question doit être l'un des suivants: {', '.join(valid_types)}")
        return v
    
    @field_validator('options')
    def check_options(cls, v, info):
        if 'question_type' not in info.data or info.data['question_type'] is None:
            return v
            
        q_type = info.data['question_type']
        
        # Vérifications spécifiques selon le type de question
        if q_type in [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOX, QuestionType.DROPDOWN]:
            if v is not None and (not isinstance(v, list) or len(v) < 2):
                raise ValueError(f"Les questions de type {q_type} doivent avoir au moins 2 options")
        elif q_type == QuestionType.LINEAR_SCALE:
            if v is not None and (not isinstance(v, dict) and not isinstance(v, LinearScaleOptions)):
                raise ValueError(f"Les questions de type {q_type} doivent avoir des options d'échelle (min, max)")
        elif q_type == QuestionType.TEXT:
            pass
            
        return v


class QuestionReorder(BaseModel):
    """Schéma pour réorganiser les questions."""
    quiz_id: int
    questions: List[Dict[str, int]] = Field(..., description="Liste des questions avec leur nouvel ordre")
    
    @field_validator('questions')
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

    model_config = ConfigDict(from_attributes=True)


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


class AnswerInDB(AnswerBase):
    """Schéma pour une réponse en base de données."""
    id: int
    session_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Answer(AnswerInDB):
    """Schéma pour une réponse retournée par l'API."""
    pass


class SubmitAnswers(BaseModel):
    """Schéma pour soumettre plusieurs réponses en une fois."""
    session_id: str = Field(..., description="Identifiant unique de la session")
    answers: List[Dict[str, Any]] = Field(..., description="Liste des réponses aux questions")