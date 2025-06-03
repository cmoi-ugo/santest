"""
Routes pour la gestion des types de questionnaires.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.quiz_type_service import QuizTypeService
from app.schemas.quiz_type import QuizType, QuizTypeCreate, QuizTypeUpdate


router = APIRouter(
    prefix="/quiz-types",
    tags=["Quiz Types"],
    responses={404: {"description": "Type de questionnaire non trouvé"}},
)


@router.get("/", response_model=List[QuizType])
async def get_quiz_types(
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des types de questionnaires.
    """
    return QuizTypeService.get_quiz_types(db, skip=skip)


@router.get("/{quiz_type_id}", response_model=QuizType)
async def get_quiz_type(quiz_type_id: int, db: Session = Depends(get_db)):
    """
    Récupère un type de questionnaire par son ID.
    """
    return QuizTypeService.get_quiz_type(db, quiz_type_id)


@router.post("/", response_model=QuizType, status_code=201)
async def create_quiz_type(quiz_type: QuizTypeCreate, db: Session = Depends(get_db)):
    """
    Crée un nouveau type de questionnaire.
    """
    return QuizTypeService.create_quiz_type(db, quiz_type)


@router.put("/{quiz_type_id}", response_model=QuizType)
async def update_quiz_type(quiz_type_id: int, quiz_type: QuizTypeUpdate, db: Session = Depends(get_db)):
    """
    Met à jour un type de questionnaire existant.
    """
    return QuizTypeService.update_quiz_type(db, quiz_type_id, quiz_type)


@router.delete("/{quiz_type_id}")
async def delete_quiz_type(quiz_type_id: int, db: Session = Depends(get_db)):
    """
    Supprime un type de questionnaire.
    """
    QuizTypeService.delete_quiz_type(db, quiz_type_id)
    return {"message": "Type de questionnaire supprimé avec succès"}


@router.post("/create-defaults", response_model=List[QuizType])
async def create_default_types(db: Session = Depends(get_db)):
    """
    Crée les types de questionnaires par défaut.
    """
    created_types = QuizTypeService.create_default_types(db)
    if created_types:
        return created_types
    else:
        return {"message": "Tous les types par défaut existent déjà"}