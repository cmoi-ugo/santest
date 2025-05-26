from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.services.quiz_type_service import QuizTypeService

class InitializationService:
    """Service pour gérer l'initialisation des données par défaut."""
    
    @staticmethod
    def initialize_all_defaults() -> None:
        """Initialise toutes les données par défaut."""
        db = SessionLocal()
        try:
            print("Initialisation des données par défaut ...")
            
            InitializationService._init_quiz_types(db)
        
            print("Initialisation terminée avec succès")
            
        except Exception as e:
            print(f"Erreur lors de l'initialisation : {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    @staticmethod
    def _init_quiz_types(db: Session) -> None:
        """Initialise les types de questionnaires par défaut."""
        QuizTypeService.create_default_types(db)