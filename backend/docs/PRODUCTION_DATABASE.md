# Production Database Migration

## Overview

This document describes the production PostgreSQL database schema, repositories, and ingestion pipeline for the Karnataka Police Crime Analytics Backend.

## Architecture

```
DATA_BACKEND=csv     → In-memory CSV repositories (transitional)
DATA_BACKEND=postgres → PostgreSQL repositories via psycopg2
```

The persistence backend is selected at startup via the `DATA_BACKEND` environment variable. There is no runtime fallback — the configured backend must be functional.

## Schema Design

### Normalization Decisions

| CSV Source | Production Table | Normalization |
|------------|-----------------|---------------|
| `districts.csv` | `districts` | Direct mapping |
| `stations.csv` | `police_stations` | FK to `districts(district_id)` |
| `people.csv` | `people` | FK to `police_stations(station_id)` |
| `firs.csv` | `firs` | FKs to `police_stations`, `people` (complainant, victim) |
| `firs.csv` (Accused_ID) | `fir_person_roles` | **Normalized** — comma-separated → junction table |
| `arrests.csv` | `arrests` | FKs to `firs`, `people`, `police_stations` |
| `chargesheets.csv` | `chargesheets` | FKs to `firs`, `people` |

### Key Design Decisions

1. **Accused_ID Normalization**: The CSV `firs.Accused_ID` contains comma-separated `Person_ID` values. In PostgreSQL, these are split into the `fir_person_roles` junction table with `role = 'accused'`.

2. **Person Roles**: The junction table `fir_person_roles` stores all FIR-person relationships (complainant, victim, accused) with a `person_role` ENUM type.

3. **Identifier Strategy**: Source identifiers (e.g., `District_ID`, `Station_ID`, `Person_ID`) are preserved as `UNIQUE NOT NULL` columns for traceability and ingestion idempotency. Internal `SERIAL` `id` columns serve as primary keys.

4. **Timestamps**: All timestamp columns use `TIMESTAMPTZ` for timezone safety.

5. **Audit Trail**: The `ingestion_batches` table records every data ingestion attempt with counts and status.

### Tables

| Table | Rows | Description |
|-------|------|-------------|
| `districts` | 31 | Karnataka Police district reference data |
| `police_stations` | 250 | Police station reference data |
| `people` | 10,000 | Person records (PII — handle with care) |
| `firs` | 5,000 | First Information Reports |
| `fir_person_roles` | ~15,000 | FIR-person relationships (junction) |
| `arrests` | 2,540 | Arrest records |
| `chargesheets` | 2,469 | Chargesheet records |
| `ingestion_batches` | varies | Audit trail for data ingestion |

## Configuration

### Environment Variables

```bash
# Persistence backend: "csv" or "postgres"
DATA_BACKEND=csv

# PostgreSQL connection (required when DATA_BACKEND=postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname?search_path=public
DATABASE_POOL_MIN=1
DATABASE_POOL_MAX=10
```

### Supabase Configuration

For Supabase PostgreSQL:
```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Connection Management

- **Module**: `app/database/postgres/__init__.py`
- **Pool**: `psycopg2.pool.ThreadedConnectionPool`
- **Lifecycle**: Initialized on app startup, closed on shutdown
- **Context managers**: `get_connection()`, `get_cursor()`
- **Helpers**: `execute_query()`, `execute_one()`, `execute_write()`, `execute_many()`

## Repositories

All PostgreSQL repositories follow the same interface as their CSV counterparts:

| Repository | File | Methods |
|-----------|------|---------|
| `PostgresDistrictRepository` | `postgres/district_repo.py` | `list_all()`, `get_by_id()`, `get_by_name()` |
| `PostgresStationRepository` | `postgres/station_repo.py` | `list_all()`, `get_by_id()`, `list_by_district()`, `list_by_district_and_type()` |
| `PostgresPersonRepository` | `postgres/person_repo.py` | `get_by_id()`, `list_by_station()`, `list_by_district()` |
| `PostgresFIRRepository` | `postgres/fir_repo.py` | `list_all()`, `get_by_id()`, `list_by_station()`, `list_by_district()`, `list_by_incident_date_range()`, `list_by_crime_head()`, `list_by_status()` |
| `PostgresArrestRepository` | `postgres/arrest_repo.py` | `list_all()`, `get_by_id()`, `list_by_station()`, `list_by_fir()`, `list_by_person()` |
| `PostgresChargeSheetRepository` | `postgres/chargesheet_repo.py` | `list_all()`, `get_by_id()`, `list_by_station()`, `list_by_fir()` |

### Protocol Compliance

All repositories (both CSV and Postgres) satisfy the repository protocols defined in `app/database/repositories/protocols.py`. Key corrections:

- **`get_by_fir_id` returns `List[Record]`** (not `Optional[Record]`) for Arrest and ChargeSheet repositories, preserving 1:N cardinality.
- **`chargesheets.fir_id` is NOT UNIQUE** — domain does not guarantee 1:1 FIR-chargesheet relationship.
- `RepositoryCollection` is typed with Protocol types (not `object`).

### FIR Repository Note

The FIR repository reconstructs `FIRRecord.accused_ids` by joining `fir_person_roles` with `role = 'accused'` via a correlated subquery. This transparently normalizes the data while preserving the existing `FIRRecord` interface.

## Ingestion

### Running Ingestion

```bash
# Set environment
export DATA_BACKEND=postgres
export DATABASE_URL=postgresql://...

