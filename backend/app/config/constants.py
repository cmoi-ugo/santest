"""
Constantes globales pour l'application.
Ce module centralise toutes les constantes, messages et configurations de l'API.
"""
from dotenv import load_dotenv
from enum import Enum, IntEnum
from pathlib import Path
import os


load_dotenv()

# Environnement
class Environment(str, Enum):
    """Environnements d'exécution possibles pour l'application."""
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"

CURRENT_ENV = Environment(os.getenv("APP_ENV", Environment.DEVELOPMENT))

# App Config
APP_VERSION = "1.0.0"
APP_NAME = "Tom"

# CORS
ALLOWED_ORIGINS = {
    Environment.DEVELOPMENT: ["http://localhost:5173"],
    Environment.PRODUCTION: ["https://tom.com"],
    Environment.TESTING: ["http://localhost:5173"],
}

ACTIVE_ORIGINS = ALLOWED_ORIGINS[CURRENT_ENV]

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Codes HTTP
class HTTPStatus(IntEnum):
    """Codes HTTP couramment utilisés dans l'application."""
    OK = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    INTERNAL_ERROR = 500

# Types de questionnaires par défaut
DEFAULT_TYPES = [
    "Addictions",
    "Santé",
    "Psychologie", 
    "Professionnel",
]

DEFAULT_QUIZZES_PATH = Path(__file__).parent.parent.parent / "default_quizzes"