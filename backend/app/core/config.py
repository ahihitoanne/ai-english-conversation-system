from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    APP_NAME: str = "VocabTalk-API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # PostgreSQL Database URL
    DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/vocabtalk"
    
    # API Keys
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Security
    SECRET_KEY: str = "vocabtalk_dev_secret_key_123456789"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
