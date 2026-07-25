# API_CONTRACT.md — Canonical Backend API Inventory

> **Created:** Production API Requirements Reconciliation
>
> This is the authoritative backend API inventory for the Karnataka Police
> Crime Analytics platform. Every endpoint is verified against source code,
> not documentation.

---

## 1. Conventions

| Convention | Value |
|------------|-------|
| API prefix | `/api/v1` |
| Health endpoint | `GET /health` |
| Authentication | **NOT IMPLEMENTED** — all endpoints are open |
| Pagination | `page` (1-indexed), `page_size` (1–200, default 50) |
| Date format | ISO 8601 date (`YYYY-MM-DD`) |
| Error response | `{"error": {"code": str, "message": str, "request_id": str}}` |
| Filter semantics | All filters optional, AND combination |

---

## 2. Implemented Endpoints

### 2.1 System Health

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 1 | GET | `/health` | Health check (tests DB connectivity if postgres) | IMPLEMENTED |

**Authentication:** None
**Pagination:** No
**Response:** `{"status": "healthy"|"degraded", "service": str, "backend": str, "database"?: str}`

---

### 2.2 Dashboard

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 2 | GET | `/api/v1/dashboard/summary` | Aggregate FIR/arrest/chargesheet counts | IMPLEMENTED |

**Filters:** `district`, `station_id`, `crime_head`, `start_date`, `end_date`
**Pagination:** No
**Response:** `DashboardSummaryResponse` — total_firs, active_cases, closed_cases, chargesheeted_cases, untraced_cases, total_arrests, total_chargesheets
**Data source:** DashboardService → FIRRepository.list_all(), ArrestRepository.list_all_arrests(), ChargeSheetRepository.list_all_chargesheets()
**Sensitive data:** None (aggregate counts only)

---

### 2.3 Field Officer Crime Map

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 3 | GET | `/api/v1/map/field/cases` | Paginated FIR case list | IMPLEMENTED |
| 4 | GET | `/api/v1/map/field/case/{fir_identifier}` | FIR detail by ID or number | IMPLEMENTED |
| 5 | GET | `/api/v1/map/field/filters` | Distinct filter values for UI controls | IMPLEMENTED |
| 6 | GET | `/api/v1/map/field/hotspots` | Grid-cell hotspots (count >= 3) | IMPLEMENTED |

**#3 filters:** `district`, `station_id`, `crime_head`, `status`, `start_date`, `end_date`, `search`, `page`, `page_size`
**#3 pagination:** YES — page (1-indexed), page_size (1–200, default 50). Response includes total, total_pages.
**#3 response:** `FieldMapCaseListResponse` — items (List[FieldMapCaseSummary]), page, page_size, total, total_pages
**#4 path param:** `fir_identifier` (str) — tries FIR_ID first, then FIR_Number
**#4 response:** `FieldMapCaseDetail` — includes bns_sections, fir_date, investigating_officer
**#5 response:** `FieldMapFiltersResponse` — districts, stations, crime_heads, statuses
**#6 filters:** same as #3 minus search/pagination
**#6 response:** `FieldMapHotspotResponse` — hotspots (List[FieldMapHotspotCell]), total_hotspots

**Sensitive data:** #3/#4 include `investigating_officer` name. No person-level PII.

---

### 2.4 Intelligence Analyst Crime Map

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 7 | GET | `/api/v1/map/intelligence/analytics` | KPI metrics from filtered FIRs | IMPLEMENTED |
| 8 | GET | `/api/v1/map/intelligence/heatmap` | Grid-aggregated coordinates for heatmap | IMPLEMENTED |
| 9 | GET | `/api/v1/map/intelligence/clusters` | Station-based aggregation | IMPLEMENTED |
| 10 | GET | `/api/v1/map/intelligence/hotspots` | Grid-cell hotspots (count >= 3) | IMPLEMENTED |
| 11 | GET | `/api/v1/map/intelligence/district-comparison` | Per-district metrics with crime rates | IMPLEMENTED |
| 12 | GET | `/api/v1/map/intelligence/timeline` | Chronological FIR time buckets | IMPLEMENTED |
| 13 | GET | `/api/v1/map/intelligence/export` | CSV download of filtered FIRs | IMPLEMENTED |

