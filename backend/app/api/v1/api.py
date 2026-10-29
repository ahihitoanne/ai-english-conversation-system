from fastapi import APIRouter
from app.api.v1.endpoints import chat, scenarios

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["Voice Chat"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenarios & Vocabulary"])
