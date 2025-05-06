from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth
from .config.database import engine, Base
from .config.constants import ALLOWED_ORIGINS, APP_VERSION


Base.metadata.create_all(bind=engine)

app = FastAPI(title="API", version=APP_VERSION) 

# Configuration CORS avec les constantes
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)