"""
Service pour la gestion des types de questionnaires.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional

from app.models.quiz_type import QuizType
from app.schemas.quiz_type import QuizTypeCreate, QuizTypeUpdate


class QuizTypeService:
    """Service pour gérer les opérations sur les types de questionnaires."""

    @staticmethod
    def get_quiz_types(db: Session, skip: int = 0) -> List[QuizType]:
        """
        Récupère la liste des types de questionnaires.
        
        Args:
            db: Session de base de données
            skip: Nombre d'éléments à sauter
            
        Returns:
            Liste des types de questionnaires
        """
        return db.query(QuizType).order_by(QuizType.name).offset(skip).all()

    @staticmethod
    def get_quiz_type(db: Session, quiz_type_id: int) -> QuizType:
        """
        Récupère un type de questionnaire par son ID.
        
        Args:
            db: Session de base de données
            quiz_type_id: ID du type à récupérer
            
        Returns:
            Le type trouvé
            
        Raises:
            HTTPException: Si le type n'existe pas
        """
        quiz_type = db.query(QuizType).filter(QuizType.id == quiz_type_id).first()
        if not quiz_type:
            raise HTTPException(status_code=404, detail="Quiz type not found")
        return quiz_type

    @staticmethod
    def get_quiz_type_by_name(db: Session, name: str) -> Optional[QuizType]:
        """
        Récupère un type de questionnaire par son nom.
        
        Args:
            db: Session de base de données
            name: Nom du type à rechercher
            
        Returns:
            Le type trouvé ou None
        """
        return db.query(QuizType).filter(QuizType.name == name).first()

    @staticmethod
    def create_quiz_type(db: Session, quiz_type_data: QuizTypeCreate) -> QuizType:
        """
        Crée un nouveau type de questionnaire.
        
        Args:
            db: Session de base de données
            quiz_type_data: Données du type à créer
            
        Returns:
            Le type créé
            
        Raises:
            HTTPException: Si un type avec ce nom existe déjà
        """

        existing_type = QuizTypeService.get_quiz_type_by_name(db, quiz_type_data.name)
        if existing_type:
            raise HTTPException(
                status_code=400, 
                detail=f"Un type avec le nom '{quiz_type_data.name}' existe déjà"
            )
        
        quiz_type = QuizType(**quiz_type_data.dict())
        db.add(quiz_type)
        db.commit()
        db.refresh(quiz_type)
        return quiz_type

    @staticmethod
    def update_quiz_type(db: Session, quiz_type_id: int, quiz_type_data: QuizTypeUpdate) -> QuizType:
        """
        Met à jour un type de questionnaire existant.
        
        Args:
            db: Session de base de données
            quiz_type_id: ID du type à mettre à jour
            quiz_type_data: Nouvelles données du type
            
        Returns:
            Le type mis à jour
            
        Raises:
            HTTPException: Si le type n'existe pas ou si le nom est déjà utilisé
        """
        quiz_type = QuizTypeService.get_quiz_type(db, quiz_type_id)
        
        update_data = quiz_type_data.dict(exclude_unset=True)
        
        if 'name' in update_data and update_data['name'] != quiz_type.name:
            existing_type = QuizTypeService.get_quiz_type_by_name(db, update_data['name'])
            if existing_type:
                raise HTTPException(
                    status_code=400,
                    detail=f"Un type avec le nom '{update_data['name']}' existe déjà"
                )
        
        for key, value in update_data.items():
            setattr(quiz_type, key, value)
            
        db.commit()
        db.refresh(quiz_type)
        return quiz_type

    @staticmethod
    def delete_quiz_type(db: Session, quiz_type_id: int) -> bool:
        """
        Supprime un type de questionnaire.
        
        Args:
            db: Session de base de données
            quiz_type_id: ID du type à supprimer
            
        Returns:
            True si le type a été supprimé
            
        Raises:
            HTTPException: Si le type n'existe pas ou est utilisé par des questionnaires
        """
        quiz_type = QuizTypeService.get_quiz_type(db, quiz_type_id)
        
        if quiz_type.quizzes:
            raise HTTPException(
                status_code=400,
                detail=f"Impossible de supprimer le type '{quiz_type.name}' car il est utilisé par {len(quiz_type.quizzes)} questionnaire(s)"
            )
        
        db.delete(quiz_type)
        db.commit()
        return True

    @staticmethod
    def create_default_types(db: Session) -> List[QuizType]:
        """
        Crée les types par défaut s'ils n'existent pas.
        
        Args:
            db: Session de base de données
            
        Returns:
            Liste des types créés
        """
        default_types = [
            "Addictions",
            "Santé",
            "Psychologie", 
            "Bien-être",
            "Professionnel"
        ]
        
        created_types = []
        for type_name in default_types:
            existing = QuizTypeService.get_quiz_type_by_name(db, type_name)
            if not existing:
                quiz_type_create = QuizTypeCreate(name=type_name)
                created_type = QuizTypeService.create_quiz_type(db, quiz_type_create)
                created_types.append(created_type)
        
        return created_types