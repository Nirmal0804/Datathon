# BACKEND_ARCHITECTURE.md — Crime Analytics Backend

## 1. Purpose

This is the technical blueprint for the backend of the Karnataka Police crime analytics platform. It describes target boundaries and evolution paths without forcing unnecessary infrastructure before it is needed.

This document describes both the **current implemented architecture** and the **target production architecture**. The current implementation uses CSV-backed in-memory repositories as a transitional data adapter. The production target is Supabase PostgreSQL with authenticated access.

The backend is an **integration and serving layer**:

```text
Approved Data / Database ─────┐
                               │
                               v
                          BACKEND
                               ^
                               │
ML / Analytics Artifacts ─────┘
                               │
                               v
                          REST / JSON
                               │
                               v
                          Frontend
```

Dataset creation and model training are outside backend ownership.

---

## 1A. Current implemented architecture

The following describes what is **actually implemented and running** as of the latest commit.

### Current data flow

```text
Approved CSV files (data/schema_reference/)
    ↓
CSV loader (startup, in-memory)
    ↓
CSV-backed repositories (in-memory indices)
    ↓
Repository protocols (database/repositories/protocols.py)
    ↓
Service layer
    ↓
FastAPI + Pydantic schemas
```

### Current repository architecture

```text
protocols.py (FirReader, ArrestReader, ChargesheetReader, DistrictReader, StationReader)
    ↑
csv/ (CSVFirRepository, CSVArrestRepository, CSVChargesheetRepository, ...)
    ↑
csv_loader.py (startup loading into memory)
```

CSV repositories implement the same protocol interfaces that future PostgreSQL repositories will implement. Services depend only on protocols, never on CSV-specific code.

### Current implemented modules

| Module | API Router | Service | Status |
|--------|-----------|---------|--------|
| Health | `main.py` | — | COMMITTED |
| Dashboard Summary | `api/dashboard.py` | `services/dashboard_service.py` | COMMITTED |
| Field Officer Crime Map | `api/field_map.py` | `services/field_map_service.py` | COMMITTED |
| Intelligence Crime Map | `api/intelligence_map.py` | `services/intelligence_map_service.py` | COMMITTED |
| District Intelligence | `api/districts.py` | `services/district_service.py` | COMMITTED |
| Network Analysis | `api/network.py` | `services/network_service.py` | COMMITTED |
| Authentication | `api/auth.py` | — | COMMITTED |
| Audit Logging | `core/audit.py` (middleware) | `services/audit_service.py` | COMMITTED |
| Trends & Alerts | — | — | NOT STARTED |

### Current test coverage

19 test files, 678 tests passing, covering all committed modules including audit logging.

---

## 1B. Target production architecture

The following describes the **production deployment target**. Components marked NOT STARTED have not been implemented.

### Production data flow

```text
Authoritative operational data sources
    ↓
Validated ingestion / synchronization (ingestion framework implemented)
    ↓
Supabase PostgreSQL (IMPLEMENTED — schema, repos, connection pool)
    ↓
PostgreSQL-backed repository implementations (IMPLEMENTED — 6 repos + audit)
    ↓
Repository protocols (EXISTING — preserved)
    ↓
Service layer (EXISTING — preserved)
    ↓
FastAPI + Pydantic schemas (EXISTING — preserved)
    ↓
Authenticated/authorized clients (PARTIAL — auth implemented, RBAC blocked)
```

### Production persistence target

Supabase PostgreSQL is the confirmed production database platform. Implementation is COMPLETE for the repository and schema layer.

**Implemented:**
- Relational schema design (normalized with junction tables, FKs, constraints, indexes)
- PostgreSQL migration files (`001_initial_schema.sql`, `002_audit_events.sql`)
- Connection pooling (psycopg2 `ThreadedConnectionPool`)
- 6 PostgreSQL repository implementations (districts, stations, people, FIRs, arrests, chargesheets)
- Audit events repository (append-only)
- Data ingestion framework (batched upsert for all entities + junction table)
- Configuration validation (pydantic settings)
- 50+ database-specific tests

**Not yet implemented:**
- Alembic migration management
- Database integration tests against live Supabase
- Backup/restore strategy
- Production secret rotation

### Production security requirements

Production deployment requires:

**Authentication:** verified user identity, secure token/session handling, backend verification. Frontend state is not a security boundary.

**Authorization:** role/permission-based access, jurisdiction-aware access where required, least privilege, endpoint-level enforcement, database-level protection where appropriate.

