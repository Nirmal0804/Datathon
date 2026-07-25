# BACKEND_IMPLEMENTATION_PLAN.md — OpenCode Checkpoints

## 1. How to use this plan

Work in order, but adapt to actual handoffs.

Every checkpoint follows:

```text
INSPECT
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
TEST
  ↓
DIFF
  ↓
STOP
  ↓
HUMAN REVIEW
  ↓
COMMIT/PUSH when explicitly instructed
```

Do not build all modules in one session.

---

## 1A. Current implementation status

Last updated: Production Architecture Realignment checkpoint.

| Phase | Module | Status | Commit |
|-------|--------|--------|--------|
| 0A | Repository discovery | COMPLETE | `e221943` |
| 1A | Backend skeleton | COMPLETE | `181c75d` |
| 1B | Logging/errors | COMPLETE | `3268175` |
| 2A | Schema inspection | COMPLETE | `8c77454` |
| 2B | CSV data foundation | COMPLETE | `a7cf50a` |
| 3A-3C | Dashboard summary | COMPLETE | `3429b2e` |
| 4 | District Intelligence | COMPLETE | `8b86e85` |
| 5 | Field Officer Crime Map | COMPLETE | `98122cc` |
| 5 | Intelligence Crime Map | COMPLETE | `0c96cba` |
| 6 | Trends & Alerts | NOT STARTED | — |
| 7 | Hotspots | NOT STARTED | — |
| 8 | Repeat Offender | NOT STARTED | — |
| 9 | Criminal Network | NOT STARTED | — |
| 10 | Predictive Risk | BLOCKED (no ML artifact) | — |
| 11 | Anomaly Detection | BLOCKED (no ML artifact) | — |
| 12 | Socio-economic Correlation | NOT STARTED | — |
| 13 | Reports & Exports | NOT STARTED | — |

### Production infrastructure status

| Area | Status |
|------|--------|
| Production database (Supabase PostgreSQL) | NOT STARTED |
| PostgreSQL repository implementations | NOT STARTED |
| Data ingestion/synchronization layer | NOT STARTED |
| Authentication | COMPLETE | JWT verification, deny-by-default middleware, algorithm confusion prevention |
| Authorization/RBAC | NOT STARTED |
| Audit logging | NOT STARTED |
| Migration management | NOT STARTED |
| Backup/restore | NOT STARTED |
| Deployment pipeline | NOT STARTED |
| Security hardening | NOT STARTED |
| Performance testing | NOT STARTED |
| Load testing | NOT STARTED |

**Passing functional module tests alone is not sufficient evidence of production readiness.**

---

# PHASE 0 — Repository discovery

## Checkpoint 0A — Inspect repository before architecture changes

### Goal
Understand what Nirmal already built and prevent accidental restructuring.

### OpenCode instruction
```text
Read AGENTS.md, BACKEND_GUARDRAILS.md, BACKEND_ARCHITECTURE.md and
BACKEND_IMPLEMENTATION_PLAN.md.

Do not edit anything yet.

Inspect:
- current branch and git status;
- repository tree;
- package manifests;
- frontend framework/build scripts;
- existing API/backend code;
- environment/config files;
- frontend API clients/fetch/axios usage;
- frontend mock data;
- frontend TypeScript interfaces/types;
- pages/components corresponding to all crime modules.

Report:
1. current repository architecture;
2. whether a backend already exists;
3. frontend data contracts/mocks discovered;
4. likely backend integration points;
5. architecture conflicts with our guidance;
6. dependencies already installed;
7. recommended minimal backend foundation.

Do not create files. Do not commit. Stop.
```

### Done when
You have a repository-specific plan instead of assumptions.

---

# PHASE 1 — Backend foundation

## Checkpoint 1A — Create minimal backend skeleton

### Goal
Create only the core FastAPI foundation needed to run.

### Expected files
```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── analytics/
│   ├── database/
│   │   └── repositories/
│   ├── core/
│   └── utils/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

### OpenCode instruction
```text
Implement Checkpoint 1A only.

Use the existing repository as authoritative. Do not move or edit frontend files.

