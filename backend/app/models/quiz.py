"""
Modèles de données pour les quiz.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.config.database import Base


class Quiz(Base):
    """Modèle pour les quiz."""
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    dimensions = relationship("Dimension", back_populates="quiz", cascade="all, delete-orphan")
    quiz_types = relationship("QuizType", secondary="quiz_quiz_types", back_populates="quizzes")

    def __repr__(self):
        return f"<Quiz(id={self.id}, title='{self.title}')>"