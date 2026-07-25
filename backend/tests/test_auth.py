"""Comprehensive authentication tests.

Tests JWT verification, route protection, /auth/me, security headers,
and error responses. Uses cryptographically valid test keys.

These tests enable ``REQUIRE_AUTH=true`` and provide valid tokens
via the Authorization header.
"""

from __future__ import annotations

import json
import time

import jwt as pyjwt
import pytest
from cryptography.hazmat.primitives import serialization
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from tests.conftest import (
    TEST_AUDIENCE,
    TEST_ISSUER,
    TEST_JWT_SECRET,
    create_expired_jwt,
    create_malformed_jwt,
    create_missing_sub_jwt,
    create_rsa_test_jwt,
    create_test_jwt,
    create_unsigned_jwt,
    create_wrong_issuer_jwt,
    create_wrong_secret_jwt,
    get_rsa_private_key,
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
    """TestClient with authentication enabled and test JWT secret configured."""
    # Save originals
    orig_require_auth = settings.REQUIRE_AUTH
    orig_secret = settings.SUPABASE_JWT_SECRET
    orig_jwks = settings.SUPABASE_JWKS_URL
    orig_issuer = settings.SUPABASE_JWT_ISSUER
    orig_audience = settings.SUPABASE_JWT_AUDIENCE

    _setup_auth(require_auth=True)
    yield TestClient(app)

    # Restore originals
    settings.REQUIRE_AUTH = orig_require_auth
    settings.SUPABASE_JWT_SECRET = orig_secret
    settings.SUPABASE_JWKS_URL = orig_jwks
    settings.SUPABASE_JWT_ISSUER = orig_issuer
    settings.SUPABASE_JWT_AUDIENCE = orig_audience
    # Re-init verifier with original (likely empty) config
    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=orig_secret,
        jwks_url=orig_jwks,
        issuer=orig_issuer,
        audience=orig_audience,
    )


@pytest.fixture
def no_auth_client():
    """TestClient with authentication disabled (dev mode)."""
    orig_require_auth = settings.REQUIRE_AUTH
    orig_secret = settings.SUPABASE_JWT_SECRET
    orig_jwks = settings.SUPABASE_JWKS_URL
    orig_issuer = settings.SUPABASE_JWT_ISSUER
    orig_audience = settings.SUPABASE_JWT_AUDIENCE

    _setup_auth(require_auth=False)
    yield TestClient(app)

    settings.REQUIRE_AUTH = orig_require_auth
    settings.SUPABASE_JWT_SECRET = orig_secret
    settings.SUPABASE_JWKS_URL = orig_jwks
    settings.SUPABASE_JWT_ISSUER = orig_issuer
    settings.SUPABASE_JWT_AUDIENCE = orig_audience
    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=orig_secret,
        jwks_url=orig_jwks,
        issuer=orig_issuer,
        audience=orig_audience,
    )


# ---------------------------------------------------------------------------
# 1. JWT verification — direct tests
# ---------------------------------------------------------------------------


