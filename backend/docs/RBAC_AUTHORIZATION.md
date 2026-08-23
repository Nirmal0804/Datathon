# Role-Based Access Control & Authorization

This document describes the authorization model enforced by the
backend: roles, permissions, role resolution, RLS scope, and the
endpoint → permission mapping.

Authorization is **server-side only**. The frontend (mock login) lets
users pick an operational role and stores it in `localStorage`, but the
backend never trusts it. The role is resolved from the **verified**
Supabase Auth JWT.

## Roles

| Role | Meaning |
|------|---------|
| `FIELD_OFFICER` | Operational, field-tier read access. |
| `ANALYST` | Adds intelligence-map, analytics, and network analysis access. |
| `ADMIN` | Full access, including audit log read. |

These roles are the application's current authorization model and do
not claim to represent an official Karnataka Police permission policy.

## Permissions

Permissions are coarse `area.action` strings. Endpoints declare the
permission they require via `Depends(require_permission("..."))`; role
sets are checked against the declared permission. Revising the role →
permission map in `app/core/rbac.py` re-scopes every endpoint without
touching route code.

The complete catalog:

```
dashboard.read  cases.read  cases.export  map.field.read  map.intelligence.read
districts.read stations.read  analytics.read  network.read
network.person.read  network.person.search  network.person.detail
audit.read  users.read  users.manage  roles.read  roles.manage
system.configuration.read  system.configuration.manage
```

(`users.*` and `system.configuration.*` are reserved for future
endpoints and are granted to `ADMIN` only.)

### Role → permission map

- **FIELD_OFFICER**: `dashboard.read`, `cases.read`, `cases.export`,
  `map.field.read`, `districts.read`, `stations.read`
- **ANALYST**: FIELD_OFFICER + `map.intelligence.read`, `analytics.read`,
  `network.read`, `network.person.read`, `network.person.search`,
  `network.person.detail`
- **ADMIN**: every permission

## Role resolution (from the verified JWT)

The JWT is verified as before (signature, issuer, audience, expiry).
Claims are then inspected for a role via configurable dotted paths
(`RBAC_ROLE_CLAIM_PATHS`, default order):

1. `app_metadata.role`   (Supabase convention for privileged metadata)
2. `user_metadata.role`
3. `role`                (top-level claim)

The raw value is normalized (`upper`, `-`/spaces → `_`) and accepted
only if it is in the allowlist `{FIELD_OFFICER, ANALYST, ADMIN}`. If no
allowlisted role claim exists, the identity receives
`RBAC_DEFAULT_ROLE` (**FIELD_OFFICER** — least privilege). This default
is deliberate: an authenticated Supabase user with no custom role
metadata still gets the lowest application tier. Administrative tiers
require an explicit allowlisted claim.

The resolved role and its permission set are attached to the
authenticated identity for every request and used by the audit log
(`audit_events.role`).

## HTTP semantics

| Condition | Status |
|-----------|--------|
| No token / invalid token / expired | 401 (`TOKEN_*` / `AUTHENTICATION_FAILED`) |
| Valid token, permission missing | 403 `FORBIDDEN` |
| Valid token, permission granted | 200 (normal response) |
| RBAC disabled (`RBAC_ENABLED=false`) | All authenticated requests allowed |
| Auth disabled (`REQUIRE_AUTH=false`, dev) | Dev identity = `ADMIN`, full access |

## Endpoint → permission mapping

| Endpoint | Permission |
|----------|-----------|
| `GET /api/v1/dashboard/summary` | `dashboard.read` |
| `GET /api/v1/map/field/cases` | `cases.read` |
| `GET /api/v1/map/field/case/{id}` | `cases.read` |
| `GET /api/v1/map/field/filters` | `map.field.read` |
| `GET /api/v1/map/field/hotspots` | `map.field.read` |
| `GET /api/v1/map/intelligence/analytics` | `map.intelligence.read` |
| `GET /api/v1/map/intelligence/heatmap` | `map.intelligence.read` |
| `GET /api/v1/map/intelligence/clusters` | `map.intelligence.read` |
| `GET /api/v1/map/intelligence/hotspots` | `map.intelligence.read` |
| `GET /api/v1/map/intelligence/district-comparison` | `map.intelligence.read` |
| `GET /api/v1/map/intelligence/timeline` | `map.intelligence.read` |
| `GET /api/v1/map/intelligence/export` | `cases.export` |
| `GET /api/v1/districts` | `districts.read` |
| `GET /api/v1/districts/{id}/intelligence` | `districts.read` |
| `GET /api/v1/stations` | `stations.read` |
| `GET /api/v1/stations/{id}` | `stations.read` |
| `GET /api/v1/network/graph` | `network.read` |
| `GET /api/v1/network/entities/{type}/{id}` | `network.read` OR `network.person.read` |
| `GET /api/v1/network/search` | `network.read` |
| `GET /api/v1/admin/audit/events` | `audit.read` |
| `GET /api/v1/auth/me` | authenticated only (no permission) |

## Row-level security (RLS)

RLS governs the Supabase Data API (`anon`/`authenticated` roles) — a
control independent from the backend API. The backend's privileged
PostgreSQL connection **bypasses RLS by design**; all backend access is
already permission-checked and audit-logged.

Current RLS posture (migration `005_rls.sql`):

- `districts`, `police_stations` — `SELECT` for `authenticated` only.
- `people`, `firs`, `fir_person_roles`, `arrests`, `chargesheets`,
  `ingestion_batches`, `audit_events` — deny-by-default (no policies).

## Headers & configuration

| Setting | Default | Purpose |
|---------|---------|---------|
| `RBAC_ENABLED` | `true` | Master switch for permission checks |
| `RBAC_DEFAULT_ROLE` | `FIELD_OFFICER` | Least-privilege default role |
| `RBAC_ROLE_CLAIM_PATHS` | `app_metadata.role,user_metadata.role,role` | Claim lookup order |
| `RATE_LIMIT_ENABLED` | `true` | Master switch for rate limiting |
| `RATE_LIMIT_DEFAULT_LIMIT` / `_WINDOW` | `300 / 60` | Default allowance |
| `RATE_LIMIT_EXPORT_LIMIT` / `_WINDOW` | `10 / 3600` | Export budget |
| `RATE_LIMIT_SEARCH_LIMIT` / `_WINDOW` | `60 / 60` | Search budget |
| `RATE_LIMIT_AUDIT_LIMIT` / `_WINDOW` | `120 / 60` | Audit read budget |
| `RATE_LIMIT_CLIENT_HEADER` | `X-Forwarded-For` | Proxy client identifier |