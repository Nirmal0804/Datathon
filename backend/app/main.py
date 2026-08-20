"""FastAPI application entry point.

Middleware order (outermost first):
  1. CORSMiddleware          – CORS headers + preflight handling
  2. SecurityHeadersMiddleware – cache/security headers (all responses)
  3. RequestIDMiddleware     – correlation ID on every request
  4. StructuredLoggingMiddleware – request line after completion
  5. RateLimitMiddleware     – per-route fixed-window limits (429 never audited)
  6. AuditMiddleware         – security audit trail (incl. DENIED auth)
  7. AuthenticationMiddleware – JWT verification for protected routes

CORS and security headers are outermost so that preflight requests and
error responses (401/429/403) still carry the headers browsers need, and
authentication is innermost so the audit records both successes and denials.

Centralized exception handlers convert domain and framework errors into
a consistent ``{"error": {"code", "message", "request_id"}}`` JSON body.
Stack traces and sensitive internals are never exposed.
"""

from __future__ import annotations

import json
import logging
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.types import ASGIApp, Receive, Scope, Send

from app.core.config import settings
from app.core.exceptions import (
    DependencyUnavailableError,
    DomainError,
    InvalidFilterError,
    ModelUnavailableError,
    ResourceNotFoundError,
)
from app.api.dashboard import router as dashboard_router
from app.api.districts import router as districts_router
from app.api.field_map import router as field_map_router
from app.api.intelligence_map import router as intelligence_map_router
from app.api.stations import router as stations_router
from app.api.auth import router as auth_router
from app.api.network import router as network_router
from app.api.admin import router as admin_router
from app.core.logging import RequestIDMiddleware, StructuredLoggingMiddleware, get_request_id
from app.core.audit import AuditMiddleware
from app.core.rate_limit import RateLimitMiddleware

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
_logger = logging.getLogger("crime_analytics")

# ---------------------------------------------------------------------------
# Public path patterns (no authentication required)
# ---------------------------------------------------------------------------

_PUBLIC_PATHS: list[str | re.Pattern] = [
    "/health",
    "/health/live",
    "/health/ready",
    "/docs",
    "/redoc",
    "/openapi.json",
]


def _is_public_path(path: str) -> bool:
    """Return True if the path does not require authentication."""
    for pattern in _PUBLIC_PATHS:
        if isinstance(pattern, re.Pattern):
            if pattern.match(path):
                return True
        elif path == pattern:
            return True
    return False


# ---------------------------------------------------------------------------
# Lifespan: PostgreSQL connection pool + JWT verifier
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage PostgreSQL connection pool and JWT verifier lifecycle."""
    # Startup: PostgreSQL
    if settings.DATA_BACKEND.lower() == "postgres":
        from app.database.postgres import init_pool

        if not settings.DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL must be set when DATA_BACKEND='postgres'"
            )
        init_pool(
            dsn=settings.DATABASE_URL,
            minconn=settings.DATABASE_POOL_MIN,
            maxconn=settings.DATABASE_POOL_MAX,
        )

    # Startup: JWT verifier
    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=settings.SUPABASE_JWT_SECRET,
        jwks_url=settings.SUPABASE_JWKS_URL,
        issuer=settings.SUPABASE_JWT_ISSUER,
        audience=settings.SUPABASE_JWT_AUDIENCE,
        jwks_cache_ttl=settings.JWKS_CACHE_TTL,
    )

    # Startup: Audit repository
    from app.services.audit_service import init_audit_repository

    if settings.DATA_BACKEND.lower() == "postgres":
        from app.database.postgres.audit_repo import PostgresAuditRepository
        init_audit_repository(PostgresAuditRepository())
    else:
        from app.database.repositories.csv.audit_repo import NoOpAuditRepository
        init_audit_repository(NoOpAuditRepository())

    yield

    # Shutdown: PostgreSQL
    if settings.DATA_BACKEND.lower() == "postgres":
        from app.database.postgres import close_pool

        close_pool()


# ---------------------------------------------------------------------------
# Security headers middleware
# ---------------------------------------------------------------------------


class SecurityHeadersMiddleware:
    """Add security-relevant headers to all API responses.

    - Cache-Control: no-store for sensitive authenticated responses.
    - X-Content-Type-Options: nosniff
    - Referrer-Policy: strict-origin-when-cross-origin
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))

                # Add security headers
                headers.append((b"x-content-type-options", b"nosniff"))
                headers.append(
                    (b"referrer-policy", b"strict-origin-when-cross-origin")
                )

                # Cache-Control for authenticated API responses
                path = scope.get("path", "")
                if path.startswith("/api/v1/"):
                    # Protected API responses: no-store
                    headers.append((b"cache-control", b"no-store"))
                elif path.startswith("/health"):
                    # Health endpoints: short cache acceptable
                    headers.append((b"cache-control", b"max-age=10"))

                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)


