"""
Script de démarrage pour l'API. 
Utilise uvicorn pour démarrer le serveur avec la configuration appropriée selon l'environnement.
"""
import os
import sys
import uvicorn
from app.config.constants import Environment
from app.config.database import init_db


def is_desktop_environment():
    """Détecte si l'application est lancée dans un environnement desktop/Electron"""
    return (
        getattr(sys, 'frozen', False) or
        os.getenv("APP_ENV") == Environment.DESKTOP or
        '--desktop' in sys.argv
    )


if __name__ == "__main__":
    # Configuration automatique de l'environnement desktop
    if is_desktop_environment():
        os.environ["APP_ENV"] = Environment.DESKTOP
    
    env = os.getenv("APP_ENV", Environment.DEVELOPMENT)
    
    # Configuration selon l'environnement
    if env == Environment.DESKTOP:
        config = {
            "app": "app.main:app",
            "host": "127.0.0.1",
            "port": int(os.getenv("PORT", 8000)),
            "reload": False,
            "workers": 1,
            "log_level": "warning",
            "access_log": False,
        }
    elif env == Environment.DEVELOPMENT:
        config = {
            "app": "app.main:app",
            "host": "0.0.0.0",
            "port": int(os.getenv("PORT", 8000)),
            "reload": True,
            "workers": 1,
            "log_level": "debug",
        }
    else:
        config = {
            "app": "app.main:app",
            "host": "0.0.0.0",
            "port": int(os.getenv("PORT", 8000)),
            "reload": False,
            "workers": 4,
            "log_level": "info",
        }
    
    try:
        uvicorn.run(**config)
    except Exception as e:
        sys.exit(1)
