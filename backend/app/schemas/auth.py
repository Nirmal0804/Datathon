"""Authentication API schemas.

Models representing authenticated user identity and API responses.
The user-facing ``MeResponse`` intentionally exposes no authorization
data — the frontend selects its operational role itself during login
(mock login) and never influences backend authorization.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class AuthenticatedIdentity(BaseModel):
    """Internal representation of an authenticated user.

    Built from verified JWT claims. Only verified claims are included.
    Arbitrary user_metadata or app_metadata is NOT trusted — the
    application role is resolved server-side via ``RBAC_DEFAULT_ROLE``
    or allowlisted role claims and is present here for authorization
    dependencies.
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
    role: str | None = Field(
        default=None,
        description="Application role resolved server-side for authorization",
    )
    permissions: frozenset[str] = Field(
        default_factory=frozenset,
        description="Permissions granted by the resolved role",
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
    role: str | None = Field(
        default=None,
        description="Server-resolved application role (FIELD_OFFICER, ANALYST, ADMIN)",
    )


class AuthErrorResponse(BaseModel):
    """Standard authentication error response."""

    error: dict = Field(
        ...,
        description="Error details with code, message, request_id",
    )
