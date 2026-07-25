from __future__ import annotations

import os
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

_VALID_BACKENDS = ("csv", "postgres")


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Validation ensures the configured backend is valid and all required
    companion settings are present.  There is no silent fallback from
    postgres to csv.
    """

    APP_NAME: str = "crime-analytics-backend"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    API_PREFIX: str = "/api/v1"

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    DATA_DIR: str = str(_PROJECT_ROOT / "data" / "schema_reference")

    # Persistence: "csv" (transitional) or "postgres" (production)
    DATA_BACKEND: str = "csv"

    # PostgreSQL connection (required when DATA_BACKEND="postgres")
    DATABASE_URL: str = ""
    DATABASE_POOL_MIN: int = 1
    DATABASE_POOL_MAX: int = 10

    # Export row limit (production safety)
    MAX_EXPORT_ROWS: int = 10_000

    @model_validator(mode="before")
    @classmethod
    def _normalize_backend(cls, values: dict) -> dict:
        if "DATA_BACKEND" in values and isinstance(values["DATA_BACKEND"], str):
            values["DATA_BACKEND"] = values["DATA_BACKEND"].lower().strip()
        return values

    @model_validator(mode="after")
    def _validate_backend_config(self) -> "Settings":
        backend = self.DATA_BACKEND
        if backend not in _VALID_BACKENDS:
            raise ValueError(
                f"DATA_BACKEND must be one of {_VALID_BACKENDS}, "
                f"got '{self.DATA_BACKEND}'"
            )
        if backend == "postgres" and not self.DATABASE_URL:
            raise ValueError(
                "DATABASE_URL is required when DATA_BACKEND='postgres'"
            )
        if self.DATABASE_POOL_MIN < 1:
            raise ValueError(
                f"DATABASE_POOL_MIN must be >= 1, got {self.DATABASE_POOL_MIN}"
            )
        if self.DATABASE_POOL_MAX < 1:
            raise ValueError(
                f"DATABASE_POOL_MAX must be >= 1, got {self.DATABASE_POOL_MAX}"
            )
        if self.DATABASE_POOL_MIN > self.DATABASE_POOL_MAX:
            raise ValueError(
                f"DATABASE_POOL_MIN ({self.DATABASE_POOL_MIN}) must be <= "
                f"DATABASE_POOL_MAX ({self.DATABASE_POOL_MAX})"
            )
        return self

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
