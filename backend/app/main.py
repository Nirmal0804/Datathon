"""FastAPI application entry point.

Middleware order (outermost first):
  1. CORSMiddleware          – CORS headers
  2. StructuredLoggingMiddleware – request line after completion
  3. RequestIDMiddleware     – correlation ID on every request

Centralized exception handlers convert domain and framework errors into
a consistent ``{"error": {"code", "message", "request_id"}}`` JSON body.
Stack traces and sensitive internals are never exposed.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.exceptions import (
    DependencyUnavailableError,
    DomainError,
    InvalidFilterError,
    ModelUnavailableError,
    ResourceNotFoundError,
)
from app.api.dashboard import router as dashboard_router
from app.core.logging import RequestIDMiddleware, StructuredLoggingMiddleware, get_request_id

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
_logger = logging.getLogger("crime_analytics")

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware – added outermost-first: CORS → Logging → RequestID
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

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
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
    }


# ---------------------------------------------------------------------------
# Dashboard API
# ---------------------------------------------------------------------------

app.include_router(dashboard_router, prefix=settings.API_PREFIX)