**Standard filters (all endpoints):** `district`, `station_id`, `crime_head`, `status`, `start_date`, `end_date`
**#12 extra param:** `granularity` (daily|monthly, default monthly)
**#7 response:** `IntelligenceAnalyticsResponse` — total_crimes, hotspot_count, density_index, dominant_crime_type
**#8 response:** `HeatmapResponse` — points (List[HeatmapPoint]), total_points
**#9 response:** `ClusterResponse` — clusters (List[ClusterPoint]), total_clusters
**#10 response:** `HotspotResponse` — identical structure to #6
**#11 response:** `DistrictComparisonResponse` — districts (List[DistrictComparisonRow]), total_districts
**#12 response:** `TimelineResponse` — buckets (List[TimelineBucket]), total_buckets, granularity
**#13 response:** CSV text/plain. Columns: FIR_ID, FIR_Number, Crime_Head, Crime_Subhead, Status, District, Station_ID, Latitude, Longitude, Incident_Date, Investigating_Officer

**Sensitive data:** #13 is unbounded (no pagination/limit). Exports all matching FIRs.

---

### 2.5 District Intelligence

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 14 | GET | `/api/v1/districts` | All 31 districts with transactional metrics | IMPLEMENTED |
| 15 | GET | `/api/v1/districts/{district_id}/intelligence` | Single district intelligence profile | IMPLEMENTED |

**#14 response:** `DistrictListResponse` — districts (List[DistrictListItem]), total_districts. Includes demographics, FIR/arrest/chargesheet counts, crime rates, hotspot counts, breakdowns.
**#15 path param:** `district_id` (int)
**#15 filters:** `start_date`, `end_date`, `crime_head`, `status`
**#15 response:** `DistrictIntelligenceProfile` — identical structure to DistrictListItem

**Sensitive data:** None (demographics + aggregate counts).

---

## 3. Endpoint Duplication Analysis

### 3.1 Identical endpoints — DEPRECATION_CANDIDATE

| Endpoints | Issue | Recommendation |
|-----------|-------|----------------|
| `#6 /map/field/hotspots` and `#10 /map/intelligence/hotspots` | Both call `compute_hotspots()` with identical filters, identical response structure | Keep #10 as canonical; mark #6 as DEPRECATION_CANDIDATE. Both serve different UI modules so both may remain temporarily. |

### 3.2 Overlapping endpoints — REUSE existing

| Frontend needs | Existing endpoint | New endpoint needed? |
|----------------|-------------------|---------------------|
| Dashboard KPIs | `#2 /dashboard/summary` | No — response already contains active_cases, total_firs |
| Dashboard crime trends | `#12 /map/intelligence/timeline` | No — reuse with no filters for statewide trends |
| Dashboard district distribution | `#11 /map/intelligence/district-comparison` | No — reuse for district breakdown chart |
| District crime statistics | `#15 /districts/{id}/intelligence` | No — response already contains all required stats |
| District category distribution | `#15 /districts/{id}/intelligence` | No — `crime_head_breakdown` field in response |
| District hotspot list | `#6/#10 hotspots` with district filter | No — filter existing hotspot endpoint by district |
| District recent cases | `#3 /map/field/cases` with district filter | No — filter existing case list by district |
| Crime categories list | `#5 /map/field/filters` | No — `crime_heads` field in response |

### 3.3 Domain API vs Screen API alignment

The existing endpoints follow a **domain-oriented** structure (`/districts`, `/map/field/`, `/map/intelligence/`) which is correct for a production API. Frontend screens compose data from multiple domain endpoints.

**Current domain alignment is sound.** No restructuring needed.

---

## 4. Canonical Case/FIR API Recommendation

### Current state

`GET /api/v1/map/field/cases` already functions as a generic case listing endpoint:
- Paginated
- Filterable by district, station, crime_head, status, date range
- Searchable (case-insensitive across fir_id, fir_number, crime_head, crime_subhead)
- No person-level PII

`GET /api/v1/map/field/case/{fir_identifier}` functions as a case detail endpoint.

### Recommendation

**Do NOT create separate `/api/v1/cases` endpoints.** The existing field-map endpoints are domain-adequate and already have pagination/search/filters. The `/map/field/` namespace is acceptable — it indicates the operational field-officer perspective.

If a role-based access model later distinguishes "field" vs "intelligence" case views, separate endpoints may be warranted. For now, the single case API serves both purposes.

**Status:** NOT_REQUIRED — separate canonical case API

