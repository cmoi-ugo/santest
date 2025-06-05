"""
Constantes globales pour l'application.
Ce module centralise toutes les constantes, messages et configurations de l'API.
"""
from dotenv import load_dotenv
from enum import Enum
from pathlib import Path
import os

load_dotenv()

# Environnements
class Environment(str, Enum):
    """Environnements d'exécution possibles pour l'application."""
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"
    DESKTOP = "desktop"

CURRENT_ENV = Environment(os.getenv("APP_ENV", Environment.DEVELOPMENT))

# App Config
APP_VERSION = "1.0.0"
APP_NAME = "SANTEST"

# CORS
ALLOWED_ORIGINS = {
    Environment.DEVELOPMENT: ["http://localhost:5173"],
    Environment.PRODUCTION: ["https://santest.com"],
    Environment.TESTING: ["http://localhost:5173"],
    Environment.DESKTOP: ["*"],
}

# Database - URL par défaut (surchargée en mode desktop)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./santest.db")

# Chemins
DEFAULT_QUIZZES_PATH = Path(__file__).parent.parent.parent / "default_quizzes"
