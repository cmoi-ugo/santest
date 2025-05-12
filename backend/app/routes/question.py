"""
Routes pour la gestion des questions.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.question_service import QuestionService
from app.schemas.question import Question, QuestionCreate, QuestionUpdate


router = APIRouter(
    prefix="/questions",
    tags=["Questions"],
    responses={404: {"description": "Question non trouvée"}},
)


@router.get("/", response_model=List[Question])
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    quiz_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des questions, optionnellement filtrées par quiz.
    """
    return QuestionService.get_questions(db, skip=skip, limit=limit, quiz_id=quiz_id)


@router.get("/{question_id}", response_model=Question)
async def get_question(question_id: int, db: Session = Depends(get_db)):
    """
    Récupère une question par son ID.
    """
    return QuestionService.get_question(db, question_id)


@router.post("/", response_model=Question, status_code=201)
async def create_question(question: QuestionCreate, db: Session = Depends(get_db)):
    """
    Crée une nouvelle question.
    """
    return QuestionService.create_question(db, question)


@router.put("/{question_id}", response_model=Question)
async def update_question(question_id: int, question: QuestionUpdate, db: Session = Depends(get_db)):
    """
    Met à jour une question existante.
    """
    return QuestionService.update_question(db, question_id, question)


@router.delete("/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    """
    Supprime une question.
    """
    QuestionService.delete_question(db, question_id)
    return {"message": "Question supprimée avec succès"}