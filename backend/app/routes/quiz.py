"""
Routes pour la gestion des quiz.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.quiz_service import QuizService
from app.schemas.quiz import Quiz, QuizCreate, QuizUpdate


router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"],
    responses={404: {"description": "Quiz non trouvé"}},
)


@router.get("/", response_model=List[Quiz])
async def get_quizzes(
    skip: int = Query(0, ge=0),
    quiz_type_id: Optional[int] = Query(None, description="Filtrer par type de questionnaire"),
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des quiz, optionnellement filtrés par type.
    """
    return QuizService.get_quizzes(db, skip=skip, quiz_type_id=quiz_type_id)


@router.get("/stats-by-type", response_model=List[Dict[str, Any]])
async def get_quiz_stats_by_type(db: Session = Depends(get_db)):
    """
    Récupère les statistiques de quiz par type.
    """
    return QuizService.get_quiz_stats_by_type(db)


@router.get("/by-type/{quiz_type_id}", response_model=List[Quiz])
async def get_quizzes_by_type(
    quiz_type_id: int,
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Récupère tous les quiz d'un type donné.
    """
    return QuizService.get_quizzes_by_type(db, quiz_type_id, skip=skip)


@router.get("/{quiz_id}", response_model=Quiz)
async def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """
    Récupère un quiz par son ID.
    """
    return QuizService.get_quiz(db, quiz_id)


@router.post("/", response_model=Quiz, status_code=201)
async def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    """
    Crée un nouveau quiz.
    """
    return QuizService.create_quiz(db, quiz)


@router.put("/{quiz_id}", response_model=Quiz)
async def update_quiz(quiz_id: int, quiz: QuizUpdate, db: Session = Depends(get_db)):
    """
    Met à jour un quiz existant.
    """
    return QuizService.update_quiz(db, quiz_id, quiz)


@router.delete("/{quiz_id}")
async def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """
    Supprime un quiz.
    """
    QuizService.delete_quiz(db, quiz_id)
    return {"message": "Quiz supprimé avec succès"}