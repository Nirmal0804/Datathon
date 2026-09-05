"""Authentication API router.

Provides the ``GET /api/v1/auth/me`` endpoint that returns verified
identity information for the authenticated user.

Does NOT handle login/logout — Supabase Auth owns session issuance
directly from the frontend. See AUTHENTICATION.md for architecture.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.auth_deps import get_current_identity
from app.schemas.auth import AuthenticatedIdentity, MeResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Current authenticated user identity",
    description="Returns verified identity information for the authenticated user. "
    "Requires a valid Supabase Auth JWT in the Authorization header. "
    "No role or authorization data is returned — that remains BLOCKED_RBAC "
    "until the police role/permission matrix is approved.",
)
async def get_me(
    identity: AuthenticatedIdentity = Depends(get_current_identity),
) -> MeResponse:
    """Return verified user identity and role from the validated JWT."""
    return MeResponse(
        user_id=identity.user_id,
        authenticated=True,
        email=identity.email,
        role=identity.role,
    )
