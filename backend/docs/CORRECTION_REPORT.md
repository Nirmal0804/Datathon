# Correction Report — Production Database Migration Checkpoint

**Date:** 2025-07-25
**Checklist version:** Production Database Migration (PostgreSQL migration + dual-backend wiring + ingestion + config + lifecycle)

---

## Correction 1 — Protocol Compatibility

**Finding:** `ArrestRepository.get_by_fir_id` and `ChargeSheetRepository.get_by_fir_id` returned `Optional[Record]` (single record), but the domain supports multiple arrests/chargesheets per FIR. `FIRRepository` was missing `get_by_number`. `RepositoryCollection` was typed to concrete CSV classes.

**Fix:**
- `protocols.py`: Changed both `get_by_fir_id` signatures from `Optional[ArrestRecord]` / `Optional[ChargeSheetRecord]` → `List[ArrestRecord]` / `List[ChargeSheetRecord]`.
- `postgres/fir_repo.py`: Added `get_by_number(fir_number: str) -> Optional[FIRRecord]`.
- `postgres/arrest_repo.py`: Added `list_all_arrests()` and `get_by_fir_id() -> List`.
- `postgres/chargesheet_repo.py`: Added `list_all_chargesheets()` and `get_by_fir_id() -> List`.
- `dependencies.py`: `RepositoryCollection.__init__` now accepts `DistrictRepository`, `StationRepository`, etc. (Protocol types) instead of `CSVDistrictRepository`, etc.

**Verified:** `TestPostgresProtocolCompliance` and `TestCSVProtocolCompliance` (12 tests) pass.

---

## Correction 2 — Multi-Record Cardinality

**Finding:** CSV `_by_fir` indices used `dict[str, Record]` (single record per key), silently dropping records with duplicate FIR IDs.

**Fix:**
- `csv/arrest_repo.py`: `_by_fir` changed to `dict[str, list[ArrestRecord]]`. Index build uses `setdefault().append()`. `get_by_fir_id` returns `list(self._by_fir.get(fir_id, []))`.
- `csv/chargesheet_repo.py`: Same change — `_by_fir` now `dict[str, list[ChargeSheetRecord]]`.

**Verified:** `TestCardinalityPreservation` (6 tests) passes. `test_get_by_fir_id_missing` returns `[]` not `None`.

---

## Correction 3 — UNIQUE Constraint Removed from chargesheets.fir_id

**Finding:** `supabase/migrations/001_initial_schema.sql` had `UNIQUE(fir_id)` on chargesheets. Domain does not guarantee 1:1 FIR-chargesheet.

**Fix:** Removed `UNIQUE` constraint from `chargesheets` table. Retained `idx_chargesheets_fir` index for query performance.

**Verified:** `test_chargesheets_fir_not_unique` (schema test) passes.

---

## Correction 4 — Ingestion UPSERT Key Review

**Finding:** All UPSERT `ON CONFLICT` clauses use source identifiers (not foreign keys). Arrests use `arrest_id`, chargesheets use `chargesheet_id`, FIRs use `fir_id`, etc.

**No change required.** Verified against all 6 tables in `app/database/ingest/__init__.py`.

**Verified:** `TestIngestionReconciliation` (8 tests) confirms each UPSERT uses the correct source identifier.

---

## Correction 5 — Redundant Pool Initialization Removed from run.py

**Finding:** `run.py` had redundant `init_pool()` call before CLI ingestion, duplicating the `main.py` lifespan. Connection could leak if `init_pool` succeeded but ingestion failed.

**Fix:** `run.py` now uses direct `psycopg2.connect()` with explicit `conn.close()` in a `finally` block. No pool imports. No `init_pool`/`close_pool` dependency.

**Verified:** `test_run_py_no_pool_import` passes.

---

## Correction 6 — Config Validation Added

**Finding:** Invalid `DATA_BACKEND` values (e.g., "supabase", "SUPABASE") silently defaulted to CSV. Missing `DATABASE_URL` when `DATA_BACKEND=postgres` caused runtime crashes. Invalid pool bounds accepted silently.

**Fix:** Two Pydantic `model_validator` functions added to `Settings`:
- `mode="before"`: Normalizes `DATA_BACKEND` to lowercase/trimmed.
- `mode="after"`: Validates backend type is in `("csv", "postgres")`. Requires `DATABASE_URL` when backend is `postgres`. Validates pool bounds (MIN ≥ 1, MAX ≥ MIN, MAX ≤ 50). Error messages never expose `DATABASE_URL` value.

**Verified:** `TestConfigurationValidation` (8 tests) covers all validation paths including normalization, rejection of invalid backend, missing URL, pool bound violations, and URL concealment in errors.

---

## Correction 7 — Health Endpoint Security

**Finding:** Health endpoint must not expose credentials, hostnames, raw exceptions, or stack traces.

**Fix:** Health endpoint returns only `status`, `service`, `backend`, and optionally `database` (connected/disconnected/error). No credentials, hostnames, or raw exceptions are included. PostgreSQL connectivity check uses `SELECT 1` with exception caught and mapped to generic status.