# Run ingestion
python -m app.database.ingest.run /path/to/data/schema_reference
```

### Ingestion Properties

- **Deterministic**: Same CSV input produces identical database state
- **Repeatable**: Multiple runs do not create duplicate records (UPSERT)
- **Idempotent**: Re-running with same data produces same result
- **Transaction-safe**: Partial failures roll back completely
- **Auditable**: Every batch recorded in `ingestion_batches`
- **No PII in logs**: Names and IDs never appear in log output
- **UPSERT by source identifiers**: Arrests by `arrest_id`, chargesheets by `chargesheet_id`, FIRs by `fir_id` — never by `fir_id` for arrest/chargesheet tables

### Ingestion Order

Tables are ingested in FK dependency order:
1. `districts`
2. `police_stations`
3. `people`
4. `firs` + `fir_person_roles`
5. `arrests`
6. `chargesheets`

## Indexes

```sql
-- District lookups
CREATE INDEX idx_stations_district ON police_stations(district_id);

-- Person lookups
CREATE INDEX idx_people_district ON people(district);
CREATE INDEX idx_people_station ON people(station_id);

-- FIR lookups (most common query patterns)
CREATE INDEX idx_firs_station ON firs(station_id);
CREATE INDEX idx_firs_district ON firs(district);
CREATE INDEX idx_firs_status ON firs(status);
CREATE INDEX idx_firs_crime_head ON firs(crime_head);
CREATE INDEX idx_firs_incident_date ON firs(incident_date);

-- Junction table
CREATE INDEX idx_fpr_fir ON fir_person_roles(fir_id);
CREATE INDEX idx_fpr_person ON fir_person_roles(person_id);
CREATE INDEX idx_fpr_role ON fir_person_roles(role);

-- Arrest lookups
CREATE INDEX idx_arrests_fir ON arrests(fir_id);
CREATE INDEX idx_arrests_person ON arrests(person_id);
CREATE INDEX idx_arrests_station ON arrests(station_id);

-- Chargesheet lookups
CREATE INDEX idx_chargesheets_fir ON chargesheets(fir_id);
CREATE INDEX idx_chargesheets_accused ON chargesheets(accused_id);
```

## Migration File

Located at: `supabase/migrations/001_initial_schema.sql`

This is the canonical production schema. Apply via Supabase dashboard or `psql`.

## Configuration Validation

The application validates configuration on startup via Pydantic `model_validator`:

- **Backend type**: Must be exactly `"csv"` or `"postgres"` (normalized to lowercase)
- **DATABASE_URL**: Required when `DATA_BACKEND=postgres`; error messages never expose the URL value
- **Pool bounds**: `DATABASE_POOL_MIN` must be ≥ 1; `DATABASE_POOL_MAX` must be ≥ `DATABASE_POOL_MIN` and ≤ 50
- **No silent fallback**: Invalid backend type raises an error; no automatic postgres→csv downgrade

## Testing

734 tests passing across the full test suite (CSV-mode, no live DB),
including:
- Migration SQL schema correctness (18 tests)
- Repository protocol compliance (12 tests — CSV and Postgres)
- Cardinality preservation (6 tests)
- Postgres repository record construction (11 tests)
- Ingestion logic and reconciliation (14 tests)
- Configuration validation (11 tests)
- Persistence provider selection (3 tests)
- Connection management (3 tests)
- App integration and file structure (8 tests)
- Dashboard, field map, intelligence map, district, and health API tests
- RBAC authorization model (36 tests — `tests/test_rbac.py`)
- Audit read API (11 tests — `tests/test_audit_api.py`)
- Rate limiting (9 tests — `tests/test_rate_limit.py`)

## Production Activation Status

**Status: ACTIVE** — Production PostgreSQL is live and serving data.

### Activation Evidence

| Step | Status | Evidence |
|------|--------|----------|
| Migration applied | ✅ | 8 tables + `person_role` ENUM created |
| Schema verified | ✅ | 8 PKs, 12 FKs, 10 UNIQUEs, 15 indexes |
| RLS enabled | ✅ | All 8 tables, no policies (deny-by-default) |
| Grants verified | ✅ | `anon`/`authenticated` have only TRUNCATE/REFERENCES/TRIGGER |
| Data ingested | ✅ | 35,616 records across 6 tables |
| Idempotency verified | ✅ | Second ingestion run produced identical row counts |
| FK integrity | ✅ | Zero orphan arrests, chargesheets, or person roles |
| Multi-accused normalization | ✅ | 5,326 accused roles; 326 FIRs with multiple accused |
| Repository contracts | ✅ | All 6 PG repos tested against live DB |
| FastAPI endpoints | ✅ | All 16 endpoints return 200 on live DB |
| Tests passing | ✅ | 449/449 tests pass |
| Secrets safe | ✅ | `.env` gitignored; no credentials in tracked source |

### Ingestion Pipeline

The ingestion uses `psycopg2.extras.execute_values` for batch UPSERTs (500 rows/batch), completing full ingestion in ~15 seconds over network to Supabase. The pipeline:

1. Reads CSV files in dependency order (districts → stations → people → firs → arrests → chargesheets)
2. Normalizes comma-separated `Accused_ID` into `fir_person_roles` junction table
3. Uses `ON CONFLICT` upserts for idempotency
4. Records each batch in `ingestion_batches` audit table

## Security Considerations

- **PII**: The `people` table contains personally identifiable information. API services expose only operational/non-identifying fields (see the Phase 7 PII audit).
- **Credentials**: `DATABASE_URL` must never be hardcoded or exposed to the frontend.
- **RLS**: Enabled on all tables. See `supabase/migrations/005_rls.sql`: `districts`+`police_stations` are readable by `authenticated`; all PII-bearing and operational tables are deny-by-default. Backend connects as a privileged role and bypasses RLS — its access is governed by RBAC permissions (see `docs/RBAC_AUTHORIZATION.md`) plus audit logging.
- **Audit**: `audit_events` is append-only and deny-by-default. Admin read API at `GET /api/v1/admin/audit/events` (requires `audit.read`); CSV/dev deployments return 503 for it.
- **RBAC**: Role resolution is server-side from verified JWT claims; default least-privilege is `FIELD_OFFICER`.
- **Rate limiting**: In-process fixed-window limiter per client + route class; 429 with `Retry-After`. Single-instance scope — use an API gateway or distributed store when scaling to multiple replicas.

## Deployment (Zoho Catalyst)

The backend is packaged for Catalyst as a standard Procfile app (`web`
process). Catalyst injects `$PORT`; the web command changes into
`backend/` and boots uvicorn.

```
# Procfile (repository root)
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Required environment variables

