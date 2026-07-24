from __future__ import annotations

import os
from pathlib import Path

from pydantic_settings import BaseSettings

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "crime-analytics-backend"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    API_PREFIX: str = "/api/v1"

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    DATA_DIR: str = str(_PROJECT_ROOT / "data" / "schema_reference")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
