from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

_CORE_ENV_FILE = str(Path(__file__).resolve().parent.parent.parent / ".env")

class Settings(BaseSettings):
    APP_NAME: str = "VocabTalk-API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # PostgreSQL Database URL
    DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/vocabtalk"
    
    # API Keys & AI Models
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    GEMINI_FALLBACK_MODELS: str = "gemini-3.8-flash"
    AI_TIMEOUT_SECONDS: float = 10.0
    
    # Security
    SECRET_KEY: str = "vocabtalk_dev_secret_key_123456789"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = _CORE_ENV_FILE
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
