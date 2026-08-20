# AUDIT_LOGGING.md — Production Audit Trail

> **Created:** Production Audit Logging checkpoint.
>
> This document describes the audit logging architecture for the Karnataka
> Police Crime Analytics backend. Audit logging provides a durable,
> append-only security trail for authenticated API access.

---

## 1. Architecture

```text
HTTP Request
    ↓
CORSMiddleware             → CORS preflight + response headers
    ↓
SecurityHeadersMiddleware  → security/cache headers (all responses)
    ↓
RequestIDMiddleware        → assigns correlation ID
    ↓
StructuredLoggingMiddleware → operational request logging
    ↓
RateLimitMiddleware        → fixed-window limits (429 never audited)
    ↓
AuditMiddleware            → classifies route, captures outcome
    ↓
AuthenticationMiddleware   → JWT verification, sets identity
    ↓
FastAPI Routes             → application logic
    ↓
AuditMiddleware            → writes audit event (after response)
```

The audit middleware wraps AuthenticationMiddleware so that both granted
requests and denied (401/403) attempts are recorded. Identity is read from
`scope["state"]["authenticated_identity"]` after the inner middleware chain
completes — never trusted from the request itself. Rate-limited (429) requests
are rejected upstream by RateLimitMiddleware and never enter the audit trail.

### Layer diagram

```text
API/middleware
    ↓
AuditMiddleware (core/audit.py)
    ↓
AuditService (services/audit_service.py)
    ↓
AuditRepository Protocol (database/repositories/protocols.py)
    ↓
PostgreSQL implementation (database/postgres/audit_repo.py)  [production]
No-op adapter (database/repositories/csv/audit_repo.py)      [development]
```

---

## 2. Database Schema

**Migrations:** `supabase/migrations/002_audit_events.sql`,
`supabase/migrations/004_audit_role.sql` (adds `role`)

