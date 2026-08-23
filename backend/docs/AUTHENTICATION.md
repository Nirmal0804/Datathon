# Authentication Architecture

Production authentication for the Karnataka Police Crime Analytics Backend, built on **Supabase Auth** with JWT verification.

## Overview

All `/api/v1/*` routes are protected by deny-by-default middleware. Public endpoints (`/health`, `/docs`) remain accessible without authentication. Authentication is enforced at the ASGI middleware layer before any route handler executes.

## JWT Verification

Two strategies are supported, configured at startup:

| Strategy | Configuration | Use Case |
|----------|--------------|----------|
| **Symmetric (HS256)** | `SUPABASE_JWT_SECRET` | Standard Supabase setup — uses the JWT secret from the Supabase dashboard |
| **Asymmetric (RS256/ES256)** | `SUPABASE_JWKS_URL` | JWKS preferred when configured — fetches public keys from Supabase JWKS endpoint |

When both are configured, JWKS takes precedence. JWKS keys are cached in-memory with a configurable TTL (default 15 minutes).

### Verification Steps

1. Extract `Authorization: Bearer <token>` header
2. If no token → 401 `TOKEN_MISSING`
3. Decode header to determine algorithm (`kid`, `alg`)
4. Reject `alg=none` → 401 `TOKEN_UNSUPPORTED_ALGORITHM`
5. Verify signature, expiry, issuer, audience claims
6. Reject if `sub` claim is missing → 401 `TOKEN_INVALID_CLAIMS`
7. Store verified identity on `request.state.authenticated_identity`

### Error Codes (stable, machine-readable)

| Code | Meaning |
|------|---------|
| `TOKEN_MISSING` | No Authorization header or empty bearer token |
| `TOKEN_MALFORMED` | JWT structure is invalid |
| `TOKEN_EXPIRED` | Token `exp` claim is in the past |
| `TOKEN_INVALID_SIGNATURE` | Signature verification failed |
| `TOKEN_INVALID_CLAIMS` | Issuer, audience, or required claims invalid |
| `TOKEN_UNSUPPORTED_ALGORITHM` | Token uses `alg=none` or unsupported algorithm |
| `AUTH_NOT_CONFIGURED` | No JWT secret or JWKS URL on the server |
| `VERIFICATION_FAILED` | Unexpected verification error |

## Environment Variables

```env
# Required: Supabase project reference (auto-derives issuer/JWKS URL)
SUPABASE_PROJECT_REF=gcxppkdtbvmleynrzqao

# Auth mode: 'postgres' (requires DATABASE_URL)
DATA_BACKEND=postgres

# JWT verification — at least one required for production
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_JWKS_URL=           # Optional: auto-derived if SUPABASE_PROJECT_REF set

# JWT validation
SUPABASE_JWT_ISSUER=https://gcxppkdtbvmleynrzqao.supabase.co/auth/v1
SUPABASE_JWT_AUDIENCE=authenticated
JWKS_CACHE_TTL=900           # JWKS key cache TTL in seconds (default: 900)

# Development mode: skip authentication entirely
REQUIRE_AUTH=false           # Default: true
```

## Public vs Protected Endpoints

| Path | Auth Required |
|------|:------------:|
| `GET /health` | No |
| `GET /health/live` | No |
| `GET /health/ready` | No |
| `GET /docs` | No |
| `GET /redoc` | No |
| `GET /openapi.json` | No |
| `GET /api/v1/*` | **Yes** |
| `GET /api/v1/auth/me` | **Yes** |

## Auth Endpoint

### `GET /api/v1/auth/me`

Returns the verified identity of the authenticated user. No sensitive tokens are returned.

**Request:**
```http
GET /api/v1/auth/me
Authorization: Bearer <supabase-jwt>
```

**Response (200):**
```json
{
  "user_id": "uuid-from-supabase",
  "authenticated": true,
  "email": "officer@ksp.gov.in"
}
```

**Response (401):**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token has expired.",
    "request_id": "req-abc-123"
  }
}
```

## Identity Model

The `AuthenticatedIdentity` contains only verified JWT claims plus a
server-resolved role:

| Field | Source | Description |
|-------|--------|-------------|
| `user_id` | `sub` | Supabase Auth user UUID |
| `email` | `email` | User email (if present in JWT) |
| `role` | `resolve_role(claims)` | Least-privilege role from claim paths (default `FIELD_OFFICER`) |
| `permissions` | `roles[role]` | Permission set used by route authorization deps |
| `district_ids` | claim path | Optional district-scoping data (not exposed in responses) |

Role resolution reads configured claim paths (`app_metadata.role`,
`user_metadata.role`, `role`) and falls back to `RBAC_DEFAULT_ROLE` —
see `docs/RBAC_AUTHORIZATION.md`.

**Never returned:** raw JWT token, refresh token, role claims, district assignments.

## Security Headers

All API responses include:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cache-Control` | `no-store` (for `/api/v1/*`) |
| `Cache-Control` | `max-age=10` (for `/health/*`) |
| `X-Request-ID` | UUID per request |

CORS is configured with explicit `Authorization` header support. A fixed-window
rate limiter runs inside the ASGI stack (see `docs/RBAC_AUTHORIZATION.md` →
Rate limiting): configurable per-route-class limits, `429` + `Retry-After` on
exceed, health/docs exempt.

## Development Mode

When `REQUIRE_AUTH=false`, the middleware:

1. Passes all requests through without verification
2. Attaches a dev identity: `user_id: "dev-user-000"`, role `ADMIN` (all permissions)
3. Logs a warning at startup

**Never enable `REQUIRE_AUTH=false` in production.**

## Architecture Boundary

| Component | Ownership |
|-----------|-----------|
| JWT verification engine | Backend (`app/core/jwt_auth.py`) |
| Identity model | Backend (`app/schemas/auth.py`) |
| Auth middleware | Backend (`app/main.py`) |
| Role/permission resolution | Backend (`app/core/rbac.py`, `app/api/auth_deps.py`) |
| Route authorization | Backend (`app/api/rbac_deps.py` — `ask permission deps`) |
| Audit logging of auth events | Backend (`app/core/audit.py`) |
| Session/token issuance | **Supabase Auth** (frontend responsibility) |
| Login/logout flows | **Frontend** (Supabase Auth UI SDK) |
| User/role management | **Supabase Dashboard** |
| Row Level Security policies | Supabase (`supabase/migrations/005_rls.sql`) |

## Rate Limiting

- In-process fixed-window (`app/core/rate_limit.py`, module-level
  `_default_limiter`), keyed by route template + client IP
  (`X-Forwarded-For` first hop when present).
- Route classes and defaults: generals 300/60s, `crime_data` export
  10/3600s, `search` 60/60s, `audit_events` 120/60s.
- **Single-instance scope**: add a shared store or API-gateway limit
  before running multiple replicas.
- In production `RATE_LIMIT_ENABLED=true` is enforced by config.
