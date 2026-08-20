"""Audit read API tests.

Covers the admin audit event listing endpoint: authentication,
authorization (audit.read required), 503 behavior when audit storage is
unavailable (CSV/dev backend), and the paginated response shape.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.core.exceptions import DependencyUnavailableError
from app.services import audit_service
from tests.conftest import (
    TEST_AUDIENCE,
    TEST_ISSUER,
    TEST_JWT_SECRET,
    create_test_jwt,
)

from tests.test_audit import InMemoryAuditRepository


def _setup_auth(require_auth: bool = True) -> None:
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
def admin_client(tmp_path, monkeypatch):
    """Client with auth enabled + a working in-memory audit repository."""
    orig_repo = audit_service._repo
    orig_require_auth = settings.REQUIRE_AUTH
    orig_secret = settings.SUPABASE_JWT_SECRET
    orig_jwks = settings.SUPABASE_JWKS_URL
    orig_issuer = settings.SUPABASE_JWT_ISSUER
    orig_audience = settings.SUPABASE_JWT_AUDIENCE
    orig_rbac = settings.RBAC_ENABLED

    repo = InMemoryAuditRepository()
    repo.append({
        "event_id": "evt-1",
        "event_timestamp": "2025-01-01T10:00:00+00:00",
        "request_id": "req-1",
        "user_id": "user-1",
        "role": "ANALYST",
        "http_method": "GET",
        "route": "/api/v1/map/intelligence/analytics",
        "action": "READ",
        "resource_type": "crime_map",
        "resource_id": None,
        "outcome": "SUCCESS",
        "status_code": 200,
        "schema_version": 1,
    })
    repo.append({
        "event_id": "evt-2",
        "event_timestamp": "2025-01-02T11:00:00+00:00",
        "request_id": "req-2",
        "user_id": "user-2",
        "role": "FIELD_OFFICER",
        "http_method": "GET",
        "route": "/api/v1/network/graph",
        "action": "READ",
        "resource_type": "network_graph",
        "resource_id": None,
        "outcome": "DENIED",
        "status_code": 403,
        "schema_version": 1,
    })
    audit_service.init_audit_repository(repo)

    settings.RBAC_ENABLED = True
    _setup_auth(require_auth=True)
    yield TestClient(app), repo

    audit_service.init_audit_repository(orig_repo)
    settings.REQUIRE_AUTH = orig_require_auth
    settings.SUPABASE_JWT_SECRET = orig_secret
    settings.SUPABASE_JWKS_URL = orig_jwks
    settings.SUPABASE_JWT_ISSUER = orig_issuer
    settings.SUPABASE_JWT_AUDIENCE = orig_audience
    settings.RBAC_ENABLED = orig_rbac
    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=orig_secret,
        jwks_url=orig_jwks,
        issuer=orig_issuer,
        audience=orig_audience,
    )


def _auth_header(role: str = "ADMIN") -> dict:
    return {
        "Authorization": "Bearer " + create_test_jwt(
            extra_claims={"app_metadata": {"role": role}}
        )
    }


class TestAuditReadApiAuthentication:
    def test_anonymous_rejected(self, admin_client):
        client, _ = admin_client
        resp = client.get("/api/v1/admin/audit/events")
        assert resp.status_code in (401, 403)

    def test_non_admin_forbidden(self, admin_client):
        client, _ = admin_client
        resp = client.get(
            "/api/v1/admin/audit/events",
            headers=_auth_header(role="FIELD_OFFICER"),
        )
        assert resp.status_code == 403
        assert resp.json()["error"]["code"] == "FORBIDDEN"


class TestAuditReadApiAccess:
    def test_admin_can_list_events(self, admin_client):
        client, repo = admin_client
        resp = client.get("/api/v1/admin/audit/events", headers=_auth_header())
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] == 2
        assert len(body["items"]) == 2
        assert body["page"] == 1
        assert body["page_size"] == 50
        assert body["total_pages"] == 1

    def test_pagination(self, admin_client):
        client, _ = admin_client
        resp = client.get(
            "/api/v1/admin/audit/events",
            params={"page": 1, "page_size": 1},
            headers=_auth_header(),
        )
        body = resp.json()
        assert body["total"] == 2
        assert len(body["items"]) == 1
        # newest first (event_timestamp DESC)
        assert body["items"][0]["event_id"] == "evt-2"

    def test_filter_by_outcome(self, admin_client):
        client, _ = admin_client
        resp = client.get(
            "/api/v1/admin/audit/events",
            params={"outcome": "DENIED"},
            headers=_auth_header(),
        )
        body = resp.json()
        assert body["total"] == 1
        assert body["items"][0]["event_id"] == "evt-2"

    def test_filter_by_role(self, admin_client):
        client, _ = admin_client
        resp = client.get(
            "/api/v1/admin/audit/events",
            params={"role": "ANALYST"},
            headers=_auth_header(),
        )
        body = resp.json()
        assert body["total"] == 1
        assert body["items"][0]["event_id"] == "evt-1"

    def test_response_never_contains_sensitive_fields(self, admin_client):
        client, _ = admin_client
        resp = client.get("/api/v1/admin/audit/events", headers=_auth_header())
        first = resp.json()["items"][0]
        sensitive_keys = {
            "password",
            "secret",
            "token",
            "authorization",
            "request_body",
            "response_body",
            "full_name",
            "dob",
            "address",
            "phone",
            "email",
        }
        assert sensitive_keys.isdisjoint(set(first.keys()))

    def test_invalid_pagination_rejected(self, admin_client):
        client, _ = admin_client
        resp = client.get(
            "/api/v1/admin/audit/events",
            params={"page": 0},
            headers=_auth_header(),
        )
        assert resp.status_code == 422
        resp = client.get(
            "/api/v1/admin/audit/events",
            params={"page_size": 500},
            headers=_auth_header(),
        )
        assert resp.status_code == 422


class TestAuditReadApiUnavailable:
    def test_csv_backend_returns_503(self):
        """NoOp adapter must return 503, never an empty fabricated page."""
        from app.database.repositories.csv.audit_repo import NoOpAuditRepository

        orig_repo = audit_service._repo
        orig_require_auth = settings.REQUIRE_AUTH
        orig_secret = settings.SUPABASE_JWT_SECRET
        orig_jwks = settings.SUPABASE_JWKS_URL
        orig_issuer = settings.SUPABASE_JWT_ISSUER
        orig_audience = settings.SUPABASE_JWT_AUDIENCE
        orig_rbac = settings.RBAC_ENABLED
        try:
            audit_service.init_audit_repository(NoOpAuditRepository())
            settings.RBAC_ENABLED = True
            _setup_auth(require_auth=True)
            client = TestClient(app)
            resp = client.get(
                "/api/v1/admin/audit/events", headers=_auth_header()
            )
            assert resp.status_code == 503
            assert resp.json()["error"]["code"] == "DEPENDENCY_UNAVAILABLE"
        finally:
            audit_service.init_audit_repository(orig_repo)
            settings.REQUIRE_AUTH = orig_require_auth
            settings.SUPABASE_JWT_SECRET = orig_secret
            settings.SUPABASE_JWKS_URL = orig_jwks
            settings.SUPABASE_JWT_ISSUER = orig_issuer
            settings.SUPABASE_JWT_AUDIENCE = orig_audience
            settings.RBAC_ENABLED = orig_rbac
            from app.core.jwt_auth import init_verifier

            init_verifier(
                jwt_secret=orig_secret,
                jwks_url=orig_jwks,
                issuer=orig_issuer,
                audience=orig_audience,
            )


class TestAuditQueryService:
    def test_query_service_building_blocks(self):
        repo = InMemoryAuditRepository()
        repo.append({
            "event_id": "a",
            "event_timestamp": "2025-01-01T00:00:00+00:00",
            "request_id": "r1",
            "user_id": "u1",
            "http_method": "GET",
            "route": "/x",
            "action": "READ",
            "resource_type": "r",
            "outcome": "SUCCESS",
            "status_code": 200,
            "schema_version": 1,
        })
        repo.append({
            "event_id": "b",
            "event_timestamp": "2025-01-02T00:00:00+00:00",
            "request_id": "r2",
            "user_id": "u2",
            "http_method": "GET",
            "route": "/x",
            "action": "READ",
            "resource_type": "r",
            "outcome": "DENIED",
            "status_code": 403,
            "schema_version": 1,
        })
        audit_service.init_audit_repository(repo)
        result = audit_service.query_audit_events(
            {"outcome": "DENIED"}, page=1, page_size=10
        )
        assert result["total"] == 1
        assert result["items"][0]["event_id"] == "b"

    def test_query_service_requires_repository(self, monkeypatch):
        monkeypatch.setattr(audit_service, "_repo", None)
        with pytest.raises(DependencyUnavailableError):
            audit_service.query_audit_events(page=1, page_size=10)