"""Supabase JWT verification engine.

Provides cryptographic JWT verification for Supabase Auth tokens.
Supports two verification strategies:

1. **Symmetric (HS256)** — uses SUPABASE_JWT_SECRET from Supabase dashboard.
2. **Asymmetric (RS256/ES256)** — fetches public keys from Supabase JWKS
   endpoint, with in-memory caching and key rotation support.

The verifier is configured once at startup and reused across requests.
JWKS keys are cached with a configurable TTL (default 15 minutes).

Security properties:
    - Signature verification is mandatory (never disabled).
    - Expired tokens are rejected.
    - Issuer and audience claims are validated.
    - Malformed tokens produce safe error messages.
    - No token content is logged.
    - Fails closed when verification cannot be completed.
"""

from __future__ import annotations

import logging
import time
from typing import Any

import jwt
import jwt.algorithms as jwt_algorithms

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Algorithm allowlists (algorithm confusion prevention)
# ---------------------------------------------------------------------------

# JWKS/asymmetric mode: only accept asymmetric algorithms
_JWKS_ALLOWED_ALGORITHMS = frozenset({"RS256", "RS384", "RS512", "ES256", "ES384", "ES512"})

# Secret/symmetric mode: only accept HMAC algorithms
_SECRET_ALLOWED_ALGORITHMS = frozenset({"HS256"})

# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------


class AuthenticationError(Exception):
    """Raised when JWT verification fails.

    Carries a stable machine-readable code and a safe human message.
    No cryptographic details or token contents are included.
    """

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


# Error codes (stable, machine-readable)
TOKEN_MISSING = "TOKEN_MISSING"
TOKEN_MALFORMED = "TOKEN_MALFORMED"
TOKEN_EXPIRED = "TOKEN_EXPIRED"
TOKEN_INVALID_SIGNATURE = "TOKEN_INVALID_SIGNATURE"
TOKEN_INVALID_CLAIMS = "TOKEN_INVALID_CLAIMS"
TOKEN_UNSUPPORTED_ALGORITHM = "TOKEN_UNSUPPORTED_ALGORITHM"
VERIFICATION_FAILED = "VERIFICATION_FAILED"
AUTH_NOT_CONFIGURED = "AUTH_NOT_CONFIGURED"


# ---------------------------------------------------------------------------
# JWKS Cache
# ---------------------------------------------------------------------------


class _JWKSCache:
    """In-memory JWKS key set cache with TTL-based expiry."""

    def __init__(self, ttl_seconds: int = 900) -> None:
        self._ttl = ttl_seconds
        self._keys: dict[str, Any] = {}
        self._fetched_at: float = 0.0
        self._last_error: str | None = None

    @property
    def is_stale(self) -> bool:
        return (time.monotonic() - self._fetched_at) > self._ttl

    @property
    def has_keys(self) -> bool:
        return bool(self._keys)

    def get_key(self, kid: str) -> Any | None:
        return self._keys.get(kid)

    def update(self, keys: dict[str, Any]) -> None:
        self._keys = keys
        self._fetched_at = time.monotonic()
        self._last_error = None

    def set_error(self, error: str) -> None:
        self._last_error = error


# ---------------------------------------------------------------------------
# JWT Verifier
# ---------------------------------------------------------------------------


