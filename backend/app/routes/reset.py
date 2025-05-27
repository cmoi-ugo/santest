"""
Routes pour la réinitialisation de l'application.
"""
from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.reset_service import ResetService


router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
    responses={404: {"description": "Ressource non trouvée"}},
)


@router.get("/reset/preview", response_model=Dict[str, Any])
async def get_reset_preview(db: Session = Depends(get_db)):
    """
    Donne un aperçu de ce qui sera supprimé lors de la réinitialisation.
    """
    return ResetService.get_reset_preview(db)


@router.post("/reset", response_model=Dict[str, Any])
async def reset_application(
    confirm_reset: bool = Query(False, description="Confirmation explicite de la réinitialisation"),
    db: Session = Depends(get_db)
):
    """
    Réinitialise complètement l'application.
    
    Supprime toutes les données utilisateur :
    - Tous les quiz et leurs questions
    - Toutes les réponses des utilisateurs  
    - Toutes les dimensions et règles de scoring
    - Tous les favoris
    - Types de quiz personnalisés (remet les types par défaut)
    
    Paramètres :
    - confirm_reset : Doit être True pour confirmer la suppression
    """
    return ResetService.reset_application(db, confirm_reset)