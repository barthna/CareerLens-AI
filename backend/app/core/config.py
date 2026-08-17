import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerLens AI"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/careerlens"
    
    # JWT authentication
    JWT_SECRET: str = "super_secure_jwt_secret_key_change_me_in_production_123456"
    JWT_REFRESH_SECRET: str = "super_secure_jwt_refresh_secret_key_change_me_in_production_123456"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI API keys
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gemini-1.5-flash"

    # Storage
    STORAGE_BUCKET: Optional[str] = None
    STORAGE_ACCESS_KEY: Optional[str] = None
    STORAGE_SECRET_KEY: Optional[str] = None
    STORAGE_REGION: Optional[str] = None
    
    # Frontend URL for CORS
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
