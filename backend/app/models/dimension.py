"""
Modèles de données pour les dimensions et conseils.
"""
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.config.database import Base


class Dimension(Base):
    """Modèle pour les dimensions d'évaluation."""
    __tablename__ = "dimensions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    
    # Relations
    quiz = relationship("Quiz", back_populates="dimensions")
    scoring_rules = relationship("DimensionScoringRule", back_populates="dimension", cascade="all, delete-orphan")
    advices = relationship("DimensionAdvice", back_populates="dimension", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Dimension(id={self.id}, name='{self.name}')>"


class DimensionScoringRule(Base):
    """Modèle pour les règles de scoring des dimensions."""
    __tablename__ = "dimension_scoring_rules"

    id = Column(Integer, primary_key=True, index=True)
    dimension_id = Column(Integer, ForeignKey("dimensions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    answer_value = Column(Text, nullable=False) 
    score = Column(Float, nullable=False)
    
    # Relations
    dimension = relationship("Dimension", back_populates="scoring_rules")
    question = relationship("Question")

    def __repr__(self):
        return f"<DimensionScoringRule(id={self.id}, score={self.score})>"


class DimensionAdvice(Base):
    """Modèle pour les conseils basés sur le score d'une dimension."""
    __tablename__ = "dimension_advices"

    id = Column(Integer, primary_key=True, index=True)
    dimension_id = Column(Integer, ForeignKey("dimensions.id", ondelete="CASCADE"), nullable=False)
    min_score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    title = Column(String(255), nullable=False)
    advice = Column(Text, nullable=False)
    severity = Column(String(50), default="info")  # info, warning, danger
    
    # Relations
    dimension = relationship("Dimension", back_populates="advices")

    def __repr__(self):
        return f"<DimensionAdvice(id={self.id}, range=[{self.min_score}, {self.max_score}])>"