**Verified:** Existing `test_health_returns_expected_structure` and `test_no_pii_in_response` tests confirm.

---

## Correction 8 — Tests Strengthened

**Finding:** Existing tests needed updates for new return types (`List` instead of `Optional`).

**Fix:**
- `tests/test_production_db_migration.py`: Rewritten with 73 tests covering protocol compliance, cardinality, schema, config validation, and ingestion reconciliation.
- `tests/test_repositories.py`: Updated all `get_by_fir_id` assertions from `assert result is not None` to `assert len(result) > 0`. Updated `_by_fir.values()` iteration to iterate over lists. Fixed `test_list_by_station_returns_results` to verify chargesheet membership in result set rather than FIR-ID equality.

**Verified:** 450 tests pass. 0 failures.

---

## Correction 9 — Documentation Updated

**Finding:** `PRODUCTION_DATABASE.md` did not reflect protocol changes, cardinality corrections, or config validation.

**Fix:** Added "Protocol Compliance" section documenting `get_by_fir_id` → `List` change and `chargesheets.fir_id` NOT UNIQUE. Updated ingestion properties to document UPSERT key strategy. Added "Configuration Validation" section. Updated test count from 54 → 73.

---

## Correction 10 — Connection Management Lifecycle

**Finding:** PostgreSQL connection pool lifecycle managed in `main.py` lifespan AND `_build_postgres_repositories`. Potential double initialization.

**Fix:** `main.py` lifespan handles pool init/close for the application lifecycle. `_build_postgres_repositories` in `dependencies.py` also calls `init_pool` as a safety measure (lru_cache ensures single execution). Both paths are safe.

**Verified:** `TestConnectionManagement` (3 tests) confirms pool-not-initialized raises, close-when-not-initialized is safe.

---

## Correction 11 — No PII in Logs or Errors

**Finding:** Ingestion logging must never include names, IDs, or other PII.

**Fix:** All ingestion log messages use counts only ("Ingested 31 districts"). No record-level data logged. Health endpoint error messages are generic ("disconnected", "error"). Config validation errors never expose `DATABASE_URL`.

**Verified:** Code review of all `logger.*` calls in `app/database/ingest/__init__.py` and `app/main.py`.

---

## Correction 12 — Dependency Isolation

**Finding:** Services must not depend on concrete repository implementations.

**Fix:** `RepositoryCollection` constructor accepts Protocol types. `_build_csv_repositories` and `_build_postgres_repositories` are private factory functions. Services receive `RepositoryCollection` via FastAPI dependency injection and operate on Protocol-typed interfaces only.

**Verified:** No service imports CSV or Postgres-specific modules. `app/database/dependencies.py` is the sole wiring point.

---

## Summary

| # | Finding | Action | Status |
|---|---------|--------|--------|
| 1 | Protocol signatures mismatch | Updated protocols + all implementations | FIXED |
| 2 | Multi-record cardinality lost | Changed _by_fir to dict[str, list] | FIXED |
| 3 | UNIQUE on chargesheets.fir_id | Removed constraint from schema | FIXED |
| 4 | UPSERT keys correct | No change needed | VERIFIED |
| 5 | Redundant pool init in run.py | Replaced with direct psycopg2.connect | FIXED |
| 6 | No config validation | Added Pydantic model_validators | FIXED |
| 7 | Health endpoint security | Verified safe — no credentials exposed | VERIFIED |
| 8 | Test coverage gaps | Added 73 tests, updated assertions | FIXED |
| 9 | Documentation stale | Updated PRODUCTION_DATABASE.md | FIXED |
| 10 | Double pool init risk | Both paths safe; lru_cache prevents double execution | VERIFIED |
| 11 | PII in logs/errors | All logging uses counts only | VERIFIED |
| 12 | Dependency coupling | RepositoryCollection typed to protocols | FIXED |

## Files Changed

```
 .env.example                                    |   8 ++
 app/core/config.py                              |  52 +++
 app/database/dependencies.py                    | 118 ++++---
 app/database/repositories/csv/arrest_repo.py    |  10 +-
 app/database/repositories/csv/chargesheet_repo.py | 10 +-
 app/database/repositories/protocols.py          |   4 +-
 app/main.py                                     |  50 +++-
 requirements.txt                                |   1 +
 tests/test_repositories.py                      |  56 +++---
 docs/PRODUCTION_DATABASE.md                     |  28 +++-
```

New files (untracked):
```
 app/database/ingest/__init__.py
 app/database/ingest/run.py
 app/database/postgres/__init__.py
 app/database/postgres/district_repo.py
 app/database/postgres/station_repo.py
 app/database/postgres/person_repo.py
 app/database/postgres/fir_repo.py
 app/database/postgres/arrest_repo.py
 app/database/postgres/chargesheet_repo.py
 supabase/migrations/001_initial_schema.sql
 tests/test_production_db_migration.py
```

## Test Results

**450 tests passed, 0 failures** in 5.28s.
