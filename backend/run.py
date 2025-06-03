"""
Script de démarrage pour l'API. 
Utilise uvicorn pour démarrer le serveur avec la configuration appropriée selon l'environnement.
"""
import os
import uvicorn
from app.config.constants import Environment


if __name__ == "__main__":
    env = os.getenv("APP_ENV", Environment.DEVELOPMENT)
    
    config = {
        "app": "app.main:app",
        "host": "0.0.0.0",
        "port": int(os.getenv("PORT", 8000)),
        "reload": env == Environment.DEVELOPMENT,
        "workers": 1 if env == Environment.DEVELOPMENT else 4,
        "log_level": "debug" if env == Environment.DEVELOPMENT else "info",
    }
    
    print(f"Démarrage du serveur en environnement {env}")
    uvicorn.run(**config)