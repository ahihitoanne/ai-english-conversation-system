from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import init_db, get_db
from app.api.v1.api import api_router
from app.api.v1.endpoints.scenarios import seed_default_scenarios

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Initializing PostgreSQL tables...")
    try:
        init_db()
        from app.core.database import SessionLocal
        db = SessionLocal()
        try:
            seed_default_scenarios(db)
        finally:
            db.close()
        print("[Startup] PostgreSQL database initialized and verified!")
    except Exception as e:
        print(f"[Startup Warning] Could not connect to PostgreSQL: {e}")
        print("Tip: Run 'docker compose up -d' to start local PostgreSQL container or check DATABASE_URL in .env")
    yield
    print("[Shutdown] Cleaning up connections...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for VocabTalk - AI Hands-free Voice English Practice",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {"app": settings.APP_NAME, "status": "online", "docs_url": "/docs", "database": "PostgreSQL"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unreachable: {str(e)}"
    return {"status": "healthy", "database": db_status}
