"""
Modèles de données pour les types de questionnaires.
"""
from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.config.database import Base


# Table d'association pour la relation many-to-many entre quiz et types
quiz_quiz_type = Table(
    'quiz_quiz_types',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('quiz_id', Integer, ForeignKey('quizzes.id', ondelete='CASCADE')),
    Column('quiz_type_id', Integer, ForeignKey('quiz_types.id', ondelete='CASCADE')),
)


class QuizType(Base):
    """Modèle pour les types de questionnaires."""
    __tablename__ = "quiz_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relations
    quizzes = relationship("Quiz", secondary=quiz_quiz_type, back_populates="quiz_types")

    def __repr__(self):
        return f"<QuizType(id={self.id}, name='{self.name}')>"