class JWTVerifier:
    """Production-grade Supabase JWT verifier.

    Supports both symmetric (HS256 with JWT secret) and asymmetric
    (RS256/ES256 via JWKS) verification. JWKS is preferred when
    ``jwks_url`` is configured.
    """

    def __init__(
        self,
        *,
        jwt_secret: str = "",
        jwks_url: str = "",
        issuer: str = "",
        audience: str = "",
        jwks_cache_ttl: int = 900,
    ) -> None:
        self._secret = jwt_secret
        self._jwks_url = jwks_url
        self._issuer = issuer
        self._audience = audience
        self._jwks_cache = _JWKSCache(ttl_seconds=jwks_cache_ttl)
        self._use_jwks = bool(jwks_url)

        if not self._secret and not self._use_jwks:
            logger.warning(
                "No SUPABASE_JWT_SECRET or SUPABASE_JWKS_URL configured; "
                "JWT verification will reject all tokens"
            )

    def verify(self, token: str) -> dict[str, Any]:
        """Verify a JWT and return its decoded claims.

        Parameters
        ----------
        token:
            Raw JWT string (without ``Bearer `` prefix).

        Returns
        -------
        dict
            Verified JWT claims.

        Raises
        ------
        AuthenticationError
            If the token is missing, malformed, expired, has invalid
            signature, wrong issuer/audience, or any other verification
            failure.
        """
        if not token:
            raise AuthenticationError(TOKEN_MISSING, "No token provided.")

        # Try JWKS first, fall back to symmetric
        if self._use_jwks:
            return self._verify_with_jwks(token)
        return self._verify_with_secret(token)

    def _verify_with_secret(self, token: str) -> dict[str, Any]:
        """Verify JWT using symmetric HS256 with the JWT secret."""
        if not self._secret:
            raise AuthenticationError(
                AUTH_NOT_CONFIGURED,
                "JWT verification is not configured.",
            )

        try:
            kwargs: dict[str, Any] = {
                "algorithms": list(_SECRET_ALLOWED_ALGORITHMS),
                "options": {
                    "require": ["exp", "sub", "iss"],
                },
            }
            if self._issuer:
                kwargs["issuer"] = self._issuer
            if self._audience:
                kwargs["audience"] = self._audience

            claims = jwt.decode(
                token,
                self._secret,
                **kwargs,
            )
            return claims

        except jwt.ExpiredSignatureError:
            raise AuthenticationError(TOKEN_EXPIRED, "Token has expired.")
        except jwt.InvalidAudienceError:
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS, "Invalid token audience."
            )
        except jwt.InvalidIssuerError:
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS, "Invalid token issuer."
            )
        except jwt.MissingRequiredClaimError as exc:
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS,
                f"Token is missing required claim: {exc.claim}.",
            )
        except jwt.InvalidSignatureError:
            raise AuthenticationError(
                TOKEN_INVALID_SIGNATURE, "Invalid token signature."
            )
        except jwt.DecodeError:
            raise AuthenticationError(TOKEN_MALFORMED, "Token is malformed.")
        except jwt.InvalidTokenError as exc:
            # Catch-all for PyJWT validation errors
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS, f"Token validation failed: {type(exc).__name__}."
            )
        except Exception:
            logger.exception("unexpected JWT verification error")
            raise AuthenticationError(
                VERIFICATION_FAILED, "Token verification failed."
            )

    def _verify_with_jwks(self, token: str) -> dict[str, Any]:
        """Verify JWT using JWKS public keys (asymmetric RS256/ES256)."""
        try:
            # Decode header to get kid and algorithm
            try:
                unverified_header = jwt.get_unverified_header(token)
            except Exception:
                raise AuthenticationError(TOKEN_MALFORMED, "Token is malformed.")

            kid = unverified_header.get("kid")
            alg = unverified_header.get("alg", "")

            if not kid:
                raise AuthenticationError(
                    TOKEN_MALFORMED, "Token header missing key ID."
                )

            # CRITICAL: Reject algorithms outside the asymmetric allowlist.
            # This prevents algorithm confusion attacks where an attacker
            # crafts a token with alg=HS256 and signs it with the public key.
            if alg not in _JWKS_ALLOWED_ALGORITHMS:
                raise AuthenticationError(
                    TOKEN_UNSUPPORTED_ALGORITHM,
                    f"Token algorithm '{alg}' is not allowed in JWKS mode.",
                )

            # Fetch JWKS if stale or first use
            if self._jwks_cache.is_stale or not self._jwks_cache.has_keys:
                self._fetch_jwks()

            # Get the key
            key = self._jwks_cache.get_key(kid)
            if key is None:
                # Key may have been rotated — force refresh
                self._fetch_jwks()
                key = self._jwks_cache.get_key(kid)

            if key is None:
                raise AuthenticationError(
                    TOKEN_INVALID_SIGNATURE,
                    "Unable to find signing key.",
                )

            # Build verification key
            try:
                public_key = jwt.PyJWK.from_dict(key).key
            except Exception:
                try:
                    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                except Exception:
                    try:
                        public_key = jwt_algorithms.ECAlgorithm.from_jwk(key)
                    except Exception:
                        raise AuthenticationError(
                            VERIFICATION_FAILED,
                            "Unable to process signing key.",
                        )

            # Verify
            kwargs: dict[str, Any] = {
                "algorithms": [alg],
                "options": {
                    "require": ["exp", "sub", "iss"],
                },
            }
            if self._issuer:
                kwargs["issuer"] = self._issuer
            if self._audience:
                kwargs["audience"] = self._audience

            claims = jwt.decode(token, public_key, **kwargs)
            return claims

        except AuthenticationError:
            raise
        except jwt.ExpiredSignatureError:
            raise AuthenticationError(TOKEN_EXPIRED, "Token has expired.")
        except jwt.InvalidAudienceError:
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS, "Invalid token audience."
            )
        except jwt.InvalidIssuerError:
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS, "Invalid token issuer."
            )
        except jwt.MissingRequiredClaimError as exc:
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS,
                f"Token is missing required claim: {exc.claim}.",
            )
        except jwt.InvalidSignatureError:
            raise AuthenticationError(
                TOKEN_INVALID_SIGNATURE, "Invalid token signature."
            )
        except jwt.DecodeError:
            raise AuthenticationError(TOKEN_MALFORMED, "Token is malformed.")
        except jwt.InvalidTokenError as exc:
            raise AuthenticationError(
                TOKEN_INVALID_CLAIMS, f"Token validation failed: {type(exc).__name__}."
            )
        except Exception:
            logger.exception("unexpected JWKS verification error")
            raise AuthenticationError(
                VERIFICATION_FAILED, "Token verification failed."
            )

    def _fetch_jwks(self) -> None:
        """Fetch and cache JWKS keys from the configured endpoint."""
        import httpx

        try:
            response = httpx.get(
                self._jwks_url,
                timeout=5.0,
                follow_redirects=True,
            )
            response.raise_for_status()
            jwks = response.json()

            keys = {}
            for key_data in jwks.get("keys", []):
                kid = key_data.get("kid")
                if kid:
                    keys[kid] = key_data

            if not keys:
                self._jwks_cache.set_error("JWKS endpoint returned no keys")
                logger.warning("JWKS endpoint returned no keys")
                return

            self._jwks_cache.update(keys)
            logger.info("JWKS keys cached (%d keys, TTL %ds)", len(keys), self._jwks_cache._ttl)

        except httpx.TimeoutException:
            self._jwks_cache.set_error("JWKS endpoint timed out")
            logger.warning("JWKS endpoint timed out")
            if not self._jwks_cache.has_keys:
                raise AuthenticationError(
                    VERIFICATION_FAILED,
                    "Unable to fetch signing keys.",
                )
        except httpx.HTTPStatusError as exc:
            self._jwks_cache.set_error(f"JWKS endpoint returned {exc.response.status_code}")
            logger.warning("JWKS endpoint returned status %d", exc.response.status_code)
            if not self._jwks_cache.has_keys:
                raise AuthenticationError(
                    VERIFICATION_FAILED,
                    "Unable to fetch signing keys.",
                )
        except Exception:
            self._jwks_cache.set_error("JWKS fetch failed")
            logger.exception("JWKS fetch error")
            if not self._jwks_cache.has_keys:
                raise AuthenticationError(
                    VERIFICATION_FAILED,
                    "Unable to fetch signing keys.",
                )


# ---------------------------------------------------------------------------
# Module-level verifier (initialized at startup)
# ---------------------------------------------------------------------------

_verifier: JWTVerifier | None = None


def init_verifier(
    *,
    jwt_secret: str = "",
    jwks_url: str = "",
    issuer: str = "",
    audience: str = "",
    jwks_cache_ttl: int = 900,
) -> None:
    """Initialize the module-level JWT verifier. Call once at startup."""
    global _verifier
    _verifier = JWTVerifier(
        jwt_secret=jwt_secret,
        jwks_url=jwks_url,
        issuer=issuer,
        audience=audience,
        jwks_cache_ttl=jwks_cache_ttl,
    )
    method = "JWKS" if jwks_url else "HS256" if jwt_secret else "none"
    logger.info("JWT verifier initialized (method=%s)", method)


def verify_token(token: str) -> dict[str, Any]:
    """Verify a JWT token using the module-level verifier.

    Raises AuthenticationError if verification fails.
    """
    if _verifier is None:
        raise AuthenticationError(
            AUTH_NOT_CONFIGURED,
            "JWT verification is not configured.",
        )
    return _verifier.verify(token)
