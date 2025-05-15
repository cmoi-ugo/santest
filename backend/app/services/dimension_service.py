"""
Service pour la gestion des dimensions et du scoring.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from typing import List, Dict, Any
import json

from app.models.dimension import Dimension, DimensionScoringRule, DimensionAdvice
from app.models.question import Question, Answer
from app.models.quiz import Quiz
from app.schemas.dimension import (
    DimensionCreate, DimensionUpdate,
    DimensionScoringRuleCreate, DimensionScoringRuleUpdate,
    DimensionAdviceCreate, DimensionAdviceUpdate,
    DimensionScore, QuizScoreResult
)


class DimensionService:
    """Service pour gérer les opérations sur les dimensions."""

    @staticmethod
    def get_dimensions(db: Session, skip: int = 0, limit: int = 100, quiz_id: int = None):
        """
        Récupère la liste des dimensions, optionnellement filtrées par quiz.
        """
        query = db.query(Dimension)
        if quiz_id is not None:
            query = query.filter(Dimension.quiz_id == quiz_id)
        return query.order_by(Dimension.order).offset(skip).limit(limit).all()

    @staticmethod
    def get_dimension(db: Session, dimension_id: int):
        """
        Récupère une dimension par son ID.
        """
        dimension = db.query(Dimension).filter(Dimension.id == dimension_id).first()
        if not dimension:
            raise HTTPException(status_code=404, detail="Dimension not found")
        return dimension

    @staticmethod
    def create_dimension(db: Session, dimension_data: DimensionCreate):
        """
        Crée une nouvelle dimension.
        """
        quiz = db.query(Quiz).filter(Quiz.id == dimension_data.quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
            
        dimension_dict = dimension_data.dict()
        
        if dimension_dict.get('order') is None or dimension_dict.get('order') == 0:
            max_order = db.query(func.max(Dimension.order)).filter(
                Dimension.quiz_id == dimension_dict['quiz_id']
            ).scalar()
            dimension_dict['order'] = (max_order or 0) + 1
        
        dimension = Dimension(**dimension_dict)
        db.add(dimension)
        db.commit()
        db.refresh(dimension)
        return dimension

    @staticmethod
    def update_dimension(db: Session, dimension_id: int, dimension_data: DimensionUpdate):
        """
        Met à jour une dimension existante.
        """
        dimension = DimensionService.get_dimension(db, dimension_id)

        update_data = dimension_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(dimension, key, value)
            
        db.commit()
        db.refresh(dimension)
        return dimension

    @staticmethod
    def delete_dimension(db: Session, dimension_id: int):
        """
        Supprime une dimension.
        """
        dimension = DimensionService.get_dimension(db, dimension_id)
        db.delete(dimension)
        db.commit()
        return True

    @staticmethod
    def link_question_to_dimension(db: Session, question_id: int, dimension_id: int, weight: float = 1.0):
        """
        Lie une question à une dimension avec un poids optionnel.
        """
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
            
        dimension = db.query(Dimension).filter(Dimension.id == dimension_id).first()
        if not dimension:
            raise HTTPException(status_code=404, detail="Dimension not found")
            
        if question.quiz_id != dimension.quiz_id:
            raise HTTPException(status_code=400, detail="Question and dimension must belong to the same quiz")
            
        if dimension not in question.dimensions:
            question.dimensions.append(dimension)
            db.commit()
            
        return True

    @staticmethod
    def create_scoring_rule(db: Session, rule_data: DimensionScoringRuleCreate):
        """
        Crée une nouvelle règle de scoring.
        """
        dimension = DimensionService.get_dimension(db, rule_data.dimension_id)
        question = db.query(Question).filter(Question.id == rule_data.question_id).first()
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
            
        if question.quiz_id != dimension.quiz_id:
            raise HTTPException(status_code=400, detail="Question and dimension must belong to the same quiz")
            
        rule = DimensionScoringRule(**rule_data.dict())
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return rule

    @staticmethod
    def create_advice(db: Session, advice_data: DimensionAdviceCreate):
        """
        Crée un nouveau conseil.
        """
        dimension = DimensionService.get_dimension(db, advice_data.dimension_id)
        
        advice = DimensionAdvice(**advice_data.dict())
        db.add(advice)
        db.commit()
        db.refresh(advice)
        return advice

    @staticmethod
    def calculate_dimension_scores(db: Session, session_id: str) -> QuizScoreResult:
        """
        Calcule les scores de toutes les dimensions pour une session de réponses donnée.
        """
        answers = db.query(Answer).filter(Answer.session_id == session_id).all()
        if not answers:
            raise HTTPException(status_code=404, detail="No answers found for this session")
            
        quiz_id = answers[0].question.quiz_id
        
        dimensions = db.query(Dimension).filter(Dimension.quiz_id == quiz_id).all()
        
        dimension_scores = []
        
        for dimension in dimensions:
            total_score = 0
            max_possible_score = 0
            
            scoring_rules = db.query(DimensionScoringRule).filter(
                DimensionScoringRule.dimension_id == dimension.id
            ).all()
            
            for rule in scoring_rules:
                max_possible_score += abs(rule.score)
                
                answer = next((a for a in answers if a.question_id == rule.question_id), None)
                if answer:
                    if str(answer.value) == str(rule.answer_value):
                        total_score += rule.score
                    elif isinstance(answer.value, list) and rule.answer_value in answer.value:
                        total_score += rule.score
            
            percentage = (total_score / max_possible_score * 100) if max_possible_score > 0 else 0
            
            advice = db.query(DimensionAdvice).filter(
                DimensionAdvice.dimension_id == dimension.id,
                DimensionAdvice.min_score <= percentage,
                DimensionAdvice.max_score >= percentage
            ).first()
            
            dimension_score = DimensionScore(
                dimension_id=dimension.id,
                dimension_name=dimension.name,
                score=total_score,
                max_score=max_possible_score,
                percentage=percentage,
                advice=advice
            )
            dimension_scores.append(dimension_score)
        
        return QuizScoreResult(
            session_id=session_id,
            quiz_id=quiz_id,
            dimension_scores=dimension_scores,
            completion_date=answers[0].created_at if answers else None
        )

    @staticmethod
    def get_dimension_scoring_rules(db: Session, dimension_id: int):
        """
        Récupère toutes les règles de scoring d'une dimension.
        """
        dimension = DimensionService.get_dimension(db, dimension_id)
        return db.query(DimensionScoringRule).filter(
            DimensionScoringRule.dimension_id == dimension_id
        ).all()

    @staticmethod
    def get_dimension_advices(db: Session, dimension_id: int):
        """
        Récupère tous les conseils d'une dimension.
        """
        dimension = DimensionService.get_dimension(db, dimension_id)
        return db.query(DimensionAdvice).filter(
            DimensionAdvice.dimension_id == dimension_id
        ).order_by(DimensionAdvice.min_score).all()
    
    @staticmethod
    def update_advice(db: Session, advice_id: int, advice_data: DimensionAdviceUpdate):
        """
        Met à jour un conseil existant.
        """
        advice = db.query(DimensionAdvice).filter(DimensionAdvice.id == advice_id).first()
        if not advice:
            raise HTTPException(status_code=404, detail="Advice not found")
        
        update_data = advice_data.dict(exclude_unset=True)
        
        if 'min_score' in update_data and 'max_score' in update_data:
            if update_data['max_score'] <= update_data['min_score']:
                raise HTTPException(status_code=400, detail="max_score doit être supérieur à min_score")
        
        for key, value in update_data.items():
            setattr(advice, key, value)
        
        db.commit()
        db.refresh(advice)
        return advice

    @staticmethod
    def delete_advice(db: Session, advice_id: int):
        """
        Supprime un conseil.
        """
        advice = db.query(DimensionAdvice).filter(DimensionAdvice.id == advice_id).first()
        if not advice:
            raise HTTPException(status_code=404, detail="Advice not found")
        
        db.delete(advice)
        db.commit()
        return True