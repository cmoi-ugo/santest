"""
Modèles de données pour les types de questionnaires.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.config.database import Base


class QuizType(Base):
    """Modèle pour les types de questionnaires."""
    __tablename__ = "quiz_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    quizzes = relationship("Quiz", back_populates="quiz_type")

    def __repr__(self):
        return f"<QuizType(id={self.id}, name='{self.name}')>"