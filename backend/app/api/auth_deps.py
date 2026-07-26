"""Authentication dependencies for FastAPI.

Reusable FastAPI dependencies for JWT-based request authentication.
Used as ``Depends(get_current_identity)`` or
``Depends(require_authenticated_user)`` in route handlers.

Design:
    - Missing/malformed/invalid JWT → 401 with stable error code.
    - Valid JWT → AuthenticatedIdentity available to route.
    - Authorization (role checks) is a separate concern, NOT here.
"""

from __future__ import annotations

import logging

from fastapi import Header, HTTPException, Request

from app.core.config import settings
from app.core.jwt_auth import (
    AUTH_NOT_CONFIGURED,
    TOKEN_EXPIRED,
    TOKEN_INVALID_CLAIMS,
    TOKEN_INVALID_SIGNATURE,
    TOKEN_MALFORMED,
    TOKEN_MISSING,
    TOKEN_UNSUPPORTED_ALGORITHM,
    VERIFICATION_FAILED,
    AuthenticationError,
    verify_token,
)
from app.core.logging import get_request_id
from app.schemas.auth import AuthenticatedIdentity

logger = logging.getLogger(__name__)

_BEARER_PREFIX = "Bearer "
_AUTH_FAILED_CODE = "AUTHENTICATION_FAILED"


def _build_auth_error(
    code: str, message: str, request_id: str | None
) -> dict:
    """Build a structured auth error response body."""
    return {"error": {"code": code, "message": message, "request_id": request_id}}


def _extract_bearer_token(authorization: str | None) -> str:
    """Extract and validate the Bearer token from Authorization header.

    Returns the raw token string (without prefix).
    Raises ValueError on malformed header.
    """
    if not authorization:
        raise ValueError("missing")

    if not authorization.startswith(_BEARER_PREFIX):
        raise ValueError("not_bearer")

    token = authorization[len(_BEARER_PREFIX) :].strip()
    if not token:
        raise ValueError("empty")

    return token


async def get_current_identity(
    request: Request,
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> AuthenticatedIdentity:
    """Extract and verify the authenticated user identity from the JWT.

    This dependency:
    1. Reads the ``Authorization: Bearer <token>`` header.
    2. Cryptographically verifies the JWT (signature, expiry, issuer).
    3. Returns a safe ``AuthenticatedIdentity`` built from verified claims.

    Raises (via HTTPException 401):
        - Missing Authorization header
        - Malformed Bearer token
        - Invalid/expired JWT
        - JWT verification failure
    """
    from fastapi import HTTPException

    request_id = get_request_id(request)

    # If auth is disabled (development mode), return a default identity
    if not settings.REQUIRE_AUTH:
        return AuthenticatedIdentity(
            user_id="dev-user-000",
            issuer="development",
        )

    # Check auth is configured
    if not settings.SUPABASE_JWT_SECRET and not settings.SUPABASE_JWKS_URL:
        logger.warning("AUTH not configured — rejecting request")
        raise HTTPException(
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
            detail=_build_auth_error(
                AUTH_NOT_CONFIGURED,
                "Authentication is not configured on the server.",
                request_id,
            ),
        )

    # Extract token
    try:
        token = _extract_bearer_token(authorization)
    except ValueError as exc:
        reason = str(exc)
        if reason == "missing":
            code, msg = TOKEN_MISSING, "Missing Authorization header."
        elif reason == "not_bearer":
            code, msg = TOKEN_MALFORMED, "Authorization header must use Bearer scheme."
        else:
            code, msg = TOKEN_MALFORMED, "Empty Bearer token."

        raise HTTPException(
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
            detail=_build_auth_error(code, msg, request_id),
        )

    # Verify JWT
    try:
        claims = verify_token(token)
    except AuthenticationError as exc:
        # Do NOT log the token or its contents
        raise HTTPException(
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
            detail=_build_auth_error(exc.code, exc.message, request_id),
        )
    except Exception:
        logger.exception("unexpected auth error")
        raise HTTPException(
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
            detail=_build_auth_error(
                VERIFICATION_FAILED,
                "Token verification failed.",
                request_id,
            ),
        )

    # Build safe identity from verified claims only
    return AuthenticatedIdentity(
        user_id=claims.get("sub", ""),
        issuer=claims.get("iss", ""),
        email=claims.get("email"),
        audience=claims.get("aud"),
        expires_at=claims.get("exp"),
        issued_at=claims.get("iat"),
    )


async def require_authenticated_user(
    identity: AuthenticatedIdentity,
) -> AuthenticatedIdentity:
    """Require an authenticated user identity.

    Same as ``get_current_identity`` but makes the intent explicit.
    Use this for endpoints that MUST have an authenticated user.

    In route handlers, use both Depends:
        identity: AuthenticatedIdentity = Depends(require_authenticated_user)
    """
    return identity
