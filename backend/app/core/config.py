from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SalesIA Enterprise API"
    API_V1_STR: str = "/api/v1"
    
    # Conexión a Base de Datos (Supabase / PostgreSQL)
    DATABASE_URL: str
    
    # Seguridad JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 Horas

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()