class TestJWTVerification:
    """Test the JWT verifier engine directly."""

    def test_valid_token_returns_claims(self):
        from app.core.jwt_auth import JWTVerifier

        verifier = JWTVerifier(
            jwt_secret=TEST_JWT_SECRET,
            issuer=TEST_ISSUER,
            audience=TEST_AUDIENCE,
        )
        token = create_test_jwt()
        claims = verifier.verify(token)
        assert claims["sub"] == "test-user-001"
        assert claims["iss"] == TEST_ISSUER

    def test_expired_token_rejected(self):
        from app.core.jwt_auth import JWTVerifier, TOKEN_EXPIRED

        verifier = JWTVerifier(jwt_secret=TEST_JWT_SECRET, issuer=TEST_ISSUER)
        token = create_expired_jwt()
        with pytest.raises(Exception) as exc_info:
            verifier.verify(token)
        assert exc_info.value.code == TOKEN_EXPIRED

    def test_wrong_secret_rejected(self):
        from app.core.jwt_auth import JWTVerifier, TOKEN_INVALID_SIGNATURE

        verifier = JWTVerifier(jwt_secret=TEST_JWT_SECRET, issuer=TEST_ISSUER)
        token = create_wrong_secret_jwt()
        with pytest.raises(Exception) as exc_info:
            verifier.verify(token)
        assert exc_info.value.code == TOKEN_INVALID_SIGNATURE

    def test_wrong_issuer_rejected(self):
        from app.core.jwt_auth import JWTVerifier, TOKEN_INVALID_CLAIMS

        verifier = JWTVerifier(jwt_secret=TEST_JWT_SECRET, issuer=TEST_ISSUER)
        token = create_wrong_issuer_jwt()
        with pytest.raises(Exception) as exc_info:
            verifier.verify(token)
        assert exc_info.value.code == TOKEN_INVALID_CLAIMS

    def test_malformed_token_rejected(self):
        from app.core.jwt_auth import JWTVerifier, TOKEN_MALFORMED

        verifier = JWTVerifier(jwt_secret=TEST_JWT_SECRET)
        with pytest.raises(Exception) as exc_info:
            verifier.verify(create_malformed_jwt())
        assert exc_info.value.code == TOKEN_MALFORMED

    def test_empty_token_rejected(self):
        from app.core.jwt_auth import JWTVerifier, TOKEN_MISSING

        verifier = JWTVerifier(jwt_secret=TEST_JWT_SECRET)
        with pytest.raises(Exception) as exc_info:
            verifier.verify("")
        assert exc_info.value.code == TOKEN_MISSING

    def test_unsigned_token_rejected(self):
        from app.core.jwt_auth import (
            JWTVerifier,
            TOKEN_INVALID_CLAIMS,
            TOKEN_INVALID_SIGNATURE,
            TOKEN_MALFORMED,
            TOKEN_UNSUPPORTED_ALGORITHM,
        )

        verifier = JWTVerifier(jwt_secret=TEST_JWT_SECRET)
        with pytest.raises(Exception) as exc_info:
            verifier.verify(create_unsigned_jwt())
        # Unsigned tokens are rejected (varies by PyJWT version)
        assert exc_info.value.code in (
            TOKEN_INVALID_SIGNATURE,
            TOKEN_MALFORMED,
            TOKEN_UNSUPPORTED_ALGORITHM,
            TOKEN_INVALID_CLAIMS,
        )

    def test_no_verifier_configured_rejects(self):
        from app.core.jwt_auth import JWTVerifier, AUTH_NOT_CONFIGURED

        verifier = JWTVerifier()  # No secret, no JWKS
        with pytest.raises(Exception) as exc_info:
            verifier.verify(create_test_jwt())
        assert exc_info.value.code == AUTH_NOT_CONFIGURED

    def test_missing_sub_claim_rejected(self):
        from app.core.jwt_auth import JWTVerifier, TOKEN_INVALID_CLAIMS

        verifier = JWTVerifier(jwt_secret=TEST_JWT_SECRET, issuer=TEST_ISSUER)
        token = create_missing_sub_jwt()
        with pytest.raises(Exception) as exc_info:
            verifier.verify(token)
        assert exc_info.value.code == TOKEN_INVALID_CLAIMS


# ---------------------------------------------------------------------------
# 2. Route protection — anonymous access rejected
# ---------------------------------------------------------------------------


