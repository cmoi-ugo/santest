"""
Routes pour la gestion des réponses aux questions.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.answer_service import AnswerService
from app.schemas.question import Answer, AnswerCreate, AnswerUpdate, SubmitAnswers


router = APIRouter(
    prefix="/answers",
    tags=["Answers"],
    responses={404: {"description": "Réponse non trouvée"}},
)


@router.get("/", response_model=List[Answer])
async def get_answers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    question_id: Optional[int] = None,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des réponses, optionnellement filtrées par question ou session.
    """
    return AnswerService.get_answers(
        db, skip=skip, limit=limit, question_id=question_id, session_id=session_id
    )


@router.get("/{answer_id}", response_model=Answer)
async def get_answer(answer_id: int, db: Session = Depends(get_db)):
    """
    Récupère une réponse par son ID.
    """
    return AnswerService.get_answer(db, answer_id)


@router.post("/", response_model=Answer, status_code=201)
async def create_answer(answer: AnswerCreate, db: Session = Depends(get_db)):
    """
    Crée une nouvelle réponse.
    """
    return AnswerService.create_answer(db, answer)


@router.post("/submit", response_model=List[Answer], status_code=201)
async def submit_answers(submission: SubmitAnswers, db: Session = Depends(get_db)):
    """
    Soumet plusieurs réponses en une fois.
    """
    return AnswerService.submit_answers(
        db, 
        session_id=submission.session_id, 
        answers_data=submission.answers
    )


@router.put("/{answer_id}", response_model=Answer)
async def update_answer(answer_id: int, answer: AnswerUpdate, db: Session = Depends(get_db)):
    """
    Met à jour une réponse existante.
    """
    return AnswerService.update_answer(db, answer_id, answer)


@router.delete("/{answer_id}")
async def delete_answer(answer_id: int, db: Session = Depends(get_db)):
    """
    Supprime une réponse.
    """
    AnswerService.delete_answer(db, answer_id)
    return {"message": "Réponse supprimée avec succès"}