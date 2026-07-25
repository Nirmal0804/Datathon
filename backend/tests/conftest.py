"""Shared test fixtures for authentication testing.

Provides test JWT generation, mock JWKS keys, and auth override
fixtures. Uses cryptographically valid test keys — never disables
signature verification.

AUTH IS DISABLED IN TESTS BY DEFAULT via ``conftest.py`` which sets
``REQUIRE_AUTH=false``. Auth-specific tests set ``REQUIRE_AUTH=true``
and provide valid tokens.
"""

from __future__ import annotations

import os
import time
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Disable auth in test environment
# ---------------------------------------------------------------------------

from app.core.config import settings as _settings

_settings.REQUIRE_AUTH = False


# ---------------------------------------------------------------------------
# Test keys (generated fresh, never used in production)
# ---------------------------------------------------------------------------

# RSA key pair for RS256 JWKS tests
_RSA_PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
_RSA_PUBLIC_KEY = _RSA_PRIVATE_KEY.public_key()

# EC key pair for ES256 JWKS tests
_EC_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())
_EC_PUBLIC_KEY = _EC_PRIVATE_KEY.public_key()

# Test symmetric secret
_TEST_JWT_SECRET = "test-supabase-jwt-secret-for-testing-only-32chars!"

# Test issuer and audience
_TEST_ISSUER = "https://test-project.supabase.co/auth/v1"
_TEST_AUDIENCE = "test-project"


# ---------------------------------------------------------------------------
# Key export helpers
# ---------------------------------------------------------------------------


def get_rsa_private_key() -> rsa.RSAPrivateKey:
    return _RSA_PRIVATE_KEY


def get_rsa_public_jwk() -> dict[str, Any]:
    """Export RSA public key as JWK dict."""
    from jwt.algorithms import RSAAlgorithm

    return RSAAlgorithm(_RSA_PRIVATE_KEY).to_jwk(_RSA_PUBLIC_KEY)


def get_ec_private_key() -> ec.EllipticCurvePrivateKey:
    return _EC_PRIVATE_KEY


def get_ec_public_jwk() -> dict[str, Any]:
    """Export EC public key as JWK dict."""
    from jwt.algorithms import ECAlgorithm

    return ECAlgorithm(_EC_PRIVATE_KEY).to_jwk(_EC_PUBLIC_KEY)


# ---------------------------------------------------------------------------
# JWT generation helpers
# ---------------------------------------------------------------------------


def create_test_jwt(
    *,
    secret: str = _TEST_JWT_SECRET,
    subject: str = "test-user-001",
    issuer: str = _TEST_ISSUER,
    audience: str = _TEST_AUDIENCE,
    expires_in: int = 3600,
    issued_at: int | None = None,
    email: str = "test@example.com",
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create a valid test JWT signed with HMAC-SHA256."""
    now = int(time.time())
    claims: dict[str, Any] = {
        "sub": subject,
        "iss": issuer,
        "exp": now + expires_in,
        "iat": issued_at or now,
    }
    if audience:
        claims["aud"] = audience
    if email:
        claims["email"] = email
    if extra_claims:
        claims.update(extra_claims)

    return jwt.encode(claims, secret, algorithm="HS256")


def create_expired_jwt(
    *,
    secret: str = _TEST_JWT_SECRET,
    subject: str = "test-user-001",
    issuer: str = _TEST_ISSUER,
    audience: str = _TEST_AUDIENCE,
) -> str:
    """Create an expired test JWT."""
    return create_test_jwt(
        secret=secret,
        subject=subject,
        issuer=issuer,
        audience=audience,
        expires_in=-3600,  # expired 1 hour ago
    )


def create_wrong_secret_jwt(
    *,
    subject: str = "test-user-001",
    issuer: str = _TEST_ISSUER,
) -> str:
    """Create a JWT signed with a different secret."""
    return create_test_jwt(
        secret="wrong-secret-that-does-not-match-32chars-long!!",
        subject=subject,
        issuer=issuer,
    )


def create_wrong_issuer_jwt(
    *,
    secret: str = _TEST_JWT_SECRET,
    subject: str = "test-user-001",
) -> str:
    """Create a JWT with wrong issuer."""
    return create_test_jwt(
        secret=secret,
        subject=subject,
        issuer="https://evil.supabase.co/auth/v1",
    )


def create_missing_sub_jwt(
    *,
    secret: str = _TEST_JWT_SECRET,
) -> str:
    """Create a JWT missing the required 'sub' claim."""
    now = int(time.time())
    claims = {
        "iss": _TEST_ISSUER,
        "exp": now + 3600,
        "iat": now,
        "aud": _TEST_AUDIENCE,
    }
    return jwt.encode(claims, secret, algorithm="HS256")


def create_malformed_jwt() -> str:
    """Return a clearly malformed token string."""
    return "not.a.valid.jwt.token"


def create_unsigned_jwt() -> str:
    """Create a JWT-like string with 'none' algorithm (signature stripped)."""
    import base64
    import json

    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "none", "typ": "JWT"}).encode()
    ).rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(
        json.dumps({
            "sub": "attacker",
            "iss": _TEST_ISSUER,
            "exp": int(time.time()) + 3600,
        }).encode()
    ).rstrip(b"=").decode()
    return f"{header}.{payload}."


# ---------------------------------------------------------------------------
# JWKS helper
# ---------------------------------------------------------------------------


def create_jwks_response() -> dict[str, Any]:
    """Create a JWKS response with RSA and EC test keys."""
    import base64

    def _int_to_b64(n: int) -> str:
        byte_length = (n.bit_length() + 7) // 8
        return base64.urlsafe_b64encode(
            n.to_bytes(byte_length, byteorder="big")
        ).rstrip(b"=").decode()

    rsa_jwk = {
        "kty": "RSA",
        "kid": "test-rsa-key-001",
        "use": "sig",
        "alg": "RS256",
        "n": _int_to_b64(_RSA_PUBLIC_KEY.public_numbers().n),
        "e": _int_to_b64(_RSA_PUBLIC_KEY.public_numbers().e),
    }

    ec_jwk = {
        "kty": "EC",
        "kid": "test-ec-key-001",
        "use": "sig",
        "alg": "ES256",
        "crv": "P-256",
        "x": _int_to_b64(_EC_PUBLIC_KEY.public_numbers().x),
        "y": _int_to_b64(_EC_PUBLIC_KEY.public_numbers().y),
    }

    return {"keys": [rsa_jwk, ec_jwk]}


def create_rsa_test_jwt() -> str:
    """Create a test JWT signed with RSA key pair."""
    now = int(time.time())
    claims = {
        "sub": "test-user-rsa",
        "iss": _TEST_ISSUER,
        "exp": now + 3600,
        "iat": now,
        "aud": _TEST_AUDIENCE,
        "email": "rsa-test@example.com",
    }
    return jwt.encode(claims, _RSA_PRIVATE_KEY, algorithm="RS256", headers={"kid": "test-rsa-key-001"})


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

TEST_JWT_SECRET = _TEST_JWT_SECRET
TEST_ISSUER = _TEST_ISSUER
TEST_AUDIENCE = _TEST_AUDIENCE