Create a minimal FastAPI backend skeleton:
- app/main.py;
- GET /health returning a typed/simple healthy response;
- API router infrastructure under /api/v1;
- core/config.py using a typed settings approach compatible with selected
  dependencies;
- .env.example with placeholders only;
- basic backend README run instructions;
- one health endpoint test.

Do NOT add PostGIS, Redis, Celery, Docker or Alembic unless repository inspection
showed they are immediately required. Do not add database models yet.

Run tests and available backend lint/format checks.
Run git status and git diff --check.
Show the diff summary and stop. Do not commit.
```

### Suggested commit after review
`chore(backend): initialize FastAPI backend structure`

---

## Checkpoint 1B — Logging and error foundation

### Goal
Create shared error handling before modules multiply.

### Implement
- request ID/correlation ID middleware;
- safe structured logging;
- shared domain exceptions;
- handlers for validation/dependency/model-unavailable cases;
- no sensitive payload logging.

### Suggested commit
`chore(backend): add logging and error handling foundation`

---

# PHASE 2 — Data/database handoff

## Checkpoint 2A — Inspect approved schema

### Prerequisite
Actual schema/DDL/data dictionary/database access must be available.

### OpenCode instruction
```text
Do not invent schema.

Inspect the supplied approved database schema/data dictionary and compare it
against the backend module requirements.

Produce a mapping table:
- source table;
- source field;
- meaning;
- backend entity;
- endpoints needing it;
- nullable/unknown behavior;
- unsupported requested fields.

Specifically identify whether we truly have:
- stable FIR/case identifier;
- accused identifier;
- district;
- police station;
- crime category;
- crime/case status;
- arrest relation;
- event/report dates;
- coordinates or spatial geometry;
- fields needed by ML inference handoffs.

Do not create production ORM models for unsupported fields.
Show findings and stop before implementation if critical mappings are unresolved.
```

---

## Checkpoint 2B — Database connection and repositories foundation

### Goal
Connect backend to the approved data source.

### Implement
- connection/session layer matching actual DB;
- minimal domain models/mappings only as justified;
- repository base conventions;
- connectivity test;
- one real read query.

### Important
If the data team owns an existing schema, do not automatically generate schema migrations.

### Suggested commit
`feat(database): add approved database integration`

---

# PHASE 3 — Module 1: Dashboard

## Checkpoint 3A — Define dashboard contract

Inspect Nirmal's dashboard UI first.

Map:
- total FIRs;
- active cases;
- closed cases;
- arrest count;
- category distribution;
- district statistics;
- top districts;
- daily/monthly/yearly summaries;
- filters.

Mark unsupported metrics instead of inventing them.

No implementation until contract is grounded.

---

## Checkpoint 3B — Dashboard repository + service

### Files
- `database/repositories/dashboard_repository.py`
- `services/dashboard_service.py`
- `schemas/dashboard.py`

### Requirements
- reusable filter object/schema;
- DB-side aggregation where practical;
- consistent date filtering;
- category/district grouping;
- explicit null/empty behavior;
- no cache initially unless measurement shows need.

### Suggested commit
`feat(dashboard): add crime dashboard aggregation service`

---

## Checkpoint 3C — Dashboard API + tests

### Endpoints
Candidate contract:
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/trends`
- `GET /api/v1/dashboard/categories`
- `GET /api/v1/dashboard/districts`

Adapt to frontend needs.

### Tests
- no filters;
- district filter;
- date filter;
- empty result;
- invalid period.

### Suggested commit
`feat(dashboard): expose dashboard analytics APIs`

---

## Checkpoint 3D — First frontend integration checkpoint

### Goal
Prove the complete vertical slice before adding advanced modules.

Do not redesign frontend.

With explicit permission:
- point one dashboard feature at real backend endpoint;
- preserve UI behavior;
- document contract mismatch.

### Done when
```text
approved data → repository → service → API → frontend
```
works end-to-end.

---

# PHASE 4 — Module 4: District Intelligence

Build this early because it reuses dashboard aggregation and does not require ML.

## Files
- `api/districts.py`
- `services/district_service.py`
- `database/repositories/district_repository.py`
- district schema

