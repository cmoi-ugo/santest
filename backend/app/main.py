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
from .config.constants import ALLOWED_ORIGINS, APP_VERSION, CURRENT_ENV, Environment
from .routes import quiz, question, answer, dimension, quiz_exchange, favorite, quiz_type, reset


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionnaire de cycle de vie pour l'application FastAPI."""
    init_db()
    InitializationService.initialize_all_defaults()
    yield


app = FastAPI(
    title="SANTEST API", 
    version=APP_VERSION,
    description="API pour l'application SANTEST",
    lifespan=lifespan,
    docs_url="/docs" if CURRENT_ENV != Environment.PRODUCTION else None,
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Middleware pour mesurer le temps de traitement des requêtes."""
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


# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS[CURRENT_ENV],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(quiz.router)
app.include_router(question.router)
app.include_router(answer.router)
app.include_router(dimension.router)
app.include_router(quiz_exchange.router)
app.include_router(favorite.router)
app.include_router(quiz_type.router)
app.include_router(reset.router)


@app.get("/health", tags=["System"])
async def health_check():
    """Endpoint de vérification de l'état de santé de l'API."""
    return {
        "status": "ok",
        "version": APP_VERSION,
        "environment": CURRENT_ENV
    }