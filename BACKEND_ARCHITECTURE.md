# BACKEND_ARCHITECTURE.md — Crime Analytics Backend

## 1. Purpose

This is the technical blueprint for the backend of the Karnataka Police crime analytics platform. It describes target boundaries and evolution paths without forcing unnecessary infrastructure before it is needed.

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

Do not finalize a database technology until repository inspection and the data-team handoff are understood.

Preferred direction for a relational crime schema:
- PostgreSQL;
- PostGIS if true spatial point/polygon queries are required;
- SQLAlchemy if consistent with the repository;
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
Do not invent production police roles without requirements. Keep the architecture ready for auth dependencies, and implement the agreed prototype policy when supplied.

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

### Stage 1 — local hackathon development
```text
Frontend → local FastAPI → approved DB/data
```

### Stage 2 — shared integration
```text
Frontend → deployed API → managed/shared DB
                         → supplied ML artifact/service
```

### Stage 3 — scale if needed
```text
reverse proxy/API
      |
FastAPI instances
      |
PostgreSQL/PostGIS
      |
optional cache/worker
```

Do not build Stage 3 infrastructure during Stage 1 unless a concrete requirement demands it.

---

## 20. Architectural decision rule

For every new dependency or abstraction ask:

1. What current problem does it solve?
2. Is that problem present now?
3. Can a simpler approach satisfy the current requirement?
4. Does the chosen boundary allow upgrading later?
5. Will teammates be able to run it reliably?

Choose scalable boundaries, not maximum infrastructure.
