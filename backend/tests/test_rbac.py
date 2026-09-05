"""RBAC (role-based access control) tests.

Covers the permission model, role resolution from verified JWT claims,
and endpoint-level authorization enforcement (200 vs 403).

Uses ``REQUIRE_AUTH=true`` with valid, cryptographically signed test
tokens that carry role claims. Anonymous/401 behavior is covered by
``test_auth.py``.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.core.rbac import (
    ADMIN,
    ANALYST,
    FIELD_OFFICER,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    normalize_role,
    permissions_for_role,
    resolve_role,
    role_has_permission,
)
from tests.conftest import (
    TEST_AUDIENCE,
    TEST_ISSUER,
    TEST_JWT_SECRET,
    create_test_jwt,
)


def _setup_auth(require_auth: bool = True) -> None:
    """Configure settings and re-init verifier for test."""
    settings.REQUIRE_AUTH = require_auth
    settings.SUPABASE_JWT_SECRET = TEST_JWT_SECRET
    settings.SUPABASE_JWKS_URL = ""
    settings.SUPABASE_JWT_ISSUER = TEST_ISSUER
    settings.SUPABASE_JWT_AUDIENCE = TEST_AUDIENCE

    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=TEST_JWT_SECRET,
        jwks_url="",
        issuer=TEST_ISSUER,
        audience=TEST_AUDIENCE,
    )


@pytest.fixture
def auth_client():
    """TestClient with authentication + RBAC enabled."""
    orig_require_auth = settings.REQUIRE_AUTH
    orig_secret = settings.SUPABASE_JWT_SECRET
    orig_jwks = settings.SUPABASE_JWKS_URL
    orig_issuer = settings.SUPABASE_JWT_ISSUER
    orig_audience = settings.SUPABASE_JWT_AUDIENCE
    orig_rbac_enabled = settings.RBAC_ENABLED
    orig_default_role = settings.RBAC_DEFAULT_ROLE
    orig_claim_paths = settings.RBAC_ROLE_CLAIM_PATHS

    settings.RBAC_ENABLED = True
    _setup_auth(require_auth=True)
    yield TestClient(app)

    settings.REQUIRE_AUTH = orig_require_auth
    settings.SUPABASE_JWT_SECRET = orig_secret
    settings.SUPABASE_JWKS_URL = orig_jwks
    settings.SUPABASE_JWT_ISSUER = orig_issuer
    settings.SUPABASE_JWT_AUDIENCE = orig_audience
    settings.RBAC_ENABLED = orig_rbac_enabled
    settings.RBAC_DEFAULT_ROLE = orig_default_role
    settings.RBAC_ROLE_CLAIM_PATHS = orig_claim_paths
    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=orig_secret,
        jwks_url=orig_jwks,
        issuer=orig_issuer,
        audience=orig_audience,
    )


def _auth_header(claims: dict | None = None) -> dict:
    token = create_test_jwt(extra_claims=claims)
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Role normalization / resolution unit tests
# ---------------------------------------------------------------------------


class TestRoleNormalization:
    def test_uppercase_normalized(self):
        assert normalize_role("field_officer") == FIELD_OFFICER

    def test_lowercase_normalized(self):
        assert normalize_role("admin") == ADMIN

    def test_dashes_and_spaces_normalized(self):
        assert normalize_role("Field Officer") == FIELD_OFFICER
        assert normalize_role("FIELD-OFFICER") == FIELD_OFFICER

    def test_unknown_role_rejected(self):
        assert normalize_role("SUPER_USER") is None

    def test_none_and_empty_rejected(self):
        assert normalize_role(None) is None
        assert normalize_role("") is None
        assert normalize_role("   ") is None


class TestResolveRole:
    def test_no_claims_returns_default(self):
        assert resolve_role(None) == FIELD_OFFICER

    def test_empty_claims_returns_default(self):
        assert resolve_role({}) == FIELD_OFFICER

    def test_app_metadata_role(self):
        claims = {"app_metadata": {"role": "ANALYST"}}
        assert resolve_role(claims) == ANALYST

    def test_user_metadata_role_cannot_elevate_privileges(self):
        # user_metadata is client-controlled and must NOT be trusted; falls back to default
        claims = {"user_metadata": {"role": "admin"}}
        assert resolve_role(claims) == FIELD_OFFICER

    def test_app_metadata_role_grants_role(self):
        claims = {"app_metadata": {"role": "admin"}}
        assert resolve_role(claims) == ADMIN

    def test_top_level_role(self):
        claims = {"role": "field_officer"}
        assert resolve_role(claims) == FIELD_OFFICER

    def test_app_metadata_takes_precedence(self):
        claims = {
            "app_metadata": {"role": "ANALYST"},
            "user_metadata": {"role": "ADMIN"},
            "role": "FIELD_OFFICER",
        }
        assert resolve_role(claims) == ANALYST

    def test_unknown_claim_value_falls_back_to_default(self):
        claims = {"role": "SOME_OTHER_ROLE"}
        assert resolve_role(claims) == FIELD_OFFICER

    def test_non_string_role_claim_ignored(self):
        claims = {"role": 123}
        assert resolve_role(claims) == FIELD_OFFICER


class TestPermissionsForRole:
    def test_admin_has_all_permissions(self):
        assert permissions_for_role(ADMIN) == PERMISSIONS

    def test_field_officer_permissions(self):
        perms = permissions_for_role(FIELD_OFFICER)
        assert "dashboard.read" in perms
        assert "cases.read" in perms
        assert "map.field.read" in perms
        assert "districts.read" in perms
        assert "stations.read" in perms
        assert "cases.export" in perms
        assert "map.intelligence.read" not in perms
        assert "network.read" not in perms
        assert "audit.read" not in perms

    def test_analyst_permissions(self):
        perms = permissions_for_role(ANALYST)
        assert "map.intelligence.read" in perms
        assert "network.read" in perms
        assert "network.person.read" in perms
        assert "dashboard.read" in perms
        assert "users.manage" not in perms
        assert "system.configuration.manage" not in perms

    def test_unknown_role_has_no_permissions(self):
        assert permissions_for_role(None) == frozenset()
        assert permissions_for_role("NOT_A_ROLE") == frozenset()

    def test_role_has_permission(self):
        assert role_has_permission(FIELD_OFFICER, "cases.read") is True
        assert role_has_permission(FIELD_OFFICER, "network.read") is False

    def test_all_role_permissions_in_catalog(self):
        for role_permissions in ROLE_PERMISSIONS.values():
            assert role_permissions.issubset(PERMISSIONS)


# ---------------------------------------------------------------------------
# Endpoint-level authorization
# ---------------------------------------------------------------------------


class TestDefaultRoleIsLeastPrivilege:
    """Tokens with no role claim get RBAC_DEFAULT_ROLE (FIELD_OFFICER)."""

    def test_field_scope_read_endpoints_allowed(self, auth_client):
        headers = _auth_header()
        assert (
            auth_client.get("/api/v1/dashboard/summary", headers=headers).status_code
            == 200
        )
        assert (
            auth_client.get("/api/v1/stations", headers=headers).status_code == 200
        )
        assert (
            auth_client.get("/api/v1/districts", headers=headers).status_code == 200
        )
        assert (
            auth_client.get("/api/v1/map/field/cases", headers=headers).status_code
            == 200
        )

    def test_field_officer_can_export(self, auth_client):
        headers = _auth_header()
        resp = auth_client.get("/api/v1/map/intelligence/export", headers=headers)
        assert resp.status_code == 200

    def test_intelligence_read_denied_for_default_role(self, auth_client):
        headers = _auth_header()
        resp = auth_client.get(
            "/api/v1/map/intelligence/analytics", headers=headers
        )
        assert resp.status_code == 403
        assert resp.json()["error"]["code"] == "FORBIDDEN"

    def test_network_read_denied_for_default_role(self, auth_client):
        headers = _auth_header()
        for path in ("/api/v1/network/graph", "/api/v1/network/search?q=FIR"):
            resp = auth_client.get(path, headers=headers)
            assert resp.status_code == 403, path

    def test_network_entity_denied_for_default_role(self, auth_client):
        headers = _auth_header()
        resp = auth_client.get(
            "/api/v1/network/entities/fir/FIR001", headers=headers
        )
        assert resp.status_code == 403


class TestRoleClaimsGrantAccess:
    def test_analyst_accesses_intelligence(self, auth_client):
        headers = _auth_header({"app_metadata": {"role": "ANALYST"}})
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        assert resp.status_code == 200

    def test_analyst_accesses_network(self, auth_client):
        headers = _auth_header({"app_metadata": {"role": "ANALYST"}})
        resp = auth_client.get("/api/v1/network/graph", headers=headers)
        assert resp.status_code == 200

    def test_analyst_entity_detail(self, auth_client):
        headers = _auth_header({"app_metadata": {"role": "ANALYST"}})
        resp = auth_client.get(
            "/api/v1/network/entities/fir/FIR202500001", headers=headers
        )
        assert resp.status_code == 200

    def test_admin_accesses_everything(self, auth_client):
        headers = _auth_header({"app_metadata": {"role": "ADMIN"}})
        for path in (
            "/api/v1/map/intelligence/analytics",
            "/api/v1/network/graph",
            "/api/v1/network/search?q=FIR",
            "/api/v1/map/field/filters",
        ):
            resp = auth_client.get(path, headers=headers)
            assert resp.status_code == 200, path

    def test_user_metadata_role_claim_denied(self, auth_client):
        # user_metadata is not trusted; token receives FIELD_OFFICER, which is denied for analyst endpoints
        headers = _auth_header({"user_metadata": {"role": "ANALYST"}})
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        assert resp.status_code == 403

    def test_top_level_role_claim(self, auth_client):
        headers = _auth_header({"role": "ANALYST"})
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        assert resp.status_code == 200

    def test_lowercase_role_claim_normalized(self, auth_client):
        headers = _auth_header({"role": "analyst"})
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        assert resp.status_code == 200


class TestForbiddenResponseStructure:
    def test_403_structured_body(self, auth_client):
        headers = _auth_header()
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        body = resp.json()
        assert resp.status_code == 403
        assert "error" in body
        assert body["error"]["code"] == "FORBIDDEN"
        assert "message" in body["error"]
        assert "request_id" in body["error"]

    def test_403_does_not_leak_role_claims(self, auth_client):
        headers = _auth_header({"app_metadata": {"role": "ANALYST"}})
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        # Should succeed for ANALYST — use a denied case for leak check
        assert resp.status_code == 200
        denied = auth_client.get(
            "/api/v1/network/graph", headers=_auth_header({"role": "FIELD_OFFICER"})
        )
        body = denied.json()
        assert "ANALYST" not in body["error"]["message"]
        assert "app_metadata" not in body["error"]["message"]


class TestRbacDisabled:
    def test_rbac_disabled_allows_all(self, auth_client):
        settings.RBAC_ENABLED = False
        headers = _auth_header()
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        assert resp.status_code == 200


class TestCustomDefaultRole:
    def test_default_role_configurable(self, auth_client):
        settings.RBAC_DEFAULT_ROLE = "ANALYST"
        headers = _auth_header()
        resp = auth_client.get("/api/v1/map/intelligence/analytics", headers=headers)
        assert resp.status_code == 200


class TestRbacWithAuthDisabled:
    def test_dev_mode_identity_is_admin(self, no_auth_client):
        resp = no_auth_client.get("/api/v1/map/intelligence/analytics")
        assert resp.status_code == 200
        resp = no_auth_client.get("/api/v1/network/graph")
        assert resp.status_code == 200


@pytest.fixture
def no_auth_client():
    """TestClient with authentication disabled (dev mode)."""
    orig_require_auth = settings.REQUIRE_AUTH
    orig_secret = settings.SUPABASE_JWT_SECRET
    orig_jwks = settings.SUPABASE_JWKS_URL
    orig_issuer = settings.SUPABASE_JWT_ISSUER
    orig_audience = settings.SUPABASE_JWT_AUDIENCE
    orig_rbac_enabled = settings.RBAC_ENABLED

    settings.RBAC_ENABLED = True
    _setup_auth(require_auth=False)
    yield TestClient(app)

    settings.REQUIRE_AUTH = orig_require_auth
    settings.SUPABASE_JWT_SECRET = orig_secret
    settings.SUPABASE_JWKS_URL = orig_jwks
    settings.SUPABASE_JWT_ISSUER = orig_issuer
    settings.SUPABASE_JWT_AUDIENCE = orig_audience
    settings.RBAC_ENABLED = orig_rbac_enabled
    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=orig_secret,
        jwks_url=orig_jwks,
        issuer=orig_issuer,
        audience=orig_audience,
    )
