"""
Point d'entrée principal de l'API FastAPI.
Configure l'application, les middlewares, les routes et les événements de démarrage/arrêt.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

from .config.database import init_db
from .services.initialization_service import InitializationService
from .config.constants import ALLOWED_ORIGINS, APP_VERSION, Environment, CURRENT_ENV
from .routes import quiz, question, answer, dimension, quiz_exchange, favorite, quiz_type


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestionnaire de cycle de vie pour l'application FastAPI.
    """
    init_db()
    InitializationService.initialize_all_defaults()
    yield


app = FastAPI(
    title="CDC API", 
    version=APP_VERSION,
    description="API pour l'application CDC",
    lifespan=lifespan,
    docs_url="/docs" if CURRENT_ENV != Environment.PRODUCTION else None, 
    redoc_url="/redoc" if CURRENT_ENV != Environment.PRODUCTION else None,
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware pour mesurer le temps de traitement des requêtes.
    Ajoute un en-tête X-Process-Time à la réponse.
    """
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"detail": "Une erreur interne est survenue"}
        )


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS[CURRENT_ENV],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router)
app.include_router(question.router)
app.include_router(answer.router)
app.include_router(dimension.router)
app.include_router(quiz_exchange.router)
app.include_router(favorite.router)
app.include_router(quiz_type.router)


@app.get("/health", tags=["System"])
async def health_check():
    """
    Endpoint de vérification de l'état de santé de l'API.
    """
    return {
        "status": "ok",
        "version": APP_VERSION,
        "environment": CURRENT_ENV
    }


if __name__ == "__main__":
    import uvicorn
    
    reload = CURRENT_ENV == Environment.DEVELOPMENT
    
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=reload,
        log_level="critical"
    )