from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import create_tables, SessionLocal
from app.api.v1.router import api_router
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed data."""
    create_tables()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="AGRONEON API",
    description="Explainable AI-Powered Smart Farming Ecosystem",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Parse CORS origins properly (Handles both Pydantic string defaults and list parsing)
origins = []
if isinstance(settings.CORS_ORIGINS, str):
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
elif isinstance(settings.CORS_ORIGINS, list):
    for origin_item in settings.CORS_ORIGINS:
        origins.extend([o.strip() for o in origin_item.split(",")])

# Ensure localhost and 127.0.0.1 are symmetrically supported
for origin in list(origins):
    if "localhost" in origin:
        origins.append(origin.replace("localhost", "127.0.0.1"))
    elif "127.0.0.1" in origin:
        origins.append(origin.replace("127.0.0.1", "localhost"))
origins = list(set(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Serve uploaded files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "agroneon-backend"}
