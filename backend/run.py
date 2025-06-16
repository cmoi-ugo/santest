"""
Script de démarrage pour l'API. 
Utilise uvicorn pour démarrer le serveur avec la configuration appropriée selon l'environnement.
"""
import os
import sys
import uvicorn
import multiprocessing

from app.main import app


if __name__ == "__main__":
    config = {
        "app": app,
        "host": "0.0.0.0",
        "port": int(os.getenv("PORT", 8000)),
        "reload": False,
        "workers": 1,
    }
    
    try:
        multiprocessing.freeze_support()
        uvicorn.run(**config)
    except Exception as e:
        print(e)
        sys.exit(1)