## Endpoints
- `GET /api/v1/districts`
- `GET /api/v1/districts/{district_id}/intelligence`

## Rules
- risk score remains null/unavailable until ML handoff;
- hotspot remains unavailable until hotspot component exists;
- do not duplicate dashboard queries unnecessarily.

## Tests
- known district;
- unknown district;
- empty statistics;
- unavailable optional analytics.

### Suggested commit
`feat(district): add district intelligence APIs`

---

# PHASE 5 — Module 2: Geospatial Map

## Checkpoint 5A — Verify spatial data

Before coding, answer:
- Are incident coordinates available?
- Are they authorized for display?
- Do we have district polygons?
- Do we have police-jurisdiction polygons?
- What spatial precision is allowed?

If incident coordinates do not exist, do not implement fake crime markers.

---

## Checkpoint 5B — Geospatial repository/service/API

### Files
- `api/geospatial.py`
- `services/geospatial_service.py`
- `database/repositories/geospatial_repository.py`
- geo schemas

### Possible endpoints
- `/api/v1/map/incidents`
- `/api/v1/map/districts`
- `/api/v1/map/heatmap`

### PostGIS decision
Add PostGIS only if real spatial queries/geometry justify it.

### Tests
- spatial filter;
- district filter;
- date/category filters;
- max result/pagination;
- no coordinate leakage beyond approved precision.

### Suggested commit
`feat(map): add geospatial crime APIs`

---

# PHASE 6 — Module 5: Trends and alerts

This can often be backend-owned deterministic analysis, but confirm assignment.

## Files
- `api/trends.py`
- `services/trend_service.py`
- `analytics/trend_analysis.py`
- `database/repositories/trend_repository.py`

## Requirements
- daily/monthly/yearly buckets;
- period-over-period comparison;
- zero-baseline handling;
- incomplete-period handling;
- threshold/configuration supplied or approved by team;
- evidence in alert response.

## Endpoints
- `GET /api/v1/trends`
- `GET /api/v1/alerts`

## Tests
- increase;
- decrease;
- zero baseline;
- incomplete current period;
- empty data.

### Suggested commit
`feat(trends): add crime trend and alert APIs`

---

# PHASE 7 — Module 3: Hotspots

## Checkpoint 7A — Determine ownership/handoff

Ask:
- Is hotspot algorithm backend-owned?
- Is ML/analytics teammate supplying it?
- What inputs/outputs are agreed?
- How often should it recompute?

Do not assume DBSCAN is your responsibility.

---

## Checkpoint 7B — Integration

### Files
- `api/hotspots.py`
- `services/hotspot_service.py`
- `analytics/hotspot_detection.py`
- repository if required

### If artifact supplied
Implement adapter only.

### If backend explicitly owns deterministic algorithm
Implement documented algorithm in `analytics/`, with tests and method metadata.

### Response
- location/spatial unit;
- count;
- dominant category;
- trend;
- risk/label if algorithm supplies it;
- generated timestamp;
- method/version.

### Suggested commit
`feat(hotspots): integrate hotspot analytics API`

---

# PHASE 8 — Module 7: Repeat Offender Tracking

## Prerequisite
Stable accused identifier and team-approved definition.

## Files
- `api/offenders.py`
- `services/offender_service.py`
- `database/repositories/offender_repository.py`

## Endpoints
- `GET /api/v1/offenders/repeat`
- `GET /api/v1/offenders/{accused_id}`

## Requirements
- distinct cases;
- arrest history when supported;
- categories;
- timeline;
- district movement when supported;
- pagination;
- never merge by name similarity alone.

### Suggested commit
`feat(offenders): add repeat offender APIs`

---

# PHASE 9 — Module 6: Criminal Network Analysis

## Prerequisite
Relationship source fields understood.

## Files
- `api/networks.py`
- `services/network_service.py`
- `analytics/network_analysis.py`
- `database/repositories/network_repository.py`

## Endpoints
- `/api/v1/networks/case/{case_id}`
- `/api/v1/networks/accused/{accused_id}`

## Rules
Every edge requires:
- relationship type;
- evidence/reference where allowed.