---

## 5. Reference Data API Recommendation

### Current state

| Endpoint | Purpose |
|----------|---------|
| `#14 GET /api/v1/districts` | Full district list with metrics |
| `#5 GET /api/v1/map/field/filters` | Districts, stations, crime_heads, statuses |

### Required additions

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 16 | GET | `/api/v1/stations` | All police stations (reference) | REQUIRED |
| 17 | GET | `/api/v1/stations/{station_id}` | Single station detail | REQUIRED |

**Justification:** The frontend district-intelligence module needs station-level data (PoliceStationTable component). The filters endpoint returns station IDs and names but not zone, type, personnel strength, or contact info. A dedicated stations reference API is warranted.

**#16 response:** `StationListResponse` — stations (List[StationListItem]), total_stations
**StationListItem fields:** station_id, station_name, district_id, district_name, zone, station_type, latitude, longitude, personnel_strength, patrol_vehicles
**Sensitive data:** Contact_Number, Email should be excluded from list view; included in detail view (#17) only after auth is implemented.

---

## 6. Authentication/Authorization API Requirements

**Status:** BLOCKED_RBAC — police role/permission model not approved

### Infrastructure requirements (when RBAC is approved)

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 18 | POST | `/api/v1/auth/login` | Authenticate user, return JWT | BLOCKED_RBAC |
| 19 | POST | `/api/v1/auth/logout` | Invalidate session | BLOCKED_RBAC |
| 20 | GET | `/api/v1/auth/me` | Current user identity + role | BLOCKED_RBAC |
| 21 | GET | `/api/v1/auth/roles` | Available roles for role-selection screen | BLOCKED_RBAC |

### Separation of concerns

**Authentication infrastructure** (mechanism, tokens, sessions) can proceed once the team selects Supabase Auth or equivalent.

**Authorization policy** (which roles access which endpoints, district/station scoping) is BLOCKED until police roles are approved.

**Recommendation:** Do not implement auth endpoints until the team decides:
1. Authentication provider (Supabase Auth, custom JWT, etc.)
2. Role definitions (Field Officer, Intelligence Analyst, System Administrator — as shown in frontend RoleSelection.jsx)
3. District/station scoping rules

---

## 7. Privacy/Access Classification

| Classification | Definition | Endpoints |
|----------------|------------|-----------|
| **PUBLIC_REFERENCE** | Non-sensitive reference data | #14 districts, #16 stations, #5 filters, #1 health |
| **AUTHENTICATED_AGGREGATE** | Aggregate statistics (no PII) | #2 dashboard/summary, #7 analytics, #11 district-comparison, #12 timeline |
| **OPERATIONAL_CASE_DATA** | Case-level data (FIR details, no PII) | #3 field/cases, #4 field/case/{id}, #15 districts/{id}/intelligence |
| **OPERATIONAL_EXPORT** | Bulk case data export | #13 export |
| **PII** | Person-identifiable information | **NONE currently exposed** (complainant_id, victim_id, accused_ids exist in FIRRecord but are NOT in any API response) |
| **BIOMETRIC** | DNA, fingerprints, photographs | **NOT exposed** (exists in ArrestRecord.dna_sample etc. but NOT in any API response) |
| **ADMINISTRATIVE** | User management, RBAC | #18–#21 (BLOCKED_RBAC) |
| **AUDIT_SECURITY** | Audit logs, security events | Not implemented |

### Currently exposed sensitive fields

| Field | Endpoint | Classification | Recommendation |
|-------|----------|---------------|----------------|
| `investigating_officer` | #3, #4, #13 | PII (Low — public servant) | Acceptable in operational views; remove from exports after auth |
| `StationRecord.contact_number` | Not in API | PII (Operational) | Include in #17 detail only after auth |
| `StationRecord.email` | Not in API | PII (Operational) | Include in #17 detail only after auth |
| `PersonRecord.*` | Not in API | PII (High) | Never expose without auth + authorization |

---

## 8. ML-Blocked APIs

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 22 | GET | `/api/v1/analytics/risk/{district_id}` | District risk score | BLOCKED_ML |
| 23 | GET | `/api/v1/analytics/anomalies` | Anomaly detection results | BLOCKED_ML |
| 24 | GET | `/api/v1/analytics/predictive/forecast` | Crime forecast | BLOCKED_ML |
| 25 | GET | `/api/v1/analytics/predictive/threat-level` | Statewide threat level | BLOCKED_ML |

**Rule:** When implemented, these must return typed unavailable results when ML artifacts are absent. No fabricated scores.

---

## 9. GIS-Blocked APIs

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 26 | GET | `/api/v1/map/districts/geojson` | District boundary polygons | BLOCKED_GIS |
| 27 | GET | `/api/v1/map/stations/geojson` | Police station boundary polygons | BLOCKED_GIS |

**Known blocker:** No authoritative GeoJSON boundary data supplied. FIR coordinates (lat/lng) exist and are already served through existing map endpoints.

---

## 10. Trends Module API Decision

### Current coverage

The intelligence timeline endpoint `#12 GET /api/v1/map/intelligence/timeline` already provides:
- Daily/monthly time buckets
- FIR counts per period
- Crime head breakdown per period
- Filterable by district, station, crime_head, status, date range

The dashboard summary `#2 GET /api/v1/dashboard/summary` provides aggregate counts.

### Decision

**Trends endpoints are NOT REQUIRED as separate endpoints.** The existing timeline and summary endpoints provide complete trend coverage. The BACKEND_IMPLEMENTATION_PLAN.md Phase 6 proposed:

- `GET /api/v1/trends` → **Covered by #12 /map/intelligence/timeline**
- `GET /api/v1/alerts` → **BLOCKED_REQUIREMENTS** — no authoritative alert thresholds defined

**Incident_Date** is the canonical trend event date (confirmed from data schema).

**Do NOT implement YoY statistics** — data covers only 16 months (Jan 2025 – Apr 2026).

**Status:** NOT_REQUIRED for trends; BLOCKED_REQUIREMENTS for alerts

---

## 11. Reports/Export API Decision

### Current state

`#13 GET /api/v1/map/intelligence/export` provides FIR CSV export with filters.

### Production requirements

The frontend Reports module expects:
- Report listing with filters
- Report detail/preview
- Report generation trigger
- Report download
- Report activity history

### Recommendation

Reports should be modeled as resources **only if** the project requires generated/saved report artifacts (PDF, Excel). Currently:

- **CSV export exists** (#13) — covers immediate export need
- **PDF/Excel generation** — not yet required by project scope
- **Report persistence** — not justified without backend-side report generation

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 28 | GET | `/api/v1/reports` | List generated reports | NOT_REQUIRED |
| 29 | GET | `/api/v1/reports/{id}` | Report detail | NOT_REQUIRED |
| 30 | POST | `/api/v1/reports/generate` | Trigger report generation | NOT_REQUIRED |
| 31 | GET | `/api/v1/reports/{id}/download` | Download report file | NOT_REQUIRED |

**Justification:** The frontend Reports module is a UI mockup with hardcoded report entries. No actual report generation backend exists. The existing CSV export (#13) covers operational export needs. If PDF/Excel report generation is later required, implement as a separate checkpoint.

---

## 12. Criminal Network API Decision

### Deterministic capabilities from existing data

The data model supports these deterministic graph relationships:

| Relationship | Source | Edge type |
|-------------|--------|-----------|
| Person ↔ FIR (as accused) | `fir_person_roles` junction | `accused_in` |
| Person ↔ FIR (as complainant) | `firs.complainant_id` | `complainant_in` |
| Person ↔ FIR (as victim) | `firs.victim_id` | `victim_of` |
| Co-accused (same FIR) | Multiple accused in same FIR | `co_accused` |
| Person ↔ Arrest | `arrests.person_id` | `arrested_for` |
| FIR ↔ Arrest | `arrests.fir_id` | `has_arrest` |
| FIR ↔ Chargesheet | `chargesheets.fir_id` | `has_chargesheet` |
| Station ↔ FIR | `firs.station_id` | `reported_at` |

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 32 | GET | `/api/v1/network/graph` | Graph nodes + edges for FIR or person | REQUIRED |
| 33 | GET | `/api/v1/network/entities/{id}` | Entity detail (person, FIR, station) | REQUIRED |
| 34 | GET | `/api/v1/network/search` | Search entities by name/ID | REQUIRED |

**Rules:**
- Every edge must have evidence-backed relationship type
- No gang membership, conspiracy, or guilt inference
- Neutral labels only ("co_accused_in", "named_in", "arrested_for")
- Person names should be minimized; use person_id references
- **BLOCKED_RBAC** for person-level detail (requires auth)

### Unsupported semantic outputs

- Danger score → BLOCKED_ML
- Gang probability → BLOCKED_ML
- Threat score → BLOCKED_ML
- Criminal risk score → BLOCKED_ML

---

## 13. Operational Endpoint Recommendation

| # | Method | Path | Purpose | Status |
|---|--------|------|---------|--------|
| 1 | GET | `/health` | Basic health check | IMPLEMENTED |
| 35 | GET | `/health/live` | Liveness probe (always 200 if process alive) | REQUIRED |
| 36 | GET | `/health/ready` | Readiness probe (checks DB connectivity) | REQUIRED |

**Semantics:**
- `/health` — current implementation, reports status + backend type. Keep as-is.
- `/health/live` — trivial 200 OK, for container orchestrator liveness. No DB check.
- `/health/ready` — checks DB pool connectivity (currently embedded in `/health`). Separate for production readiness probes.

**Must NOT expose:** credentials, database hosts, internal topology, connection strings.

---

## 14. Pagination/Filtering Gaps

### Endpoints with pagination

| Endpoint | Has pagination | Details |
|----------|---------------|---------|
| #3 `/map/field/cases` | YES | page (1-indexed), page_size (1–200), default 50. Response includes total, total_pages. |

### Endpoints that NEED pagination

| Endpoint | Current behavior | Gap |
|----------|-----------------|-----|
| #13 `/map/intelligence/export` | Returns ALL matching FIRs as CSV | Needs row limit (e.g., max 10,000) or async generation |
| #14 `/districts` | Returns all 31 districts | Acceptable (31 is bounded) |
| #8 `/map/intelligence/heatmap` | Returns all grid cells | Acceptable for current data size |
| #9 `/map/intelligence/clusters` | Returns all station clusters | Acceptable (250 stations max) |
| #6/#10 hotspots | Returns all qualifying cells | Acceptable for current data size |

### Filter consistency

All data endpoints (#2–#15) support the same filter set: `district`, `station_id`, `crime_head`, `status`, `start_date`, `end_date`. This is consistent and correct.

**Gap:** No `sort_by` / `order` parameters on any endpoint. The case listing (#3) has implicit ordering by incident_date descending. Add explicit sort parameters when frontend sort controls are implemented.

---

## 15. Capability → API Matrix

| Application Capability | Frontend Consumer | Required Data | Existing Endpoint | New Endpoint Needed? | Status |
|------------------------|-------------------|---------------|-------------------|---------------------|--------|
| **System Health** | Ops | Backend + DB status | #1 `/health` | No | IMPLEMENTED |
| **Dashboard KPIs** | KPICards.jsx | Aggregate counts | #2 `/dashboard/summary` | No | IMPLEMENTED |
| **Dashboard Crime Trends** | ChartsPlaceholder.jsx | Time-series FIR counts | #12 `/map/intelligence/timeline` | No | IMPLEMENTED |
| **Dashboard District Distribution** | ChartsPlaceholder.jsx | Per-district counts | #11 `/map/intelligence/district-comparison` | No | IMPLEMENTED |
| **Dashboard Recent Cases** | CrimeTablePlaceholder.jsx | Paginated FIR list | #3 `/map/field/cases` | No | IMPLEMENTED |
| **Dashboard Alerts** | RecentAlerts.jsx | Alert feed | — | Yes (BLOCKED_REQUIREMENTS) | BLOCKED |
| **Global Search** | TopNavbar.jsx | Cross-entity search | — | Yes | REQUIRED |
| **User Profile** | TopNavbar.jsx, ProfileSettings.jsx | Current user | — | Yes (BLOCKED_RBAC) | BLOCKED |
| **Login/Logout** | Login.jsx | Auth token | — | Yes (BLOCKED_RBAC) | BLOCKED |
| **Role Selection** | RoleSelection.jsx | Available roles | — | Yes (BLOCKED_RBAC) | BLOCKED |
| **Crime Map Markers** | GISMap.jsx | FIR coordinates | #8 `/map/intelligence/heatmap` + #9 clusters | No | IMPLEMENTED |
| **Crime Map Hotspots** | GISSidebar.jsx | Hotspot cells | #6/#10 hotspots | No | IMPLEMENTED |
| **Crime Map Layers** | GISSidebar.jsx | GeoJSON boundaries | — | Yes | BLOCKED_GIS |
| **Crime Map Filters** | GISSidebar.jsx | District/category lists | #5 `/map/field/filters` | No | IMPLEMENTED |
| **District List** | DistrictHeader.jsx | All districts | #14 `/districts` | No | IMPLEMENTED |
| **District Statistics** | CrimeStatistics.jsx | District metrics | #15 `/districts/{id}/intelligence` | No | IMPLEMENTED |
| **District Risk Score** | RiskScoreCard.jsx | ML risk score | — | Yes | BLOCKED_ML |
| **District Trends** | TrendChartsPlaceholder.jsx | Time-series per district | #15 `/districts/{id}/intelligence` (crime_head_breakdown) | No | IMPLEMENTED |
| **District Category Distribution** | CategoryDistribution.jsx | Crime breakdown | #15 `/districts/{id}/intelligence` | No | IMPLEMENTED |
| **District Hotspots** | HotspotSummary.jsx | Hotspot list | #6/#10 with district filter | No | IMPLEMENTED |
| **District Recent Cases** | RecentCases.jsx | Recent FIRs | #3 `/map/field/cases` with district filter | No | IMPLEMENTED |
| **District Police Stations** | PoliceStationTable.jsx | Station metrics | — | Yes | REQUIRED |
| **Field Case List** | Field map UI | Paginated FIRs | #3 `/map/field/cases` | No | IMPLEMENTED |
| **Field Case Detail** | Field map UI | FIR detail | #4 `/map/field/case/{id}` | No | IMPLEMENTED |
| **Intelligence Analytics** | Intelligence map UI | KPI metrics | #7 `/map/intelligence/analytics` | No | IMPLEMENTED |
| **Intelligence Heatmap** | Intelligence map UI | Heatmap points | #8 `/map/intelligence/heatmap` | No | IMPLEMENTED |
| **Intelligence Clusters** | Intelligence map UI | Station clusters | #9 `/map/intelligence/clusters` | No | IMPLEMENTED |
| **Intelligence District Comparison** | Intelligence map UI | District metrics | #11 `/map/intelligence/district-comparison` | No | IMPLEMENTED |
| **Intelligence Timeline** | Intelligence map UI | Time buckets | #12 `/map/intelligence/timeline` | No | IMPLEMENTED |
| **CSV Export** | Intelligence map UI | FIR CSV | #13 `/map/intelligence/export` | No | IMPLEMENTED |
| **Crime Trend Analysis** | CrimeTrendAnalysis.jsx | Historical trends | #12 timeline + #2 summary | No | IMPLEMENTED |
| **Anomaly Detection** | AnomalyDetection.jsx | Anomaly results | — | Yes | BLOCKED_ML |
| **Predictive Risk** | PredictiveRisk.jsx | Risk scores + forecast | — | Yes | BLOCKED_ML |
| **Hotspot Analytics** | HotspotAnalytics.jsx | Spatial analytics | #10 hotspots (partial) | Yes (spatial shift, generators) | BLOCKED_REQUIREMENTS |
| **Network Graph** | GraphCanvas.jsx | Nodes + edges | — | Yes | REQUIRED |
| **Network Entity Detail** | NodeInfoPanel.jsx | Entity info | — | Yes | REQUIRED |
| **Network Search** | RelationshipSidebar.jsx | Entity search | — | Yes | REQUIRED |
| **Report List** | ReportList.jsx | Report metadata | — | Yes | NOT_REQUIRED |
| **Report Generate** | ReportFilters.jsx | Report trigger | — | Yes | NOT_REQUIRED |
| **Report Download** | ReportPreview.jsx | Report file | #13 export (CSV only) | Partial | NOT_REQUIRED |
| **Audit Logs** | AuditLogs.jsx | Audit entries | — | Yes | BLOCKED_RBAC |
| **Notification Preferences** | NotificationSettings.jsx | User prefs | — | Yes | BLOCKED_RBAC |
| **User Preferences** | Preferences.jsx | User settings | — | Yes | BLOCKED_RBAC |
| **Role Management** | RoleManagement.jsx | RBAC roles | — | Yes | BLOCKED_RBAC |

---

## 16. Implementation Priority

### Priority 1 — Security Foundation (BLOCKED_RBAC)

All auth/authz work is blocked on police role definitions. Cannot proceed.

**Estimated endpoints:** 4 (login, logout, me, roles)
**Blocker:** Approved police role/permission model

### Priority 2 — Reference Data APIs

Stations reference API needed by district intelligence module.

| # | Endpoint | Depends on |
|---|----------|-----------|
| 16 | `GET /api/v1/stations` | Nothing |
| 17 | `GET /api/v1/stations/{station_id}` | Nothing |

**Estimated endpoints:** 2
**Blocker:** None

### Priority 3 — Network Analysis

Deterministic graph construction from existing data. No ML dependency.

| # | Endpoint | Depends on |
|---|----------|-----------|
| 32 | `GET /api/v1/network/graph` | FIR + Person + Arrest repositories |
| 33 | `GET /api/v1/network/entities/{id}` | FIR + Person repositories |
| 34 | `GET /api/v1/network/search` | Person + FIR repositories |

**Estimated endpoints:** 3
**Blocker:** None (deterministic data only)
**Note:** Person-level data requires RBAC. Mark as BLOCKED_RBAC for production; implementable for development/demo without auth.

### Priority 4 — Operational Health Probes

| # | Endpoint | Depends on |
|---|----------|-----------|
| 35 | `GET /health/live` | Nothing |
| 36 | `GET /health/ready` | DB connectivity |

**Estimated endpoints:** 2
**Blocker:** None

### Priority 5 — Pagination Hardening

- Add max row limit to `/map/intelligence/export`
- Add explicit `sort_by`/`order` to case listing
- Verify all list endpoints handle empty results gracefully

**No new endpoints.** Hardening of existing endpoints.

### Priority 6 — Analytics (BLOCKED_ML)

| # | Endpoint | Blocker |
|---|----------|---------|
| 22 | Risk score per district | No ML artifact |
| 23 | Anomaly detection | No ML artifact |
| 24 | Crime forecast | No ML artifact |
| 25 | Statewide threat level | No ML artifact |

### Priority 7 — GIS Boundaries (BLOCKED_GIS)

| # | Endpoint | Blocker |
|---|----------|---------|
| 26 | District GeoJSON | No authoritative source |
| 27 | Station GeoJSON | No authoritative source |

---

## 17. BACKEND_IMPLEMENTATION_PLAN.md Changes

The following sections of BACKEND_IMPLEMENTATION_PLAN.md should be updated to reflect reconciled reality:

| Section | Current state | Recommended update |
|---------|--------------|-------------------|
| Phase 6 (Trends & Alerts) | NOT STARTED | Mark as partially covered by existing #12 timeline. Alerts blocked on requirements. |
| Phase 7 (Hotspots) | NOT STARTED | Mark as IMPLEMENTED via #6/#10 deterministic grid hotspots. ML-based hotspots blocked. |
| Phase 13 (Reports) | NOT STARTED | Mark as NOT_REQUIRED until PDF/Excel generation is justified. CSV export exists. |
| Module status table | Various NOT STARTED | Update to reflect actual implementation status |

**Do not rewrite** BACKEND_IMPLEMENTATION_PLAN.md in this session. Only note material conflicts for future update.

---

## 18. Final Endpoint Count by Status

| Status | Count | Endpoints |
|--------|-------|-----------|
| **IMPLEMENTED** | 15 | #1–#15 |
| **IMPLEMENTED_NEEDS_HARDENING** | 1 | #13 (unbounded export) |
| **REQUIRED** | 7 | #16, #17, #32, #33, #34, #35, #36 |
| **BLOCKED_RBAC** | 6 | #18, #19, #20, #21 + audit + user management |
| **BLOCKED_ML** | 4 | #22, #23, #24, #25 |
| **BLOCKED_GIS** | 2 | #26, #27 |
| **BLOCKED_REQUIREMENTS** | 2 | Alerts, Hotspot spatial analytics |
| **NOT_REQUIRED** | 4 | #28–#31 (report CRUD) |
| **DEPRECATION_CANDIDATE** | 1 | #6 (duplicate of #10) |

**Total identified endpoints:** 42
**Implementable now (no blockers):** 7 (#16, #17, #32, #33, #34, #35, #36)
**Awaiting RBAC:** 6+
**Awaiting ML:** 4
**Awaiting GIS:** 2

---

*End of API_CONTRACT.md — Created during Production API Requirements Reconciliation.*