# ---------------------------------------------------------------------------
# Authentication middleware (deny-by-default for protected routes)
# ---------------------------------------------------------------------------


class AuthenticationMiddleware:
    """JWT authentication middleware — deny-by-default for protected routes.

    Public paths (health probes, docs) pass through without verification.
    All ``/api/v1/*`` paths require a valid Supabase Auth JWT unless
    ``REQUIRE_AUTH`` is set to False (development mode only).

    The verified identity is stored on ``request.state.authenticated_identity``
    for downstream route handlers to use.
    """

    _AUTH_FAILED_BODY = {
        "error": {
            "code": "AUTHENTICATION_FAILED",
            "message": "Valid authentication is required.",
        }
    }

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")

        # Public paths pass through
        if _is_public_path(path):
            await self.app(scope, receive, send)
            return

        # Auth disabled (development mode)
        if not settings.REQUIRE_AUTH:
            from app.core.rbac import ADMIN, PERMISSIONS

            state = scope.setdefault("state", {})
            state["authenticated_identity"] = {
                "user_id": "dev-user-000",
                "issuer": "development",
                "role": ADMIN,
                "permissions": list(PERMISSIONS),
            }
            await self.app(scope, receive, send)
            return

        # Check auth is configured
        if not settings.SUPABASE_JWT_SECRET and not settings.SUPABASE_JWKS_URL:
            await self._reject(
                scope, receive, send,
                code="AUTH_NOT_CONFIGURED",
                message="Authentication is not configured on the server.",
            )
            return

        # Extract Authorization header
        authorization = None
        for name, value in scope.get("headers", []):
            if name == b"authorization":
                authorization = value.decode("latin-1")
                break

        # Parse Bearer token
        token = self._extract_token(authorization)
        if token is None:
            await self._reject(
                scope, receive, send,
                code="TOKEN_MISSING",
                message="Missing or malformed Authorization header.",
            )
            return

        # Verify JWT
        try:
            from app.core.jwt_auth import verify_token, AuthenticationError
            claims = verify_token(token)
        except AuthenticationError as exc:
            await self._reject(
                scope, receive, send,
                code=exc.code,
                message=exc.message,
            )
            return
        except Exception:
            _logger.exception("unexpected auth middleware error")
            await self._reject(
                scope, receive, send,
                code="VERIFICATION_FAILED",
                message="Token verification failed.",
            )
            return

        # Store verified identity on request state. Role is resolved
        # server-side (RBAC) — never trusted from the client.
        from app.core.rbac import permissions_for_role, resolve_role

        role = resolve_role(claims)
        state = scope.setdefault("state", {})
        state["authenticated_identity"] = {
            "user_id": claims.get("sub", ""),
            "issuer": claims.get("iss", ""),
            "email": claims.get("email"),
            "audience": claims.get("aud"),
            "expires_at": claims.get("exp"),
            "issued_at": claims.get("iat"),
            "role": role,
            "permissions": list(permissions_for_role(role)),
        }

        await self.app(scope, receive, send)

    @staticmethod
    def _extract_token(authorization: str | None) -> str | None:
        """Extract Bearer token from Authorization header."""
        if not authorization:
            return None
        prefix = "Bearer "
        if not authorization.startswith(prefix):
            return None
        token = authorization[len(prefix) :].strip()
        return token if token else None

    async def _reject(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
        *,
        code: str,
        message: str,
    ) -> None:
        """Send a 401 JSON response and terminate the request."""
        request_id = scope.get("state", {}).get("request_id", "") if isinstance(scope.get("state"), dict) else ""

        body = json.dumps({
            "error": {
                "code": code,
                "message": message,
                "request_id": request_id,
            }
        }).encode("utf-8")

        await send({
            "type": "http.response.start",
            "status": 401,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(body)).encode()),
                (b"www-authenticate", b'Bearer realm="api"'),
            ],
        })
        await send({
            "type": "http.response.body",
            "body": body,
            "more_body": False,
        })


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

# Disable interactive docs in production for security
_is_production = settings.ENVIRONMENT.lower() in ("production", "prod")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
    lifespan=lifespan,
)