Do not label co-occurrence as gang membership.

Start without Neo4j. Add graph infrastructure only if required.

### Suggested commit
`feat(network): add evidence-backed criminal network API`

---

# PHASE 10 — Module 8: Predictive Risk Scoring

## This is an ML handoff checkpoint

### Required handoff
- model/artifact/API;
- version;
- input feature contract;
- preprocessing contract;
- output schema;
- explanation fields.

### Files
- `api/risk.py`
- `services/risk_service.py`
- `analytics/risk_scoring.py`
- repository functions for runtime inputs

### OpenCode instruction
```text
Do not train or create a fallback model.

Implement a replaceable risk inference adapter around the supplied ML contract.
The service must fetch/map required runtime inputs from approved backend data,
call the adapter, validate the output, and expose a typed API response.

If the artifact is not available, implement the interface and graceful
ModelUnavailableError path only. Return no fabricated score.

Tests must mock the adapter.
```

### Endpoints
- `/api/v1/risk/districts`
- `/api/v1/risk/districts/{district_id}`

### Suggested commit
`feat(risk): integrate predictive risk inference API`

---

# PHASE 11 — Module 9: Anomaly Detection

Same ownership rule as risk.

## Files
- `api/anomalies.py`
- `services/anomaly_service.py`
- `analytics/anomaly_detection.py`

## Requirements
- supplied inference/method contract;
- observed value;
- expected/baseline value when supplied;
- anomaly score;
- explanation;
- method/model version;
- graceful unavailable behavior.

Do not silently invent a z-score fallback.

### Suggested commit
`feat(anomaly): integrate anomaly detection API`

---

# PHASE 12 — Module 10: Socio-economic Correlation

## Prerequisite
Approved external data + provenance + district join key.

## Files
- `api/correlations.py`
- `services/correlation_service.py`
- `analytics/correlation.py`
- repository/join functions as appropriate

## Requirements
- use approved fields only;
- preserve source/period/sample metadata;
- correlation, not causation;
- normalize crime counts by population only if the agreed analysis calls for it.

### Suggested commit
`feat(correlation): add socio-economic correlation API`

---

# PHASE 13 — Module 11: Reports and exports

## Files
- `api/reports.py`
- `services/report_service.py`

## Rule
Reuse existing services. Do not create a second analytics implementation for reports.

## Formats
As required:
- CSV;
- Excel;
- PDF.

## Requirements
- filter metadata;
- generated timestamp;
- data/model version metadata where relevant;
- redact unauthorized fields;
- decide synchronous vs background generation based on measured cost.

### Suggested commit
`feat(reports): add crime intelligence report exports`

---

# PHASE 14 — Hardening

## Checkpoint 14A — Integration tests

Cover:
- endpoint schemas;
- filters;
- pagination;
- empty results;
- invalid values;
- unavailable ML;
- repository/service integration.

Suggested commit:
`test(backend): add API integration and regression tests`

---

## Checkpoint 14B — API documentation

Ensure FastAPI OpenAPI has:
- summaries;
- descriptions;
- response models;
- filter descriptions;
- known unavailable states.

Update `backend/README.md`.

Suggested commit:
`docs(backend): document API contracts and setup`

---

## Checkpoint 14C — Security review

Review:
- secrets;
- CORS;
- sensitive fields;
- logs;
- unrestricted list endpoints;
- report exports;
- error leakage;
- auth requirements;
- dependency versions.

Do not invent police RBAC without requirements; document the gap.

---

## Checkpoint 14D — Performance review

Measure before adding infrastructure.

Inspect:
- slow queries;
- query plans;
- payload sizes;
- endpoint latency;
- expensive repeated analytics.

Only then consider:
- indexes;
- cache;
- precomputation;
- background worker;
- PostGIS optimizations.

Suggested commit only if changes are made:
`perf(backend): optimize verified backend bottlenecks`

---

# PHASE 15 — Git workflow for every checkpoint

## Before work
```bash
git branch --show-current
git status
git log --oneline -5
```

Expected working branch:
`feature-backend-tamilselvi`

## After implementation
```bash
git status
git diff --check
git diff
```

