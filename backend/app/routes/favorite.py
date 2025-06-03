"""
Routes pour la gestion des favoris.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.favorite_service import FavoriteService
from app.schemas.favorite import Favorite, FavoriteCreate


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"],
    responses={404: {"description": "Favori non trouvé"}},
)


@router.get("/", response_model=List[Favorite])
async def get_favorites(
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des favoris, optionnellement filtrés par device_id.
    """
    return FavoriteService.get_favorites(
        db, skip=skip
    )


@router.post("/", response_model=Favorite, status_code=201)
async def add_to_favorites(favorite: FavoriteCreate, db: Session = Depends(get_db)):
    """
    Ajoute un questionnaire aux favoris.
    """
    return FavoriteService.create_favorite(db, favorite)


@router.delete("/{quiz_id}")
async def remove_from_favorites(quiz_id: int, db: Session = Depends(get_db)):
    """
    Supprime un questionnaire des favoris.
    """
    FavoriteService.delete_favorite(db, quiz_id)
    return {"message": "Questionnaire supprimé des favoris avec succès"}


@router.get("/check/{quiz_id}")
async def check_favorite(quiz_id: int, db: Session = Depends(get_db)):
    """
    Vérifie si un questionnaire est dans les favoris.
    """
    is_favorite = FavoriteService.is_favorite(db, quiz_id)
    return {"is_favorite": is_favorite}