# Middleware – Starlette add_middleware prepends, so the LAST registration is
# the OUTERMOST. Register innermost-first so execution order becomes:
#   CORS → Security → RequestID → Logging → RateLimit → Audit → Auth → App
app.add_middleware(AuthenticationMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


def _error_body(code: str, message: str, request_id: str | None) -> dict:
    return {"error": {"code": code, "message": message, "request_id": request_id}}


@app.exception_handler(DomainError)
async def handle_domain_error(request: Request, exc: DomainError) -> JSONResponse:
    request_id = exc.request_id or get_request_id(request)
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(exc.code, exc.message, request_id),
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    first = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(loc) for loc in first.get("loc", []))
    msg = first.get("msg", "Validation error")
    detail = f"{field}: {msg}" if field else msg
    return JSONResponse(
        status_code=422,
        content=_error_body("VALIDATION_ERROR", detail, get_request_id(request)),
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    # 403 (forbidden) carries a pre-structured detail body from
    # authorization dependencies — preserve code/message/request_id.
    if exc.status_code == 403:
        detail = exc.detail if isinstance(exc.detail, dict) else {
            "error": {
                "code": "FORBIDDEN",
                "message": str(exc.detail),
                "request_id": get_request_id(request),
            }
        }
        if isinstance(detail, dict):
            error_body = detail.get("error", detail)
            error_body.setdefault("request_id", get_request_id(request))
            return JSONResponse(status_code=403, content={"error": error_body})
    code = "NOT_FOUND" if exc.status_code == 404 else "METHOD_NOT_ALLOWED"
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(code, str(exc.detail), get_request_id(request)),
    )


@app.exception_handler(Exception)
async def handle_uncaught_exception(request: Request, exc: Exception) -> JSONResponse:
    _logger.exception("unhandled exception")
    return JSONResponse(
        status_code=500,
        content=_error_body("INTERNAL_ERROR", "An unexpected error occurred.", get_request_id(request)),
    )


# ---------------------------------------------------------------------------
# Routes: Health (public)
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    """Health check endpoint. Reports backend status."""
    health_status = {
        "status": "healthy",
        "service": settings.APP_NAME,
        "backend": settings.DATA_BACKEND,
    }

    if settings.DATA_BACKEND.lower() == "postgres":
        try:
            from app.database.postgres import execute_one

            result = execute_one("SELECT 1 AS ok")
            health_status["database"] = "connected" if result else "error"
        except Exception:
            health_status["database"] = "disconnected"
            health_status["status"] = "degraded"

    return health_status


@app.get("/health/live")
async def health_live():
    """Kubernetes-style liveness probe.

    Returns 200 when the process is alive and can accept traffic.
    Does NOT check downstream dependencies.
    """
    return {"status": "alive"}


@app.get("/health/ready")
async def health_ready():
    """Kubernetes-style readiness probe.

    Returns 200 when the service is ready to handle requests.
    Checks PostgreSQL connectivity when using the postgres backend.
    Validates CSV data directory exists when using the csv backend.
    Returns 503 when a critical dependency is unavailable.
    """
    ready_status: dict = {"status": "ready"}

    if settings.DATA_BACKEND.lower() == "postgres":
        try:
            from app.database.postgres import execute_one

            result = execute_one("SELECT 1 AS ok")
            if not result:
                return JSONResponse(
                    status_code=503,
                    content={"status": "not ready", "reason": "database query failed"},
                )
            ready_status["database"] = "connected"
        except Exception:
            return JSONResponse(
                status_code=503,
                content={"status": "not ready", "reason": "database unreachable"},
            )
    else:
        import os

        data_dir = getattr(settings, "CSV_DATA_DIR", settings.DATA_DIR)
        if not data_dir or not os.path.isdir(data_dir):
            return JSONResponse(
                status_code=503,
                content={
                    "status": "not ready",
                    "reason": f"CSV data directory not found: {data_dir}",
                },
            )
        ready_status["csv_data_dir"] = data_dir

    return ready_status


# ---------------------------------------------------------------------------
# Protected API routes (under /api/v1 — authentication enforced by middleware)
# ---------------------------------------------------------------------------

app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(network_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(districts_router, prefix=settings.API_PREFIX)
app.include_router(field_map_router, prefix=settings.API_PREFIX)
app.include_router(intelligence_map_router, prefix=settings.API_PREFIX)
app.include_router(stations_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)