class TestRouteProtection:
    """Verify protected endpoints reject anonymous access."""

    def test_dashboard_summary_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 401
        body = resp.json()
        assert body["error"]["code"] in (
            "TOKEN_MISSING",
            "AUTH_NOT_CONFIGURED",
            "AUTHENTICATION_FAILED",
        )

    def test_field_cases_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/map/field/cases")
        assert resp.status_code == 401

    def test_intelligence_analytics_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/map/intelligence/analytics")
        assert resp.status_code == 401

    def test_districts_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/districts")
        assert resp.status_code == 401

    def test_stations_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/stations")
        assert resp.status_code == 401

    def test_export_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/map/intelligence/export")
        assert resp.status_code == 401

    def test_auth_me_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    def test_network_graph_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/network/graph")
        assert resp.status_code == 401

    def test_network_entity_detail_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/network/entities/fir/FIR001")
        assert resp.status_code == 401

    def test_network_search_rejects_anonymous(self, auth_client):
        resp = auth_client.get("/api/v1/network/search", params={"q": "FIR"})
        assert resp.status_code == 401

    def test_401_includes_www_authenticate_header(self, auth_client):
        resp = auth_client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 401
        assert "www-authenticate" in resp.headers

    def test_401_includes_request_id(self, auth_client):
        resp = auth_client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 401
        assert "x-request-id" in resp.headers
        body = resp.json()
        assert "request_id" in body["error"]

    def test_401_error_code_is_stable(self, auth_client):
        """Error code must be machine-readable and stable."""
        resp = auth_client.get("/api/v1/dashboard/summary")
        body = resp.json()
        assert body["error"]["code"] in (
            "AUTHENTICATION_FAILED",
            "TOKEN_MISSING",
            "AUTH_NOT_CONFIGURED",
        )


# ---------------------------------------------------------------------------
# 3. Public endpoints remain accessible
# ---------------------------------------------------------------------------


class TestPublicEndpoints:
    """Health probes and docs must remain public."""

    def test_health_public(self, auth_client):
        resp = auth_client.get("/health")
        assert resp.status_code == 200

    def test_health_live_public(self, auth_client):
        resp = auth_client.get("/health/live")
        assert resp.status_code == 200

    def test_health_ready_public(self, auth_client):
        resp = auth_client.get("/health/ready")
        assert resp.status_code in (200, 503)

    def test_docs_public(self, auth_client):
        resp = auth_client.get("/docs")
        assert resp.status_code == 200

    def test_openapi_public(self, auth_client):
        resp = auth_client.get("/openapi.json")
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# 4. Valid token — access granted
# ---------------------------------------------------------------------------


