"""Authorization (RBAC) dependencies for FastAPI.

These dependencies perform *authorization* only — authentication is
handled by ``get_current_identity`` / the auth middleware.

Behavior:
    - Missing/invalid identity             → 401 (authentication failure)
    - Valid identity, insufficient role    → 403 FORBIDDEN (insufficient
      permissions) with a structured body
    - Valid identity, sufficient permission → identity passed through

Security note: authorization is always evaluated against the
server-side identity role resolved from the verified JWT. The client
(the mock frontend) cannot grant or change roles.
"""

from __future__ import annotations

import logging
from typing import Callable

from fastapi import Depends, HTTPException, Request

from app.api.auth_deps import get_current_identity
from app.core.config import settings
from app.core.logging import get_request_id
from app.schemas.auth import AuthenticatedIdentity

logger = logging.getLogger(__name__)

_FORBIDDEN_CODE = "FORBIDDEN"


def _forbidden(permission: str, request_id: str | None) -> HTTPException:
    return HTTPException(
        status_code=403,
        detail={
            "error": {
                "code": _FORBIDDEN_CODE,
                "message": (
                    "Insufficient permissions: "
                    f"'{permission}' required."
                ),
                "request_id": request_id,
            }
        },
    )


def require_permission(permission: str) -> Callable:
    """Build a dependency that requires a specific permission.

    Usage:
        ``identity=Depends(require_permission("cases.read"))``
    """

    async def _require_permission(
        request: Request,
        identity: AuthenticatedIdentity = Depends(get_current_identity),
    ) -> AuthenticatedIdentity:
        if not settings.RBAC_ENABLED:
            return identity
        if permission not in identity.permissions:
            raise _forbidden(permission, get_request_id(request))
        return identity

    return _require_permission


def require_any_permission(permissions: list[str]) -> Callable:
    """Build a dependency requiring at least one permission (OR semantics).

    Usage:
        ``identity=Depends(require_any_permission(["network.read", "network.person.read"]))``
    """

    async def _require_any_permission(
        request: Request,
        identity: AuthenticatedIdentity = Depends(get_current_identity),
    ) -> AuthenticatedIdentity:
        if not settings.RBAC_ENABLED:
            return identity
        if not any(p in identity.permissions for p in permissions):
            raise _forbidden(" or ".join(permissions), get_request_id(request))
        return identity

    return _require_any_permission


def require_role(roles: list[str]) -> Callable:
    """Build a dependency requiring one of the given roles (OR semantics).

    Prefer ``require_permission``/``require_any_permission`` at the route
    level. ``require_role`` is reserved for coarse administrative gates.

    Usage: ``identity=Depends(require_role(["ADMIN"]))``
    """

    async def _require_role(
        request: Request,
        identity: AuthenticatedIdentity = Depends(get_current_identity),
    ) -> AuthenticatedIdentity:
        if not settings.RBAC_ENABLED:
            return identity
        if identity.role not in roles:
            raise _forbidden(f"role in [{', '.join(roles)}]", get_request_id(request))
        return identity

    return _require_role