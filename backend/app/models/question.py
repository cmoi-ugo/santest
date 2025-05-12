"""
Modèles de données pour les questions et réponses.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.config.database import Base


class QuestionType(str):
    """Types de questions disponibles."""
    MULTIPLE_CHOICE = "multiple_choice"  # Choix unique parmi plusieurs
    CHECKBOX = "checkbox"  # Cases à cocher (plusieurs réponses)
    DROPDOWN = "dropdown"  # Liste déroulante
    LINEAR_SCALE = "linear_scale"  # Échelle linéaire
    TEXT = "text"  # Réponse textuelle


class Question(Base):
    """Modèle pour les questions."""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)
    options = Column(JSON, nullable=True)
    required = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Question(id={self.id}, type={self.question_type})>"


class Answer(Base):
    """Modèle pour les réponses aux questions."""
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String(255), nullable=False)
    value = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    question = relationship("Question", back_populates="answers")

    def __repr__(self):
        return f"<Answer(id={self.id}, question_id={self.question_id})>"