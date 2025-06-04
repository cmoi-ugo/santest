"""
Service d'initialisation pour les données par défaut de l'application.
"""
import json
from pathlib import Path
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.config.constants import DEFAULT_QUIZZES_PATH
from app.services.quiz_import_service import QuizImportService


class InitializationService:
    """Service pour gérer l'initialisation des données par défaut."""
    
    @staticmethod
    def initialize_all_defaults() -> None:
        """Initialise toutes les données par défaut."""
        db = SessionLocal()
        try:
            InitializationService._load_default_quizzes(db)

        except Exception as e:
            db.rollback()
            raise
        finally:
            db.close()
    
    @staticmethod
    def _load_default_quizzes(db: Session) -> None:
        """Charge les questionnaires par défaut depuis les fichiers JSON."""
        if not DEFAULT_QUIZZES_PATH.exists():
            return
        
        json_files = list(DEFAULT_QUIZZES_PATH.glob("*.json"))
        
        if not json_files:
            return
        
        for json_file in json_files:
            try:
                InitializationService._load_quiz_from_file(db, json_file)
            except Exception as e:
                ...
    
    @staticmethod
    def _load_quiz_from_file(db: Session, json_file_path: Path) -> None:
        """Charge un questionnaire depuis un fichier JSON."""
        
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                file_data = json.load(file)
            
            quiz_data = file_data.get("content", file_data)
            
            QuizImportService.import_quiz_from_data(db, quiz_data, check_existing=True)
            
        except json.JSONDecodeError as e:
            raise Exception(f"Format JSON invalide : {str(e)}")
        except FileNotFoundError:
            raise Exception(f"Fichier non trouvé : {json_file_path}")
        except Exception as e:
            raise Exception(f"Erreur lors du traitement : {str(e)}")