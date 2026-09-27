"""ShopGuard AI — Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ShopGuard AI"
    database_url: str = "sqlite:///./shopguard.db"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    cors_origins: str = "http://localhost:5173"
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    gemini_api_key: str = ""
    test_artifacts_dir: str = "test_artifacts"

    class Config:
        env_file = ".env"


settings = Settings()
