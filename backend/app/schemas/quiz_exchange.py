"""
Schémas Pydantic pour les échanges de quiz.
"""
from typing import Optional, List, Any
from pydantic import BaseModel


class QuizExportData(BaseModel):
    """Structure du quiz dans l'export"""
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    quiz_type_id: Optional[int] = None


class QuizTypeExportData(BaseModel):
    """Structure des types dans l'export"""
    id: int
    name: str


class QuestionExportData(BaseModel):
    """Structure des questions dans l'export"""
    id: Optional[int] = None
    text: str
    question_type: str
    options: Any 
    required: bool
    order: int
    image_url: Optional[str] = None


class DimensionExportData(BaseModel):
    """Structure des dimensions dans l'export"""
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    order: int


class ScoringRuleExportData(BaseModel):
    """Structure des règles de scoring dans l'export"""
    dimension_id: int
    question_id: int
    answer_value: str
    score: float


class AdviceExportData(BaseModel):
    """Structure des conseils dans l'export"""
    dimension_id: int
    min_score: float
    max_score: float
    title: str
    advice: str
    severity: str


class QuizExport(BaseModel):
    """Schéma pour les données d'export d'un questionnaire."""
    quiz: QuizExportData
    quiz_type: Optional[QuizTypeExportData] = None
    questions: List[QuestionExportData]
    dimensions: List[DimensionExportData]
    dimension_advices: List[AdviceExportData]
    scoring_rules: List[ScoringRuleExportData]
    version: str = "1.0.0"