class TestValidTokenAccess:
    """Endpoints accept valid JWT tokens."""

    def test_auth_me_with_valid_token(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["authenticated"] is True
        assert body["user_id"] == "test-user-001"
        assert body["email"] == "test@example.com"

    def test_dashboard_with_valid_token(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

    def test_stations_with_valid_token(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/stations",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

    def test_districts_with_valid_token(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/districts",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

    def test_field_cases_with_valid_token(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/map/field/cases",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# 5. Invalid tokens — access denied
# ---------------------------------------------------------------------------


class TestInvalidTokenAccess:
    """Various invalid tokens are properly rejected."""

    def test_expired_token_rejected(self, auth_client):
        token = create_expired_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 401
        assert resp.json()["error"]["code"] == "TOKEN_EXPIRED"

    def test_wrong_secret_rejected(self, auth_client):
        token = create_wrong_secret_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 401
        assert resp.json()["error"]["code"] == "TOKEN_INVALID_SIGNATURE"

    def test_wrong_issuer_rejected(self, auth_client):
        token = create_wrong_issuer_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 401
        assert resp.json()["error"]["code"] == "TOKEN_INVALID_CLAIMS"

    def test_malformed_token_rejected(self, auth_client):
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": "Bearer not.a.valid.jwt"},
        )
        assert resp.status_code == 401
        assert resp.json()["error"]["code"] == "TOKEN_MALFORMED"

    def test_empty_bearer_rejected(self, auth_client):
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": "Bearer "},
        )
        assert resp.status_code == 401

    def test_non_bearer_scheme_rejected(self, auth_client):
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": "Basic dXNlcjpwYXNz"},
        )
        assert resp.status_code == 401

    def test_unsigned_token_rejected(self, auth_client):
        token = create_unsigned_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 6. /auth/me — comprehensive tests
# ---------------------------------------------------------------------------


class TestAuthMe:
    """GET /api/v1/auth/me endpoint tests."""

    def test_anonymous_returns_401(self, auth_client):
        resp = auth_client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    def test_valid_token_returns_200(self, auth_client):
        token = create_test_jwt(subject="user-123")
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

    def test_response_contains_verified_subject(self, auth_client):
        token = create_test_jwt(subject="user-abc")
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        body = resp.json()
        assert body["user_id"] == "user-abc"

    def test_response_authenticated_is_true(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.json()["authenticated"] is True

    def test_response_includes_email(self, auth_client):
        token = create_test_jwt(email="officer@ksp.gov.in")
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.json()["email"] == "officer@ksp.gov.in"

    def test_no_token_returned(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        body = resp.json()
        assert "token" not in body
        assert "access_token" not in body
        assert "refresh_token" not in body

    def test_no_raw_claims_trusted(self, auth_client):
        """Arbitrary claims like 'role' should not appear in response."""
        token = create_test_jwt(extra_claims={"role": "admin", "district_id": 5})
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        body = resp.json()
        # Only safe fields should be present
        assert set(body.keys()) == {"user_id", "authenticated", "email"}

    def test_request_id_present(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert "x-request-id" in resp.headers


# ---------------------------------------------------------------------------
# 7. Security headers
# ---------------------------------------------------------------------------


class TestSecurityHeaders:
    """Verify security headers on responses."""

    def test_api_response_has_nosniff(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.headers.get("x-content-type-options") == "nosniff"

    def test_api_response_has_referrer_policy(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

    def test_api_response_has_no_store_cache(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert "no-store" in resp.headers.get("cache-control", "")

    def test_health_response_has_short_cache(self, auth_client):
        resp = auth_client.get("/health")
        assert "max-age" in resp.headers.get("cache-control", "")

    def test_request_id_header_exposed(self, auth_client):
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert "x-request-id" in resp.headers


# ---------------------------------------------------------------------------
# 8. Auth disabled (dev mode)
# ---------------------------------------------------------------------------


class TestAuthDisabled:
    """When REQUIRE_AUTH=false, all endpoints are accessible."""

    def test_dashboard_without_token(self, no_auth_client):
        resp = no_auth_client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 200

    def test_stations_without_token(self, no_auth_client):
        resp = no_auth_client.get("/api/v1/stations")
        assert resp.status_code == 200

    def test_auth_me_without_token(self, no_auth_client):
        resp = no_auth_client.get("/api/v1/auth/me")
        assert resp.status_code == 200
        body = resp.json()
        assert body["user_id"] == "dev-user-000"

    def test_health_still_public(self, no_auth_client):
        resp = no_auth_client.get("/health")
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# 9. Error response security
# ---------------------------------------------------------------------------


class TestErrorSecurity:
    """Ensure error responses don't leak sensitive information."""

    def test_no_jwt_contents_in_error(self, auth_client):
        """JWT token contents must not appear in error messages."""
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token[:20]}..."},  # truncated
        )
        if resp.status_code == 401:
            error_str = json.dumps(resp.json())
            assert token[:20] not in error_str

    def test_no_crypto_details_in_error(self, auth_client):
        """Cryptographic details must not appear in error messages."""
        token = create_test_jwt()
        resp = auth_client.get(
            "/api/v1/dashboard/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        # Even if there's an error, no crypto details should leak
        if resp.status_code == 401:
            error_str = json.dumps(resp.json()).lower()
            assert "hmac" not in error_str
            assert "sha256" not in error_str
            assert "private" not in error_str

    def test_error_has_consistent_structure(self, auth_client):
        resp = auth_client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 401
        body = resp.json()
        assert "error" in body
        assert "code" in body["error"]
        assert "message" in body["error"]
        assert "request_id" in body["error"]


# ---------------------------------------------------------------------------
# 10. Algorithm confusion prevention
# ---------------------------------------------------------------------------


class TestAlgorithmConfusion:
    """Ensure algorithm confusion attacks are rejected.

    The critical attack: In JWKS mode, an attacker crafts a token with
    ``alg: HS256`` and signs it with the RSA public key (which is
    publicly known). Without an algorithm allowlist, PyJWT would try to
    verify using HMAC with the RSA public key bytes as the secret.
    """

    def test_jwks_rejects_hs256_token(self):
        """JWKS mode must reject tokens using HS256 algorithm."""
        from app.core.jwt_auth import JWTVerifier, TOKEN_UNSUPPORTED_ALGORITHM

        rsa_key = get_rsa_private_key()
        now = int(time.time())
        claims = {
            "sub": "attacker",
            "iss": TEST_ISSUER,
            "exp": now + 3600,
            "iat": now,
            "aud": TEST_AUDIENCE,
        }
        # Sign with HS256 using the RSA key bytes as secret (confusion attack)
        rsa_key_bytes = rsa_key.private_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        # Include kid matching JWKS key to bypass key-lookup check
        token = pyjwt.encode(
            claims, rsa_key_bytes, algorithm="HS256",
            headers={"kid": "test-rsa-key-001"},
        )

        # Verifier configured with JWKS (asymmetric mode)
        verifier = JWTVerifier(
            jwks_url="https://test.supabase.co/.well-known/jwks.json",
            issuer=TEST_ISSUER,
            audience=TEST_AUDIENCE,
        )
        # Manually inject the JWKS keys so the verifier has keys to check
        from tests.conftest import create_jwks_response
        verifier._jwks_keys = create_jwks_response()["keys"]
        verifier._jwks_last_fetch = time.time()

        with pytest.raises(Exception) as exc_info:
            verifier.verify(token)
        assert exc_info.value.code == TOKEN_UNSUPPORTED_ALGORITHM

    def test_jwks_rejects_none_algorithm(self):
        """JWKS mode must reject 'none' algorithm tokens.

        The unsigned JWT with alg:none is rejected as malformed by PyJWT
        before even reaching the algorithm check — which is correct.
        """
        from app.core.jwt_auth import (
            JWTVerifier,
            TOKEN_MALFORMED,
            TOKEN_UNSUPPORTED_ALGORITHM,
        )

        token = create_unsigned_jwt()

        verifier = JWTVerifier(
            jwks_url="https://test.supabase.co/.well-known/jwks.json",
            issuer=TEST_ISSUER,
            audience=TEST_AUDIENCE,
        )
        from tests.conftest import create_jwks_response
        verifier._jwks_keys = create_jwks_response()["keys"]
        verifier._jwks_last_fetch = time.time()

        with pytest.raises(Exception) as exc_info:
            verifier.verify(token)
        # Either MALFORMED (can't parse header) or UNSUPPORTED_ALGORITHM —
        # both are safe rejections. The critical thing is the token is rejected.
        assert exc_info.value.code in (TOKEN_MALFORMED, TOKEN_UNSUPPORTED_ALGORITHM)

    def test_secret_mode_rejects_rs256_token(self):
        """Secret mode must reject asymmetric algorithm tokens."""
        from app.core.jwt_auth import (
            JWTVerifier,
            TOKEN_INVALID_CLAIMS,
            TOKEN_INVALID_SIGNATURE,
        )

        token = create_rsa_test_jwt()

        verifier = JWTVerifier(
            jwt_secret=TEST_JWT_SECRET,
            issuer=TEST_ISSUER,
            audience=TEST_AUDIENCE,
        )
        with pytest.raises(Exception) as exc_info:
            verifier.verify(token)
        # Algorithm mismatch rejected — either INVALID_SIGNATURE or
        # INVALID_CLAIMS depending on PyJWT validation order
        assert exc_info.value.code in (
            TOKEN_INVALID_SIGNATURE,
            TOKEN_INVALID_CLAIMS,
        )
