"""Role-based access control (RBAC) for the crime analytics backend.

The application exposes three proposed operational roles:

* ``FIELD_OFFICER``
* ``ANALYST``
* ``ADMIN``

These roles are the *application's* current authorization model and do
**not** claim to represent an official Karnataka Police permission
policy. The mapping is configurable and revisable via role-to-permission
tables below and the ``RBAC_*`` settings.

Role resolution
---------------
Roles are resolved **server-side only**, from the *verified* Supabase
Auth JWT. The frontend is never trusted for authorization.

Claim sources (checked in order, server-trusted only):

1. ``app_metadata.role``  (Supabase convention for privileged metadata)
2. ``role``              (top-level claim)

A resolved role is accepted only if it is present in the role
allowlist. If no recognized role claim exists, the identity receives the
configured ``RBAC_DEFAULT_ROLE`` (least-privilege tier, ``FIELD_OFFICER``
by default). This default is deliberate: an authenticated Supabase user
with no custom role metadata still receives the lowest application tier.
Administrative tiers (``ANALYST``/``ADMIN``) require an explicit,
allowlisted role claim.

Permission model
----------------
Permissions are coarse, stable strings (``<area>.<action>``). Endpoints
declare the permission they require via reusable dependencies
(``require_permission`` / ``require_any_permission`` / ``require_role``)
defined in ``app/api/rbac_deps.py``. Business logic never performs ad-hoc
role checks.

* 401 - identity missing or invalid (authentication middleware)
* 403 - identity valid but permission missing (authorization dependencies)
"""

from __future__ import annotations

from typing import Any

# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------

FIELD_OFFICER = "FIELD_OFFICER"
ANALYST = "ANALYST"
ADMIN = "ADMIN"

APP_ROLES = (FIELD_OFFICER, ANALYST, ADMIN)


def normalize_role(role: str | None) -> str | None:
    """Normalize a raw role string to an allowlisted application role."""
    if not role:
        return None
    normalized = role.strip().upper().replace("-", "_").replace(" ", "_")
    return normalized if normalized in APP_ROLES else None


# ---------------------------------------------------------------------------
# Permission catalog
# ---------------------------------------------------------------------------

PERMISSIONS: frozenset[str] = frozenset({
    "dashboard.read",
    "cases.read",
    "cases.export",
    "map.field.read",
    "map.intelligence.read",
    "districts.read",
    "stations.read",
    "analytics.read",
    "network.read",
    "network.person.read",
    "network.person.search",
    "network.person.detail",
    "audit.read",
    "users.read",
    "users.manage",
    "roles.read",
    "roles.manage",
    "system.configuration.read",
    "system.configuration.manage",
})

# ---------------------------------------------------------------------------
# Role → permission mapping (the application's current policy)
# ---------------------------------------------------------------------------
# Revisable: change the sets below to re-scope a role. The permission
# catalog and endpoint assignments are the authorization contract.

ROLE_PERMISSIONS: dict[str, frozenset[str]] = {
    FIELD_OFFICER: frozenset({
        "dashboard.read",
        "cases.read",
        "cases.export",
        "map.field.read",
        "districts.read",
        "stations.read",
    }),
    ANALYST: frozenset({
        "dashboard.read",
        "cases.read",
        "cases.export",
        "map.field.read",
        "map.intelligence.read",
        "districts.read",
        "stations.read",
        "analytics.read",
        "network.read",
        "network.person.read",
        "network.person.search",
        "network.person.detail",
    }),
    ADMIN: PERMISSIONS,
}

assert all(
    permission in PERMISSIONS
    for role_permissions in ROLE_PERMISSIONS.values()
    for permission in role_permissions
), "Role permission sets reference permissions outside the catalog"


# ---------------------------------------------------------------------------
# Resolution helpers
# ---------------------------------------------------------------------------


def _claim_path_lookup(claims: dict[str, Any], path: str) -> Any:
    """Resolve a dotted JSON path inside the claims dict."""
    current: Any = claims
    for segment in path.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(segment)
    return current


def resolve_role(claims: dict[str, Any] | None) -> str | None:
    """Resolve an application role from verified JWT claims.

    Returns the configured default role (``RBAC_DEFAULT_ROLE``) when no
    recognized role claim is present. ``None`` is only returned when the
    allowlist itself is empty. Settings are read lazily to avoid a
    circular import with ``app.core.config`` during validation.
    """
    from app.core.config import settings

    if not claims:
        return settings.RBAC_DEFAULT_ROLE

    for path in settings.RBAC_ROLE_CLAIM_PATHS:
        raw = _claim_path_lookup(claims, path)
        role = normalize_role(raw if isinstance(raw, str) else None)
        if role is not None:
            return role

    return settings.RBAC_DEFAULT_ROLE


def permissions_for_role(role: str | None) -> frozenset[str]:
    """Return the permission set for a role (empty for unknown roles)."""
    if not role:
        return frozenset()
    return ROLE_PERMISSIONS.get(role, frozenset())


def role_has_permission(role: str | None, permission: str) -> bool:
    """Return True if the role grants the given permission."""
    return permission in permissions_for_role(role)