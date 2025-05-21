"""
Modèle de données pour les questionnaires favoris.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.config.database import Base


class Favorite(Base):
    """Modèle pour les questionnaires favoris."""
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    quiz = relationship("Quiz")
    
    __table_args__ = (
        UniqueConstraint('quiz_id', name='uix_favorite_quiz'),
    )

    def __repr__(self):
        return f"<Favorite(id={self.id}, quiz_id={self.quiz_id})>"