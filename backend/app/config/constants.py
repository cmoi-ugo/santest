from dotenv import load_dotenv
from enum import Enum
import os


load_dotenv()

class Environment(str, Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"

# App Config
APP_VERSION = "1.0.0"

# CORS
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Dev
    "https://votre-site.com"  # Prod (todo)
]

# Database
DATABASE_URL = "sqlite:///./test.db"  # (todo) dans .env en prod

# Codes HTTP 
HTTP_400_BAD_REQUEST = 400
HTTP_401_UNAUTHORIZED = 401
HTTP_404_NOT_FOUND = 404

# JWT
TOKEN_TYPE = "bearer"

# Messages d'authentification
ACCOUNT_ALREADY_EXISTS = "Cette email est déjà reliée à un compte"
USER_CREATED = "Utilisateur créé"
INVALID_IDS = "Identifiants invalides"
LOGIN_SUCCESS = "Connexion réussie"

# Réponses API
RESPONSE_MODELS = {
    "register": {
        "success": {"msg": USER_CREATED},
        "error": {"detail": ACCOUNT_ALREADY_EXISTS}
    },
    "login": {
        "success": {"access_token": str, "token_type": TOKEN_TYPE},
        "error": {"detail": INVALID_IDS}
    }
}
