"""Authentication API schemas.

Models representing authenticated user identity and API responses.
No authorization/role data is included — that remains BLOCKED_RBAC
until the police role/permission matrix is approved.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class AuthenticatedIdentity(BaseModel):
    """Internal representation of an authenticated user.

    Built from verified JWT claims. Only verified claims are included.
    Arbitrary user_metadata or app_metadata is NOT trusted.
    """

    user_id: str = Field(
        ...,
        description="Supabase user ID (verified JWT 'sub' claim)",
    )
    issuer: str = Field(
        default="",
        description="Token issuer (verified JWT 'iss' claim)",
    )
    email: str | None = Field(
        default=None,
        description="User email if present in verified claims",
    )
    audience: str | None = Field(
        default=None,
        description="Token audience if present in verified claims",
    )
    expires_at: int | None = Field(
        default=None,
        description="Token expiration as Unix timestamp",
    )
    issued_at: int | None = Field(
        default=None,
        description="Token issued-at as Unix timestamp",
    )


class MeResponse(BaseModel):
    """Response for GET /api/v1/auth/me.

    Returns only safe, verified identity information.
    No tokens, no raw claims, no guessed roles.
    """

    user_id: str = Field(
        ...,
        description="Verified Supabase user ID",
    )
    authenticated: bool = Field(
        default=True,
        description="Always true for authenticated requests",
    )
    email: str | None = Field(
        default=None,
        description="User email if available in verified token",
    )


class AuthErrorResponse(BaseModel):
    """Standard authentication error response."""

    error: dict = Field(
        ...,
        description="Error details with code, message, request_id",
    )
