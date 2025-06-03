"""
Routes pour la gestion des dimensions et du scoring.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.dimension_service import DimensionService
from app.schemas.dimension import (
    Dimension, DimensionCreate, DimensionUpdate,
    DimensionScoringRule, DimensionScoringRuleCreate,
    DimensionAdvice, DimensionAdviceCreate,
    QuizScoreResult, QuestionDimensionLink,
    DimensionAdviceUpdate
)


router = APIRouter(
    prefix="/dimensions",
    tags=["Dimensions"],
    responses={404: {"description": "Dimension non trouvée"}},
)


@router.get("/", response_model=List[Dimension])
async def get_dimensions(
    skip: int = Query(0, ge=0),
    quiz_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des dimensions, optionnellement filtrées par quiz.
    """
    return DimensionService.get_dimensions(db, skip=skip, quiz_id=quiz_id)


@router.get("/{dimension_id}", response_model=Dimension)
async def get_dimension(dimension_id: int, db: Session = Depends(get_db)):
    """
    Récupère une dimension par son ID.
    """
    return DimensionService.get_dimension(db, dimension_id)


@router.post("/", response_model=Dimension, status_code=201)
async def create_dimension(dimension: DimensionCreate, db: Session = Depends(get_db)):
    """
    Crée une nouvelle dimension.
    """
    return DimensionService.create_dimension(db, dimension)


@router.put("/{dimension_id}", response_model=Dimension)
async def update_dimension(dimension_id: int, dimension: DimensionUpdate, db: Session = Depends(get_db)):
    """
    Met à jour une dimension existante.
    """
    return DimensionService.update_dimension(db, dimension_id, dimension)


@router.delete("/{dimension_id}")
async def delete_dimension(dimension_id: int, db: Session = Depends(get_db)):
    """
    Supprime une dimension.
    """
    DimensionService.delete_dimension(db, dimension_id)
    return {"message": "Dimension supprimée avec succès"}


@router.post("/link-question")
async def link_question_to_dimension(link_data: QuestionDimensionLink, db: Session = Depends(get_db)):
    """
    Lie une question à une dimension.
    """
    result = DimensionService.link_question_to_dimension(
        db, 
        question_id=link_data.question_id,
        dimension_id=link_data.dimension_id,
        weight=link_data.weight
    )
    return {"message": "Question liée à la dimension avec succès", "success": result}


@router.get("/{dimension_id}/scoring-rules", response_model=List[DimensionScoringRule])
async def get_dimension_scoring_rules(dimension_id: int, db: Session = Depends(get_db)):
    """
    Récupère toutes les règles de scoring d'une dimension.
    """
    return DimensionService.get_dimension_scoring_rules(db, dimension_id)


@router.post("/scoring-rules", response_model=DimensionScoringRule, status_code=201)
async def create_scoring_rule(rule: DimensionScoringRuleCreate, db: Session = Depends(get_db)):
    """
    Crée une nouvelle règle de scoring.
    """
    return DimensionService.create_scoring_rule(db, rule)


@router.delete("/scoring-rules/{rule_id}")
async def delete_scoring_rule(rule_id: int, db: Session = Depends(get_db)):
    """
    Supprime une règle de scoring.
    """
    DimensionService.delete_scoring_rule(db, rule_id)
    return {"message": "Règle de scoring supprimée avec succès"}


@router.get("/{dimension_id}/advices", response_model=List[DimensionAdvice])
async def get_dimension_advices(dimension_id: int, db: Session = Depends(get_db)):
    """
    Récupère tous les conseils d'une dimension.
    """
    return DimensionService.get_dimension_advices(db, dimension_id)


@router.post("/advices", response_model=DimensionAdvice, status_code=201)
async def create_advice(advice: DimensionAdviceCreate, db: Session = Depends(get_db)):
    """
    Crée un nouveau conseil pour une dimension.
    """
    return DimensionService.create_advice(db, advice)


@router.put("/advices/{advice_id}", response_model=DimensionAdvice)
async def update_advice(advice_id: int, advice: DimensionAdviceUpdate, db: Session = Depends(get_db)):
    """
    Met à jour un conseil existant.
    """
    return DimensionService.update_advice(db, advice_id, advice)


@router.delete("/advices/{advice_id}")
async def delete_advice(advice_id: int, db: Session = Depends(get_db)):
    """
    Supprime un conseil.
    """
    DimensionService.delete_advice(db, advice_id)
    return {"message": "Conseil supprimé avec succès"}


@router.get("/calculate-scores/{session_id}", response_model=QuizScoreResult)
async def calculate_scores(session_id: str, db: Session = Depends(get_db)):
    """
    Calcule les scores de toutes les dimensions pour une session de réponses.
    """
    return DimensionService.calculate_dimension_scores(db, session_id)