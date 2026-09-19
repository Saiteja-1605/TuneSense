import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "TuneSense API"
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "tunesense")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "tunesense_secret_super_secure_key_2026_ml_rec")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    PORT: int = int(os.getenv("PORT", "8000"))

    @property
    def cors_origins(self) -> List[str]:
        origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ]
        if self.FRONTEND_URL:
            for url in self.FRONTEND_URL.split(","):
                cleaned = url.strip()
                if cleaned and cleaned not in origins:
                    origins.append(cleaned)
        # Render wildcard or deployment url support
        return origins

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
