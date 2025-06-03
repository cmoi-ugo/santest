"""
Routes pour la gestion des réponses aux questions.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.answer_service import AnswerService
from app.schemas.question import Answer, AnswerCreate, SubmitAnswers


router = APIRouter(
    prefix="/answers",
    tags=["Answers"],
    responses={404: {"description": "Réponse non trouvée"}},
)


@router.get("/", response_model=List[Answer])
async def get_answers(
    skip: int = Query(0, ge=0),
    question_id: Optional[int] = None,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des réponses, optionnellement filtrées par question ou session.
    """
    return AnswerService.get_answers(
        db, skip=skip, question_id=question_id, session_id=session_id
    )


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


@router.delete("/by-session/{session_id}")
async def delete_answers_by_session(session_id: str, db: Session = Depends(get_db)):
    """
    Supprime toutes les réponses d'une session donnée.
    """
    AnswerService.delete_answers_by_session(db, session_id)
    return {"message": f"Toutes les réponses de la session {session_id} ont été supprimées"}