Roles and jurisdiction semantics require an approved requirements decision. Do not invent police roles.

### Existing layer architecture (preserved in production)

```text
Router (api/)
    ↓
Service (services/)
    ↓
Repository Protocol (database/repositories/protocols.py)
    ↓
Persistence Adapter (csv/ → PostgreSQL/ in production)
```

This architecture is preserved. The persistence adapter changes; everything above it remains.

---

## 2. Core runtime architecture

```text
Client / Nirmal Frontend
          |
          | HTTP(S)
          v
+---------------------------+
| FastAPI                   |
| routing + validation      |
+-------------+-------------+
              |
              v
+---------------------------+
| Service Layer             |
| orchestration             |
+-----+----------------+----+
      |                |
      v                v
Repositories       Analytics / Model Adapters
      |                |
      v                v
Database          Supplied artifacts/services
```

The first implementation should work without requiring every future infrastructure component.

---

## 3. Target folder structure

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── dashboard.py
│   │   ├── crimes.py
│   │   ├── districts.py
│   │   ├── geospatial.py
│   │   ├── hotspots.py
│   │   ├── trends.py
│   │   ├── offenders.py
│   │   ├── networks.py
│   │   ├── risk.py
│   │   ├── anomalies.py
│   │   ├── correlations.py
│   │   └── reports.py
│   ├── services/
│   │   ├── dashboard_service.py
│   │   ├── district_service.py
│   │   ├── geospatial_service.py
│   │   ├── hotspot_service.py
│   │   ├── trend_service.py
│   │   ├── offender_service.py
│   │   ├── network_service.py
│   │   ├── risk_service.py
│   │   ├── anomaly_service.py
│   │   ├── correlation_service.py
│   │   └── report_service.py
│   ├── models/
│   │   ├── crime.py
│   │   ├── accused.py
│   │   ├── district.py
│   │   └── police_station.py
│   ├── schemas/
│   │   ├── common.py
│   │   ├── dashboard.py
│   │   ├── crime.py
│   │   ├── district.py
│   │   └── analytics.py
│   ├── analytics/
│   │   ├── hotspot_detection.py
│   │   ├── trend_analysis.py
│   │   ├── anomaly_detection.py
│   │   ├── risk_scoring.py
│   │   ├── network_analysis.py
│   │   └── correlation.py
│   ├── database/
│   │   ├── connection.py
│   │   └── repositories/
│   ├── core/
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   └── logging.py
│   └── utils/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

Create only files required by the current checkpoint; empty architecture theater is not required.

---

## 4. Layer responsibilities

### API layer
Routes should be thin.

Conceptual flow:

```python
@router.get("/summary", response_model=DashboardSummary)
async def summary(filters=Depends(...), service=Depends(...)):
    return await service.get_summary(filters)
```

No direct SQL and no direct model loading in routes.

### Service layer
Coordinates:
- repository reads;
- deterministic backend calculations;
- analytics/model adapter calls;
- result assembly;
- caching if justified.

Services define application behavior.

### Repository layer
Owns persistence/query details.

Repository functions should be named by intent, such as:
- `get_dashboard_counts`
- `get_category_distribution`
- `list_repeat_offenders`
- `get_crime_points_in_bounds`

Avoid generic "get everything" queries.

### Schema layer
API schemas are contracts, not mirrors of DB rows.

Use schemas to:
- normalize names;
- hide internal fields;
- express nullability honestly;
- include metadata such as `generated_at`, `data_period` or model version when useful.

### Analytics adapters
Two categories exist.

**Backend-owned deterministic analytics**
- straightforward percentage changes;
- aggregation;
- response-level ranking;
- graph serialization;
- simple calculations explicitly assigned to backend.

**Externally owned analytics/ML**
- trained risk model;
- trained anomaly model;
- any teammate-owned clustering/prediction pipeline.

For externally owned functionality, the backend adapter should have a narrow interface:

```text
service → adapter → supplied artifact/API → validated result
```

The adapter must be replaceable without changing route contracts.

---

## 5. Database strategy

### Current implementation

CSV-backed in-memory repositories loaded at startup. Repository protocols abstract data access so services remain persistence-independent.

### Production target

**Supabase PostgreSQL** is the confirmed production database platform.

