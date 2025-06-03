"""
Configuration de la base de données pour l'application.
Ce module définit la connexion à la base de données et fournit les fonctions utilitaires
pour interagir avec celle-ci.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError
from typing import Generator

from .constants import DATABASE_URL, CURRENT_ENV, Environment


# Configuration de l'engine SQLAlchemy selon l'environnement
connect_args = {}
pool_options = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    pool_options = {
        "poolclass": QueuePool,
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 3600,
    }

engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args,
    echo=False,
    **pool_options
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator:
    """
    Crée une nouvelle session de base de données et la ferme après utilisation.
    
    Yields:
        Session: Une session de base de données active
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        raise
    finally:
        db.close()

def init_db() -> None:
    """Initialise la base de données en créant toutes les tables définies."""
    try:        
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError as e:
        raise