Set these in the Catalyst service environment (never commit secrets):

| Variable | Value |
|----------|-------|
| `ENVIRONMENT` | `production` (disables `/docs`, `/openapi.json`; enables production guard) |
| `DATA_BACKEND` | `postgres` |
| `DATABASE_URL` | Supabase pooled connection string (workspace secret) |
| `DATABASE_POOL_MIN` / `DATABASE_POOL_MAX` | tier-appropriate pool bounds |
| `JWT_`* `SUPABASE_`*  | token verification: `SUPABASE_JWT_SECRET`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE`, `JWKS_CACHE_TTL` |
| `RBAC_ENABLED` | `true` (default role `RBAC_DEFAULT_ROLE=FIELD_OFFICER`) |
| `CORS_ORIGINS` | Catalyst public URL(s) |
| `RATE_LIMIT_*` | defaults are in-process; raise `RATE_LIMIT_*` limits or add a gateway before scaling multi-replica |

### Efficient defaults for production

- `ENVIRONMENT=production` must be set or the app refuses to start with
  `REQUIRE_AUTH` unset.
- Keep `DATA_BACKEND=postgres`; CSV mode is for local development and
  will 503 the audit read API (`DEPENDENCY_UNAVAILABLE`).
- Migrations (`supabase/migrations/*.sql`) must be applied to the target
  DB before first boot; the app validates schema at startup.

### Verification status note

- **Migrations 002 / 003 / 004 are applied and verified live** (this
  session): `audit_events` (with `role` column), `idx_firs_incident_date_date`
  (expression index on `(incident_date AT TIME ZONE 'UTC')::date`) and
  `idx_audit_events_role` exist in the database. RLS is enabled on all 8
  tables. Migration 003 was corrected so the date-range expression index is
  IMMUTABLE (TIMESTAMPTZ `::date` alone is rejected by PostgreSQL); the
  Postgres FIR repository predicates were aligned to the UTC expression.
- The `.env` in `backend/` is configured (gitignored). `DATABASE_URL`
  verifies and connections are established.
- Endpoint-level live re-verification against Supabase is marked
  **LIVE_VERIFICATION_BLOCKED_BY_NETWORK**: the current network path to the
  IPv6-only Supabase PostgreSQL endpoint drops packets, making live
  requests stall (13–92s) and intermittently disconnect. This is an
  environment limitation, not a code failure. The local automated suite
  (734 tests) runs against the CSV backend and passes. End-to-end live
  checks (Phase 3, 12; Catalyst deploy) remain to be re-run from a stable
  network.

## Next Steps

1. ~~Apply migration to Supabase PostgreSQL instance~~ ✅
2. ~~Run ingestion pipeline~~ ✅
3. ~~Verify data integrity~~ ✅
4. ~~Add RLS policies~~ ✅ (`005_rls.sql`; selective reads + deny-by-default)
5. Add PII classification labels (run "Phase 7 PII audit" checklist on new endpoints)
6. ~~Production health check integration~~ ✅
7. ~~Add pagination to list endpoints~~ ✅ (field cases, stations, audit events)
8. ~~Add rate limiting for API protection~~ ✅ (in-process; see notes above)