Production schema design must not simply copy the CSV layout. Specific transformations required:
- `firs.Accused_ID` (comma-separated) must become a normalized junction/relationship table.
- Denormalized district/station text fields must use proper foreign key relationships.
- Biometric fields (DNA, fingerprints) must be isolated with appropriate access controls.
- Provenance metadata columns must be added.

Preferred direction:
- PostgreSQL via Supabase;
- PostGIS if true spatial point/polygon queries are required;
- SQLAlchemy if consistent with the repository pattern;
- Alembic when the backend owns schema migrations.

Important distinction: if the data team supplies and owns an existing database schema, do not generate migrations that redefine their source schema without agreement.

### Query principles
- indexes on common filters/joins;
- spatial index if using geometry;
- avoid loading large datasets into Python just to count/group them;
- aggregate in DB when practical;
- paginate list endpoints;
- select required columns only.

---

## 6. Geospatial architecture

Module 2 depends on the actual location data.

Possible levels:

1. **District-level only**  
   Return district aggregates and district geometry.

2. **Police-station/jurisdiction-level**  
   Return station/jurisdiction aggregates.

3. **Incident point-level**  
   Only when approved incident coordinates exist.

Never convert district/station identity into fake incident coordinates.

If PostGIS is justified, use it for:
- bounding-box queries;
- point-in-polygon;
- distance queries;
- spatial indexes;
- potentially clustering/aggregation.

Frontend map endpoints should return only fields needed to render the map.

---

## 7. Hotspot architecture

Backend responsibilities depend on team ownership.

If hotspot algorithm is supplied:
```text
repository inputs → hotspot adapter → supplied algorithm/artifact → service → API
```

If the team explicitly assigns deterministic hotspot calculation to backend, implement it as a separate analytics component, not inside the route.

For expensive computation:
- do not automatically add Celery/Redis;
- first determine data size and refresh needs;
- options include cached query, materialized view, scheduled script, lightweight worker or full queue.

Hotspot response should expose:
- spatial unit/geometry;
- crime count;
- dominant category;
- trend;
- risk/label if supplied by the agreed algorithm;
- calculation timestamp;
- method/version metadata where appropriate.

---

## 8. Dashboard architecture

Dashboard endpoints are read-heavy and aggregation-heavy.

Recommended API split:
- `/dashboard/summary`
- `/dashboard/trends`
- `/dashboard/categories`
- `/dashboard/districts`

Avoid one gigantic endpoint if parts refresh independently.

Filtering should be centralized so "district + date range + category" means the same thing across endpoints.

Potential optimization path:
1. indexed DB aggregation;
2. query optimization;
3. short-lived cache only if necessary;
4. precomputation/materialized view if scale proves it necessary.

---

## 9. District intelligence architecture

District profile is a composition endpoint.

It may combine:
- district repository aggregates;
- hotspot service output;
- repeat-offender summary;
- risk adapter output.

Do not duplicate each module's logic in `district_service.py`.

If risk is unavailable, return a truthful null/unavailable state.

---

## 10. Trend and alert architecture

Backend may own deterministic time-series comparison if assigned.

Store/return enough evidence for an alert:

```json
{
  "crime_category": "vehicle_theft",
  "area": "example",
  "current_count": 118,
  "baseline_count": 100,
  "change_percent": 18.0,
  "period": "monthly"
}
```

Handle:
- zero baseline;
- incomplete current period;
- small sample sizes;
- missing periods.

Never generate dramatic natural-language alerts from unreliable counts.

---

## 11. Criminal network architecture

Start with the relational source of truth.

Graph representation:
- nodes: accused, case, station, district, arrest as supported;
- edges: evidence-backed relationships.

Every edge should contain:
- relationship type;
- supporting record/case identifier when allowed;
- no unsupported implication.

Start with in-process graph construction or direct node/edge serialization. Add a graph database only if actual traversal/scale requirements justify it.

---

## 12. Repeat offender architecture

Identity resolution is critical.

Do not merge people based only on similar names.

Use the stable identifier supplied by the data schema.

Service can provide:
- distinct case count;
- arrest history;
- category breakdown;
- offense timeline;
- district movement when supported.

The definition of "repeat offender" must be team-approved/configurable.

---

## 13. Predictive risk integration

Backend does **not** train the risk model.

Expected handoff from ML team:
- artifact/service location;
- model version;
- exact input feature names/types;
- preprocessing expectations;
- output schema;
- failure behavior;
- explanation/contribution fields if available.

Backend flow:

