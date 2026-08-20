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

    # Authoritative approved datasets live under ml-engine/datasets/.
    # Override with DATA_DIR when the repository layout differs.
    DATA_DIR: str = str(_PROJECT_ROOT / "ml-engine" / "datasets")

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
    # role from verified JWT claims.
    RBAC_ROLE_CLAIM_PATHS: list[str] = [
        "app_metadata.role",
        "user_metadata.role",
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

    @model_validator(mode="before")
    @classmethod
    def _normalize_backend(cls, values: dict) -> dict:
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

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


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
