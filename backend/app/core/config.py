from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = 'postgresql://audit_user:audit_pass123@localhost:5432/ai_audit_db'
    SECRET_KEY: str = 'change-me-in-production'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    class Config:
        env_file = '.env'

settings = Settings()
