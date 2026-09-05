from __future__ import annotations

import os
from pathlib import Path

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent


def _resolve_data_dir() -> str:
    env_dir = os.environ.get("DATA_DIR")
    if env_dir:
        p = Path(env_dir)
        if p.is_dir():
            return str(p.resolve())
        rel_p = _BACKEND_DIR / env_dir
        if rel_p.is_dir():
            return str(rel_p.resolve())
    bundled_dir = _BACKEND_DIR / "data" / "datasets"
    if bundled_dir.is_dir():
        return str(bundled_dir.resolve())
    ml_engine_dir = _PROJECT_ROOT / "ml-engine" / "datasets"
    if ml_engine_dir.is_dir():
        return str(ml_engine_dir.resolve())
    return str(bundled_dir)


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
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    CORS_ORIGIN_REGEX: str | None = r"^https://.*\.catalystserverless\.in$"

    # Authoritative approved datasets live under backend/data/datasets/ or ml-engine/datasets/.
    # Override with DATA_DIR environment variable when needed.
    DATA_DIR: str = _resolve_data_dir()

    # Persistence: "csv" (transitional) or "postgres" (production)
    DATA_BACKEND: str = "csv"

    # PostgreSQL connection (required when DATA_BACKEND="postgres")
    DATABASE_URL: str = ""
    DATABASE_POOL_MIN: int = 1
    DATABASE_POOL_MAX: int = 10

    # Export row limit (production safety)
    MAX_EXPORT_ROWS: int = 10_000

    # ------------------------------------------------------------------
    # Supabase Auth / JWT verification
    # ------------------------------------------------------------------

    # Supabase project reference — used to derive JWKS URL and issuer.
    # Example: "gcxppkdtbvmleynrzqao" from DATABASE_URL host.
    SUPABASE_PROJECT_REF: str = ""

    # JWT symmetric secret (HS256) — from Supabase Dashboard → Settings → API.
    # Required when SUPABASE_JWKS_URL is not set.
    SUPABASE_JWT_SECRET: str = ""

    # JWKS endpoint for asymmetric verification (RS256/ES256).
    # When set, JWKS verification is preferred over symmetric secret.
    # Example: "https://<ref>.supabase.co/auth/v1/.well-known/jwks.json"
    SUPABASE_JWKS_URL: str = ""

    # JWT issuer claim to validate.
    # Example: "https://<ref>.supabase.co/auth/v1"
    SUPABASE_JWT_ISSUER: str = ""

    # JWT audience claim to validate (empty = skip audience validation).
    SUPABASE_JWT_AUDIENCE: str = ""

    # JWKS cache TTL in seconds (default 15 minutes).
    JWKS_CACHE_TTL: int = 900

    # Whether authentication is enforced on protected routes.
    # Set to "false" ONLY for local development without Supabase.
    REQUIRE_AUTH: bool = True

    # ------------------------------------------------------------------
    # Role-based access control (RBAC)
    # ------------------------------------------------------------------

    # Whether authorization (permission checks) is enforced.
    RBAC_ENABLED: bool = True

    # Least-privilege role granted to an authenticated identity that has
    # no recognized role claim. The role itself is configurable; when a
    # real role policy is approved, change this to "ANALYST" or keep the
    # low-tier default. FIELD_OFFICER covers dashboard/field/read data.
    RBAC_DEFAULT_ROLE: str = "FIELD_OFFICER"

    # Dotted claim paths checked (in order) to resolve an application
    # role from verified JWT claims. Server-trusted claims only.
    RBAC_ROLE_CLAIM_PATHS: list[str] = [
        "app_metadata.role",
        "role",
    ]

    # ------------------------------------------------------------------
    # Rate limiting (in-process; single-instance scope)
    # ------------------------------------------------------------------

    # Whether rate limiting is enforced.
    RATE_LIMIT_ENABLED: bool = True

    # Default per-window request allowance for API endpoints.
    RATE_LIMIT_DEFAULT_LIMIT: int = 300
    RATE_LIMIT_DEFAULT_WINDOW: int = 60

    # Stricter limits for cost-heavy / sensitive route classes.
    RATE_LIMIT_EXPORT_LIMIT: int = 10
    RATE_LIMIT_EXPORT_WINDOW: int = 3600
    RATE_LIMIT_SEARCH_LIMIT: int = 60
    RATE_LIMIT_SEARCH_WINDOW: int = 60
    RATE_LIMIT_AUDIT_LIMIT: int = 120
    RATE_LIMIT_AUDIT_WINDOW: int = 60

    # Client identifier header for proxy deployments (empty = socket peer
    # only). Standard proxies should set this to X-Forwarded-For.
    RATE_LIMIT_CLIENT_HEADER: str = "X-Forwarded-For"

    # ------------------------------------------------------------------
    # In-Memory Response Cache Settings
    # ------------------------------------------------------------------
    CACHE_ENABLED: bool = True
    CACHE_TTL_SECONDS: int = 600
    CACHE_MAX_ENTRIES: int = 1000

    # Zoho Catalyst L2 Cache Settings
    CATALYST_CACHE_ENABLED: bool = Field(
        default=False,
        validation_alias=AliasChoices("CATALYST_CACHE_ENABLED", "CACHE_L2_ENABLED", "APP_CATALYST_CACHE_ENABLED"),
    )
    CATALYST_CACHE_SEGMENT_ID: str = Field(
        default="",
        validation_alias=AliasChoices("CATALYST_CACHE_SEGMENT_ID", "CACHE_L2_SEGMENT_ID", "APP_CATALYST_CACHE_SEGMENT_ID"),
    )
    CATALYST_CACHE_TTL_SECONDS: int = Field(
        default=600,
        validation_alias=AliasChoices("CATALYST_CACHE_TTL_SECONDS", "CACHE_L2_TTL_SECONDS", "APP_CATALYST_CACHE_TTL_SECONDS"),
    )

    @model_validator(mode="before")
    @classmethod
    def _normalize_backend(cls, values: dict) -> dict:
        # Allow L2 cache settings to be set via non-reserved env vars (Catalyst blocks CATALYST_ prefix)
        for prefix in ("APP_CATALYST_CACHE_", "CACHE_L2_"):
            if f"{prefix}ENABLED" in values and "CATALYST_CACHE_ENABLED" not in values:
                values["CATALYST_CACHE_ENABLED"] = values[f"{prefix}ENABLED"]
            if f"{prefix}SEGMENT_ID" in values and "CATALYST_CACHE_SEGMENT_ID" not in values:
                values["CATALYST_CACHE_SEGMENT_ID"] = values[f"{prefix}SEGMENT_ID"]
            if f"{prefix}TTL_SECONDS" in values and "CATALYST_CACHE_TTL_SECONDS" not in values:
                values["CATALYST_CACHE_TTL_SECONDS"] = values[f"{prefix}TTL_SECONDS"]

        if "DATA_BACKEND" in values and isinstance(values["DATA_BACKEND"], str):
            values["DATA_BACKEND"] = values["DATA_BACKEND"].lower().strip()
        # Auto-derive Supabase project ref from DATABASE_URL if not set
        if not values.get("SUPABASE_PROJECT_REF") and values.get("DATABASE_URL"):
            values["SUPABASE_PROJECT_REF"] = _extract_project_ref(
                values["DATABASE_URL"]
            )
        # Auto-derive JWT issuer from project ref if not set
        ref = values.get("SUPABASE_PROJECT_REF", "")
        if ref and not values.get("SUPABASE_JWT_ISSUER"):
            values["SUPABASE_JWT_ISSUER"] = (
                f"https://{ref}.supabase.co/auth/v1"
            )
        if ref and not values.get("SUPABASE_JWKS_URL"):
            values["SUPABASE_JWKS_URL"] = (
                f"https://{ref}.supabase.co/auth/v1/.well-known/jwks.json"
            )
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
        # Production safety: REQUIRE_AUTH must not be disabled in production
        env = self.ENVIRONMENT.lower()
        if env in ("production", "prod") and not self.REQUIRE_AUTH:
            raise ValueError(
                "REQUIRE_AUTH cannot be False in production environment. "
                "Set REQUIRE_AUTH=true or change ENVIRONMENT to 'development'."
            )
        # RBAC default role must be one of the application roles
        from app.core.rbac import APP_ROLES, normalize_role

        normalized_default = normalize_role(self.RBAC_DEFAULT_ROLE)
        if normalized_default not in APP_ROLES:
            raise ValueError(
                f"RBAC_DEFAULT_ROLE must be one of {APP_ROLES}, "
                f"got '{self.RBAC_DEFAULT_ROLE}'"
            )
        return self

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


def _extract_project_ref(database_url: str) -> str:
    """Extract Supabase project reference from DATABASE_URL host."""
    try:
        # Format: postgresql://...@db.<ref>.supabase.co:...
        host_part = database_url.split("@")[1]
        if host_part.startswith("db."):
            host_part = host_part[3:]
        ref = host_part.split(".")[0]
        return ref
    except (IndexError, AttributeError):
        return ""


settings = Settings()