```text
repositories
    ↓
runtime feature payload
    ↓
risk_scoring adapter
    ↓
ML artifact/service
    ↓
validated RiskResult
    ↓
risk service
    ↓
API
```

If artifact is absent:
- no placeholder score;
- no random score;
- no heuristic masquerading as model output;
- return unavailable cleanly.

---

## 14. Anomaly integration

Use the same adapter pattern as risk scoring.

Backend must not silently substitute a different statistical algorithm unless the team explicitly approves that fallback and labels it accurately.

Return evidence such as:
- observed value;
- baseline/expected value;
- anomaly score;
- time window;
- affected category/area;
- model/method version.

---

## 15. Socio-economic correlation

Data team supplies:
- approved external data;
- provenance;
- district join key;
- period/version.

Backend may expose an agreed correlation routine/result, but must preserve metadata.

Response must state correlation rather than causation.

Population-normalized crime rates may be needed; this decision should be documented rather than guessed.

---

## 16. Reports

Reports should reuse existing services.

Bad:
```text
report_service → new duplicate SQL and calculations
```

Good:
```text
report_service
  ├── dashboard_service
  ├── district_service
  ├── hotspot_service
  └── risk_service
```

Generate CSV/Excel/PDF according to project needs.

If rendering is slow, then consider background processing. Do not add a queue before it is necessary.

Exports must apply authorization/redaction rules.

---

## 17. Cross-cutting concerns

### Configuration
Use `.env` locally and a typed settings layer.

Never commit `.env`.

### Logging
Log:
- request ID;
- endpoint;
- status;
- latency;
- safe error context.

Do not log sensitive full records.

### Errors
Create typed domain exceptions such as:
- `ResourceNotFoundError`
- `InvalidFilterError`
- `DependencyUnavailableError`
- `ModelUnavailableError`

Map them consistently.

### CORS
Allow only required frontend origins through configuration.

### Authentication/authorization
Authentication is implemented via Supabase Auth JWT verification (HS256/JWKS) with deny-by-default ASGI middleware. Do not invent production police roles without requirements. Keep the architecture ready for auth dependencies.

Audit logging is implemented via ASGI middleware that records append-only security events for classified routes. Health probes are excluded. Audit persistence fails open with CRITICAL-level operational logging.

Production requirement: backend must verify user identity and enforce access control. Frontend authorization state is not a security boundary. Roles and jurisdiction semantics require an approved requirements decision.

### Caching
Cache only where it produces value. Cache keys must include all relevant filters. Do not allow stale cache to silently cross dataset/model versions.

### Background work
Candidates:
- report rendering;
- expensive hotspot recomputation;
- batch risk/anomaly scoring.

Choose a worker architecture only after the workload warrants it.

---

## 18. Performance targets and measurement

Before optimizing:
- capture endpoint latency;
- inspect query count;
- inspect query plans for slow DB queries;
- measure result sizes.

Potential targets for interactive dashboard endpoints can be defined later with the team. Do not claim performance without measurement.

---

## 19. Deployment evolution

### Stage 1 — Current implementation (CSV adapter)
```text
Frontend → local FastAPI → CSV-backed in-memory repositories
```
Status: IMPLEMENTED

### Stage 2 — Production database
```text
Frontend → deployed API → Supabase PostgreSQL
                        → PostgreSQL-backed repositories
```
Status: IMPLEMENTED — Schema, repos, connection pool, ingestion framework. Not yet deployed.

### Stage 3 — Authenticated production
```text
Authenticated clients → FastAPI (with auth middleware) → Supabase PostgreSQL
                                                              ↓
                                                    Supabase Auth (or equivalent)
```
Status: PARTIAL — Auth middleware, JWT verification, and security headers implemented; RBAC blocked on role definitions

### Stage 4 — Full production (if scale requires)
```text
reverse proxy/API gateway
      |
FastAPI instances
      |
Supabase PostgreSQL
      |
optional cache/worker
```
Status: NOT STARTED — implement only when workload justifies it.

Do not build Stage 3/4 infrastructure during Stage 1 unless a concrete requirement demands it.

---

## 20. Architectural decision rule

For every new dependency or abstraction ask:

1. What current problem does it solve?
2. Is that problem present now?
3. Can a simpler approach satisfy the current requirement?
4. Does the chosen boundary allow upgrading later?
5. Will teammates be able to run it reliably?

Choose scalable boundaries, not maximum infrastructure.
