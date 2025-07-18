"""
Service pour la gestion des réponses aux questions.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Dict, Any

from app.models.question import Answer, Question
from app.schemas.question import AnswerCreate


class AnswerService:
    """Service pour gérer les opérations sur les réponses."""

    @staticmethod
    def get_answers(db: Session, skip: int = 0, 
                   question_id: int = None, session_id: str = None):
        """
        Récupère la liste des réponses, optionnellement filtrées par question ou session.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            question_id: ID de la question pour filtrer les réponses
            session_id: ID de la session pour filtrer les réponses
            
        Returns:
            Liste des réponses
        """
        query = db.query(Answer)
        if question_id is not None:
            query = query.filter(Answer.question_id == question_id)
        if session_id is not None:
            query = query.filter(Answer.session_id == session_id)
        return query.offset(skip).all()

    @staticmethod
    def create_answer(db: Session, answer_data: AnswerCreate):
        """
        Crée une nouvelle réponse.
        
        Args:
            db: Session de base de données
            answer_data: Données de la réponse à créer
            
        Returns:
            La réponse créée
        """
        question = db.query(Question).filter(Question.id == answer_data.question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
            
        answer = Answer(**answer_data.dict())
        db.add(answer)
        db.commit()
        db.refresh(answer)
        return answer

    @staticmethod
    def submit_answers(db: Session, session_id: str, answers_data: List[Dict[str, Any]]):
        """
        Soumet plusieurs réponses en une fois.
        
        Args:
            db: Session de base de données
            session_id: ID de session
            answers_data: Liste des données de réponses
            
        Returns:
            Liste des réponses créées
        """
        created_answers = []
        
        for answer_item in answers_data:
            question_id = answer_item.get("question_id")
            value = answer_item.get("value")
            
            question = db.query(Question).filter(Question.id == question_id).first()
            if not question:
                continue
                
            answer = Answer(
                question_id=question_id,
                session_id=session_id,
                value=value
            )
            db.add(answer)
            created_answers.append(answer)
            
        db.commit()
        
        for answer in created_answers:
            db.refresh(answer)
            
        return created_answers
    
    @staticmethod
    def delete_answers_by_session(db: Session, session_id: str):
        """
        Supprime toutes les réponses d'une session donnée.
        
        Args:
            db: Session de base de données
            session_id: ID de la session dont les réponses doivent être supprimées
            
        Returns:
            bool: True si les réponses ont été supprimées
        """
        answers = db.query(Answer).filter(Answer.session_id == session_id).all()
        
        if not answers:
            return False
            
        for answer in answers:
            db.delete(answer)
        
        db.commit()
        return True