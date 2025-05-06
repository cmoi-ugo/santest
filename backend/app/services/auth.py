from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

from ..config.config import security_settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe correspond au hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Génère un hash sécurisé du mot de passe"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Génère un JWT avec une date d'expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or 
        timedelta(minutes=security_settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        security_settings.secret_key,
        algorithm=security_settings.algorithm
    )


def create_refresh_token(data: dict) -> str:
    expire = timedelta(days=security_settings.refresh_token_expire_days)
    return jwt.encode(
        {**data, "exp": datetime.utcnow() + expire},
        security_settings.secret_key,
        algorithm=security_settings.algorithm
    )


def renew_access_token(refresh_token: str) -> str:
    payload = jwt.decode(
        refresh_token,  
        security_settings.secret_key,
        algorithms=[security_settings.algorithm]
    )
    return create_access_token({"sub": payload["sub"]})