Run relevant tests.

OpenCode stops here.

## Human-reviewed commit
Stage specific files:

```bash
git add backend/app/...
git add backend/tests/...
git diff --staged
```

Then, only when explicitly instructed:

```bash
git commit -m "feat(module): meaningful description"
git push
```

Never use a vague message such as:
- update;
- changes;
- final;
- backend work.

---

# PHASE 16 — Syncing Nirmal's frontend branch

Do this only after your current backend work is committed/pushed and when integration requires it.

```bash
git fetch origin
git status
```

Review incoming changes first.

Preferred integration policy must be agreed by the team. If merge is used:

```bash
git merge origin/feature-frontend-only-v1-Nirmal
```

Resolve carefully, test both frontend and backend, then push your branch.

Never merge your backend branch into Nirmal's branch yourself unless the team lead requests it.

---

# PHASE 17 — Final definition of done (functional)

Backend functional modules are complete when:

- [ ] backend starts from documented instructions;
- [ ] health endpoint works;
- [ ] real approved data/database is connected;
- [ ] no invented production fields/data;
- [ ] dashboard APIs work;
- [ ] district APIs work;
- [ ] map behavior matches available spatial data;
- [ ] hotspot integration follows team ownership;
- [ ] trends/alerts are evidence-backed;
- [ ] repeat offender identity uses stable identifiers;
- [ ] graph edges are evidence-backed;
- [ ] risk model is integrated without backend training;
- [ ] anomaly model/method is integrated without hidden substitution;
- [ ] socio-economic output preserves provenance and avoids causal claims;
- [ ] reports reuse verified services;
- [ ] list endpoints are bounded/paginated;
- [ ] sensitive data is minimized;
- [ ] unavailable dependencies fail cleanly;
- [ ] tests pass;
- [ ] OpenAPI/README are current;
- [ ] no secrets/private dumps are tracked;
- [ ] commit history is checkpoint-based and understandable.

**Note:** Functional module completion is NOT production readiness. See Phase 18+ for production requirements.

---

# PHASE 18 — Production database foundation

## Checkpoint 18A — Schema design

### Goal
Design the production PostgreSQL schema for Supabase.

### Requirements
- Do not copy CSV layout directly.
- Normalize comma-separated fields (e.g., `firs.Accused_ID` → junction table).
- Design proper foreign key relationships.
- Add provenance metadata columns.
- Plan indexes for common query patterns.
- Plan access control columns where appropriate.

### Deliverable
`docs/DATABASE_SCHEMA.md` — production schema design document.

---

## Checkpoint 18B — Repository migration

### Goal
Implement PostgreSQL-backed repository implementations.

### Requirements
- Implement same repository protocols as CSV adapters.
- Connection pooling and lifecycle management.
- Environment-based configuration.
- Transaction boundaries.
- Migration management (Alembic or equivalent).
- Database integration tests.

---

## Checkpoint 18C — Data ingestion

### Goal
Migrate data from approved CSV files to PostgreSQL.

### Requirements
- Schema validation during ingestion.
- Type validation.
- Referential-integrity validation.
- Quality validation.
- Transactional ingestion.
- Provenance/audit metadata.
- Ingestion verification tests.

---

# PHASE 19 — Authentication and authorization

## Checkpoint 19A — Authentication

### Status: COMPLETE

### What was implemented
- `jwt_auth.py`: JWT verifier engine (HS256 symmetric + JWKS asymmetric), algorithm allowlists to prevent confusion attacks, JWKS cache with TTL
- `config.py`: 8 Supabase JWT settings with auto-derivation; production REQUIRE_AUTH guard
- `schemas/auth.py`: AuthenticatedIdentity, MeResponse, AuthErrorResponse
- `api/auth.py`: GET /api/v1/auth/me endpoint
- `api/auth_deps.py`: get_current_identity(), require_authenticated_user() dependencies
- `main.py`: AuthenticationMiddleware (deny-by-default), SecurityHeadersMiddleware, JWT verifier init, CORS hardening, production docs disabled
- `tests/test_auth.py`: 59 tests across 10 classes covering JWT verification, route protection, algorithm confusion, security headers, production guards