```sql
CREATE TABLE audit_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_id      TEXT NOT NULL,
    user_id         TEXT,
    role            TEXT,              -- resolved RBAC role (004_audit_role.sql)
    http_method     TEXT NOT NULL,
    route           TEXT NOT NULL,
    action          TEXT NOT NULL,
    resource_type   TEXT NOT NULL,
    resource_id     TEXT,
    outcome         TEXT NOT NULL,
    status_code     INTEGER NOT NULL,
    client_info     JSONB,
    schema_version  INTEGER NOT NULL DEFAULT 1
);
```

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_audit_events_timestamp` | `event_timestamp` | Time-range queries |
| `idx_audit_events_user_id` | `user_id` | Per-user audit lookups |
| `idx_audit_events_role` | `role` | Role-filtered audit queries (004) |
| `idx_audit_events_request_id` | `request_id` | Correlation/tracing |
| `idx_audit_events_action_resource` | `action, resource_type` | Action/resource filtering |
| `idx_audit_events_outcome` | `outcome` | Failure/denial analysis |

### RLS

Row Level Security is enabled on `audit_events` with **no permissive
policies**. This means direct browser/anonymous access is deny-by-default.
The backend's PostgreSQL service-role connection bypasses RLS for writes.

---

## 3. Audit Event Contract

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | yes | Unique event identifier (auto-generated) |
| `event_timestamp` | TIMESTAMPTZ | yes | UTC timestamp when request/response completed |
| `request_id` | TEXT | yes | Correlation ID from X-Request-ID header |
| `user_id` | TEXT | no | Verified authenticated subject (JWT `sub`). NULL for anonymous. |
| `role` | TEXT | no | Resolved RBAC role (e.g. `FIELD_OFFICER`, `ADMIN`). See `docs/RBAC_AUTHORIZATION.md`. |
| `http_method` | TEXT | yes | HTTP method (GET, POST, etc.) |
| `route` | TEXT | yes | Actual request path (normalized for dynamic segments) |
| `action` | TEXT | yes | Deterministic action classification |
| `resource_type` | TEXT | yes | Deterministic resource type |
| `resource_id` | TEXT | no | Safe resource identifier (FIR ID, station ID, etc.) |
| `outcome` | TEXT | yes | SUCCESS, DENIED, or FAILURE |
| `status_code` | INTEGER | yes | HTTP response status code |
| `client_info` | JSONB | no | Optional safe metadata (extensible, not populated by default) |
| `schema_version` | INTEGER | yes | Schema version for future evolution (currently 1) |

---

## 4. Action/Resource Taxonomy

### Actions

| Action | Meaning |
|--------|---------|
| `READ` | Read a single resource or aggregate |
| `LIST` | List multiple resources |
| `SEARCH` | Search/query resources |
| `EXPORT` | Export/download data |

### Resource types

| Resource Type | Routes |
|---------------|--------|
| `dashboard_summary` | `/api/v1/dashboard/summary` |
| `fir` | `/api/v1/map/field/cases`, `/api/v1/map/field/case/{id}` |
| `field_filters` | `/api/v1/map/field/filters` |
| `hotspot` | `/api/v1/map/field/hotspots`, `/api/v1/map/intelligence/hotspots` |
| `crime_map` | `/api/v1/map/intelligence/analytics`, `/heatmap`, `/clusters`, `/timeline` |
| `district` | `/api/v1/districts`, `/api/v1/districts/{id}/intelligence`, `/intelligence/district-comparison` |
| `station` | `/api/v1/stations`, `/api/v1/stations/{id}` |
| `network_graph` | `/api/v1/network/graph` |
| `network_entity` | `/api/v1/network/entities/{type}/{id}` |
| `network` | `/api/v1/network/search` |
| `crime_data` | `/api/v1/map/intelligence/export` |
| `authenticated_identity` | `/api/v1/auth/me` |

### Outcome semantics

| Outcome | HTTP Status | Meaning |
|---------|-------------|---------|
| `SUCCESS` | 2xx–4xx | Request completed (including 404, 422, etc.) |
| `DENIED` | 401, 403 | Authentication/authorization rejection (403 = insufficient RBAC permission) |
| `FAILURE` | 5xx | Server error |

---

## 5. Privacy / Excluded Fields

Audit records MUST NOT contain:

- Authorization header / JWT / access token / refresh token
- Password / Supabase secret / service-role key / DATABASE_URL
- Request body / response body
- Raw CSV export contents
- Full person record / full name / DOB / address / phone / email
- Blood group / DNA data / fingerprint data / photograph data
- Biometric data
- Raw search query text
- Raw filter values that could contain sensitive content
- Exception stack traces (stored in application logs, not audit)

Only explicitly allowlisted fields are persisted. The field allowlisting
is enforced in `AuditService.write_audit_event()`.

---

## 6. Authentication Identity Integration

The audit subject (`user_id`) comes exclusively from the verified
authentication context set by `AuthenticationMiddleware` on
`scope["state"]["authenticated_identity"]`.

- The audit middleware does NOT decode JWTs.
- The audit middleware does NOT trust custom headers for identity.
- For authenticated requests: `user_id = identity["user_id"]` (the JWT `sub` claim).
- For dev mode (REQUIRE_AUTH=false): `user_id = "dev-user-000"`.
- For public/health endpoints: not audited (excluded).

---

## 7. Request Path Normalization

Dynamic path segments are normalized to route templates:

| Actual Path | Normalized Route |
|-------------|-----------------|
| `/api/v1/map/field/case/FIR_123` | `/api/v1/map/field/case/{fir_identifier}` |
| `/api/v1/districts/5/intelligence` | `/api/v1/districts/{district_id}/intelligence` |
| `/api/v1/stations/PS001` | `/api/v1/stations/{station_id}` |
| `/api/v1/network/entities/person/P123` | `/api/v1/network/entities/{entity_type}/{entity_id}` |

Safe resource IDs are extracted separately in the `resource_id` field.
Arbitrary URL parameters are not stored.

---

## 8. Health Probe Policy

**Excluded from audit:** `/health`, `/health/live`, `/health/ready`

High-frequency infrastructure probes do NOT generate audit events.
This prevents health-check traffic from flooding the security audit table.

Documentation-only endpoints (`/docs`, `/redoc`, `/openapi.json`) are
also excluded.

---

## 9. Export Auditing

CSV export (`/api/v1/map/intelligence/export`) is classified as:

```
action = EXPORT
resource_type = crime_data
resource_id = None  (no filter values stored)
```

The audit event records that an export occurred, who requested it,
and whether it succeeded — but does NOT store:
- CSV contents
- Raw filter values
- Response body

Existing export safeguards are preserved:
- `MAX_EXPORT_ROWS` limit
- 413 `EXPORT_LIMIT_EXCEEDED` on overflow
- Formula injection protection
- PII stripping
- Authentication requirement

An oversized rejected export still produces an appropriate audit event
(FAILURE with status 413).

---

## 10. Network Auditing

Network endpoints are classified as:

| Route | Action | Resource Type |
|-------|--------|---------------|
| `/api/v1/network/graph` | READ | `network_graph` |
| `/api/v1/network/entities/{type}/{id}` | READ | `network_entity` |
| `/api/v1/network/search` | SEARCH | `network` |

The audit does NOT store:
- Raw graph data
- Person data
- Search query text
- Relationship payloads

For entity detail, the safe entity identifier is stored in `resource_id`.

---

## 11. Append-Only / Tamper Resistance

Application-level protections:
- The `AuditRepository` protocol defines `append()` (write) and `query()`
  (read-only pagination). No update/delete operations exist.
- The PostgreSQL implementation has only INSERT + SELECT (no UPDATE/DELETE).
- The only public audit API is `GET /api/v1/admin/audit/events`
  (requires `audit.read`, ADMIN-scoped). No `DELETE /audit/*` exists.
- Audit events are `frozen` dataclass instances.

**Not implemented (future concerns):**
- Cryptographic immutability / hash chains
- Database-level append-only permissions
- WORM storage / archival policies
- These remain deployment/security hardening concerns.

---

## 12. Failure Policy

**Policy: fail-open with high visibility.**

| Scenario | Behavior |
|----------|----------|
| Audit write succeeds | Event persisted, request proceeds normally |
| Audit write fails | CRITICAL log emitted, request proceeds normally |
| Audit repo not initialized | CRITICAL log emitted, request proceeds normally |
| Audit middleware exception | CRITICAL log emitted, original exception re-raised |

Guarantees:
- Audit failures never silently disappear
- Audit failures are operationally visible (CRITICAL level)
- No recursive audit failure loop
- Original secrets/data do not leak through audit error handling
- Original request is never blocked by audit failure

---

## 13. Retention Policy

**Status: BLOCKED_REQUIREMENTS**

No automatic retention or deletion policy is implemented.
The schema supports future retention/archival operations.
Government retention duration requirements have not been supplied.

---

## 14. Audit Read API

**Status: IMPLEMENTED** — `GET /api/v1/admin/audit/events`

- Requires `audit.read` permission (ADMIN role by default); unauthenticated → 401, insufficient permission → 403 `FORBIDDEN`.
- Query params (exact-match allowlist): `user_id`, `role`, `action`, `resource_type`, `outcome`, plus `start_time`/`end_time` (ISO 8601) and `limit`/`offset` (max page size 200).
- Response: `{"items": [...], "pagination": {...}}` via `app/schemas/audit.py` — no sensitive fields.
- CSV/dev deployments (NoOp repository) return `503 DEPENDENCY_UNAVAILABLE` — never a fabricated empty success.
- Rate limited as the `audit_events` class (default 120/60s).

No DELETE/mutation path exists — the log remains append-only.

---

## 15. CSV / Development Behavior

When `DATA_BACKEND=csv`:
- A `NoOpAuditRepository` is used.
- Audit events are logged at INFO level for development visibility.
- A one-time WARNING is emitted that events are not persisted.
- Production MUST use `DATA_BACKEND=postgres` for durable audit persistence.

---

## 16. Production Invariants

| Invariant | Enforced |
|-----------|----------|
| `DATA_BACKEND=postgres` required for durable audit | Documented; startup validation in config |
| Audit events append-only | Protocol + implementation (no UPDATE/DELETE paths) |
| Audit read API requires RBAC | `audit.read` dep on admin router |
| No RLS bypass from browser | RLS enabled, no permissive policies |
| Health probes excluded | `should_audit()` check |
| No secrets in audit records | Field allowlisting in service |

---

## 17. Operational Logging vs Audit Logging

| Concern | Application Logging | Audit Logging |
|---------|-------------------|---------------|
| Purpose | Debugging, operations | Security, accountability |
| Destination | stdout/file logs | PostgreSQL `audit_events` |
| Content | Request line, errors, stack traces | Who, what, when, outcome |
| Sensitive data | May include safe error context | Never |
| Retention | Log rotation | BLOCKED_REQUIREMENTS |
| Mutation | N/A | Append-only |

Audit write failures produce safe operational logs (request ID, route,
action, outcome) without including sensitive payloads.

---

## 18. Migration Documentation

**Migration:** `002_audit_events.sql`

- Non-destructive: no existing tables modified
- Creates `audit_events` table with indexes
- Enables RLS with deny-by-default policy
- Existing data completely unaffected
- Application to Supabase: run via Supabase SQL Editor or migration tool

---

## 19. Files

| File | Purpose |
|------|---------|
| `app/core/audit.py` | AuditEvent model (+ `role`), classification taxonomy, AuditMiddleware, 403 → DENIED |
| `app/services/audit_service.py` | AuditService with field allowlisting, persistence, and `query_audit_events` |
| `app/database/repositories/protocols.py` | AuditRepository protocol (append + read-only query) |
| `app/database/postgres/audit_repo.py` | PostgreSQL audit repository (INSERT + parameterized query) |
| `app/database/repositories/csv/audit_repo.py` | No-op dev/test adapter (query → 503 DependencyUnavailableError) |
| `app/api/admin.py` | `GET /api/v1/admin/audit/events` router (requires `audit.read`) |
| `app/schemas/audit.py` | AuditEventItem / AuditEventPage response schemas |
| `app/main.py` | Middleware registration + audit repo initialization |
| `supabase/migrations/002_audit_events.sql` | Database schema |
| `supabase/migrations/004_audit_role.sql` | Adds `role` column + `idx_audit_events_role` |
| `tests/test_audit.py` | 71 comprehensive tests (write path) |
| `tests/test_audit_api.py` | Audit read API tests (incl. 503 CSV-mode) |
| `docs/AUDIT_LOGGING.md` | This document |
