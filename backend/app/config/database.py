"""
Configuration de la base de données pour l'application.
Ce module définit la connexion à la base de données et fournit les fonctions utilitaires
pour interagir avec celle-ci.
"""
import os
import sys
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError

from .constants import DATABASE_URL, CURRENT_ENV, Environment


def get_app_data_directory():
    """Retourne le répertoire de données de l'application selon l'OS"""
    if os.name == 'nt':  # Windows
        return os.path.join(os.environ.get('APPDATA', ''), 'santest')
    elif sys.platform == 'darwin':  # macOS
        return os.path.join(os.path.expanduser('~'), 'Library', 'Application Support', 'santest')
    else:  # Linux
        return os.path.join(os.path.expanduser('~'), '.santest')


def get_database_url():
    """Retourne l'URL de la base de données selon l'environnement"""
    if CURRENT_ENV == Environment.DESKTOP:
        app_data_dir = get_app_data_directory()
        os.makedirs(app_data_dir, exist_ok=True)
        db_path = os.path.join(app_data_dir, 'santest.db')
        return f"sqlite:///{db_path}"
    else:
        return DATABASE_URL

FINAL_DATABASE_URL = get_database_url()

# Configuration de l'engine SQLAlchemy
connect_args = {}
pool_options = {}

if FINAL_DATABASE_URL.startswith("sqlite"):
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
    FINAL_DATABASE_URL, 
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