### Requirements
- Verify user identity (Supabase Auth or equivalent). ✅
- Secure token/session handling. ✅
- Backend verification — frontend state is not a security boundary. ✅
- Do not invent police roles without approved requirements. ✅ (Blocked)

---

## Checkpoint 19B — Authorization/RBAC

### Goal
Implement backend authorization.

### Requirements
- Role/permission-based access (when roles are approved).
- Jurisdiction-aware access where required.
- Least privilege enforcement.
- Endpoint-level enforcement.
- Database-level protection where appropriate (RLS as complement, not replacement).

---

# PHASE 20 — Security hardening

## Checkpoint 20A — Audit subsystem

### Goal
Implement security audit logging.

### Requirements
- Separate from application request logging.
- Capture: actor, action, resource type, resource identifier, timestamp, outcome, correlation ID, authorization context.
- Never log sensitive records or secrets.
- Audit storage design.

---

## Checkpoint 20B — Security review

### Goal
Comprehensive security review.

### Requirements
- Secrets management review.
- CORS review.
- Sensitive field review.
- Log review.
- Unrestricted list endpoint review.
- Report export review.
- Error leakage review.
- PII regression tests.
- Dependency version audit.

---

# PHASE 21 — Observability and operations

## Checkpoint 21A — Observability

### Goal
Production-grade observability.

### Requirements
- Structured logs.
- Request/correlation IDs (extend existing).
- Metrics (endpoint latency, error rates, DB query times).
- Tracing where appropriate.
- Error monitoring.
- Database monitoring.
- Readiness checks.
- Liveness/health checks (extend existing `/health`).

---

## Checkpoint 21B — Reliability

### Goal
Production reliability.

### Requirements
- Database backup strategy.
- Restore procedures and testing.
- Migration rollback strategy.
- Failure handling.
- Graceful application startup/shutdown.
- Dependency failure behavior.
- Recovery objectives (when requirements available).

---

# PHASE 22 — Performance and load testing

## Checkpoint 22A — Performance baseline

### Goal
Establish performance baselines.

### Requirements
- Endpoint latency measurement.
- Database query plan analysis.
- Payload size measurement.
- Identify bottlenecks.

---

## Checkpoint 22B — Load testing

### Goal
Validate production load handling.

### Requirements
- Concurrent user testing.
- Database connection pool testing.
- Rate limiting/abuse protection.
- Caching strategy validation (if implemented).

---

# PHASE 23 — Deployment

## Checkpoint 23A — Deployment pipeline

### Goal
Production deployment infrastructure.

### Requirements
- Local development environment.
- Test environment.
- Staging environment.
- Production environment.
- Environment isolation.
- HTTPS/TLS.
- CI pipeline (automated testing).
- CD/deployment workflow.
- Database migrations during deployment.
- Rollback strategy.
- Dependency/version pinning.
- Production server configuration.

---

# PHASE 24 — Frontend/backend integration

## Checkpoint 24A — Integration validation

### Goal
End-to-end frontend/backend integration.

### Requirements
- Frontend points at production backend.
- All API contracts match.
- Authentication/authorization works end-to-end.
- No frontend mock data remaining.
- Error handling matches.

---

# PHASE 25 — Production acceptance

## Checkpoint 25A — Production readiness review

### Goal
Final production readiness assessment.

### Requirements
- All Phase 18-24 checkpoints complete.
- Security audit passed.
- Performance benchmarks met.
- Backup/restore tested.
- Monitoring and alerting operational.
- Documentation current.
- Team sign-off.

### Final definition of done (production)

- [ ] PostgreSQL schema designed and implemented.
- [ ] Data ingested and validated.
- [ ] Authentication operational.
- [ ] Authorization/RBAC enforced.
- [ ] Audit logging operational.
- [ ] Security review passed.
- [ ] Observability operational.
- [ ] Backups configured and tested.
- [ ] Performance benchmarks established.
- [ ] Load testing completed.
- [ ] Deployment pipeline operational.
- [ ] Frontend/backend integration validated.
- [ ] Documentation current.
- [ ] Team sign-off obtained.
