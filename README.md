<div align="center">

# 🛡️ CrimeIntel

### AI-Driven Crime Analytics & Intelligence Platform

**Transforming fragmented crime data into actionable intelligence for data-driven policing.**

CrimeIntel unifies crime records, geospatial intelligence, analytical dashboards, hotspot detection, district intelligence, criminal-network analysis, and AI/ML-assisted insights in a secure decision-support platform for law-enforcement workflows.

**Development / Demo Deployment:**
- **Web Application:** [https://crime-intel-60079748823.development.catalystserverless.in/app/index.html](https://crime-intel-60079748823.development.catalystserverless.in/app/index.html)
- **Backend API:** [https://crimeintel-backend-50044367664.development.catalystappsail.in](https://crimeintel-backend-50044367664.development.catalystappsail.in)

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61dafb)](#6-technology-stack)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20(Python%203.10)-009688)](#6-technology-stack)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e)](#6-technology-stack)
[![Auth](https://img.shields.io/badge/Auth-Supabase%20Auth%20%2B%20JWT-6f42c1)](#8-security--authentication)
[![Cache](https://img.shields.io/badge/Cache-L1%20Memory%20%2B%20L2%20Catalyst-ff9800)](#5-system-architecture)
[![GIS](https://img.shields.io/badge/GIS-Google%20Maps-4285F4)](#3-google-maps-integration)
[![Deployment](https://img.shields.io/badge/Deployment-Zoho%20Catalyst-2e7d32)](#14-deployment)

**React + Vite · FastAPI · Supabase PostgreSQL · Supabase Auth + JWT · Multi-Tier Cache · Google Maps · Zoho Catalyst**

</div>

---

## ⭐ Refined Prototype Phase — Upgrades & Enhancements

During the Refined Prototype Phase, CrimeIntel was enhanced beyond its initial functional prototype to improve deployment readiness, usability, accessibility, localization, privacy transparency, role-specific workflows, multi-tier caching performance, and operational validation.

### 🎨 UI/UX Refinement
- Polished professional interface with consistent visual hierarchy tailored for police intelligence operations.
- Smooth page transitions and loading states, including skeleton/loading placeholders for perceived performance.
- Refined role-specific dashboards with distinct views for Field Officers, Intelligence Analysts, and Administrators.
- Enhanced navigation bar, breadcrumbs, and standardized footer structure.
- Back-to-top functionality and desktop-focused experience optimization.
- Consistent Karnataka Police visual identity and styling system.
- Comprehensive user settings/preferences experience with instant persistence.
- Built-in Resources, Statutory Documents (PDF guides), and Support sections.

### 🗺️ Google Maps Upgrade
- Replaced the initial Leaflet-based mapping layer with **Google Maps** (`@vis.gl/react-google-maps`).
- Refined the geographic intelligence visualization experience to provide a familiar, high-performance, and integrated interface.
- Integrated mapping seamlessly with the overall CrimeIntel design system.
- Preserved all crime-intelligence and analytical capabilities (clusters, hotspots, density heatmaps, precinct boundaries).
- Enhanced interactive marker selection and detailed case telemetry popups.

### 🌐 Language & Accessibility
- Multilingual interface supporting English and Kannada (ಕನ್ನಡ).
- Application UI localization for Kannada across navigation, dashboards, forms, telemetry labels, and alert messages.
- Language preference is configurable through Settings and persists across sessions.
- *(Note: Localization primarily targets user-facing interface content; actual identifiers and backend data remain canonical.)*

### ⚙️ User Preferences
- **Theme:** Light / Dark mode toggle with instant theme application.
- **Formats:** Configurable Date format and Time format preferences.
- **Landing:** Default dashboard landing preference based on operational role.
- **Language:** UI language selection (English / Kannada).
These preferences persist in local storage to provide a tailored user experience across sessions.

### 🔐 Privacy, Consent & Security UX
- **Cookie Consent:** Professional cookie consent banner for transparent data handling.
- **Privacy Policy & Terms of Service:** Dedicated pages for transparency and governance trust.
- **Security Guidelines:** Dedicated Security Guidelines documentation page.
- **Support:** Integrated Contact Support experience with user-facing submission confirmation.

### 👥 Role-Based Experience Refinement
- Tailored role-specific navigation and workflows for **Field Officer**, **Intelligence Analyst**, and **Administrator**.
- Field Officer workflow focused on quick incident filtering, station beat cases, and local hotspot telemetry.
- Intelligence Analyst workflow focused on cross-district comparisons, temporal trends, DBSCAN spatial clustering, CCRI risk scoring, and predictive forecasting.
- Administrator workflow focused on security audit log queries, system status telemetry, and user management.

### ☁️ Zoho Catalyst Deployment
- **Zoho Catalyst AppSail:** FastAPI/Python backend runs as an AppSail service with Python 3.10 runtime.
- **Catalyst Web Client Hosting:** React 19 production build deployed to Catalyst Web Client Hosting.
- **Catalyst CLI:** Integrated deployment workflows and automated packaging.

### 💾 Multi-Tier Caching & Backend Optimization
- **Multi-Tier Cache Architecture:** Implemented a two-tier caching architecture combining a fast L1 in-memory LRU cache and an L2 Zoho Catalyst Cache segment.
- **L1 In-Memory LRU Cache:** Thread-safe, bounded memory store (1,000 entries max) with per-item TTL expiration for sub-millisecond hot reads.
- **L2 Zoho Catalyst Cache:** Shared BaaS cache segment for distributed persistence across AppSail worker instances.
- **Promotion & Fallback:** Two-tier promotion on cache miss (L1 Miss $\rightarrow$ L2 Hit $\rightarrow$ Populate L1 $\rightarrow$ Return response). Cache failures fail safely directly to the repository layer without impacting API availability.
- **Single-Flight Coordination:** Concurrency lock preventing cache stampedes during concurrent cache misses for identical keys.
- **Public Root Endpoint:** Clean public `GET /` service status endpoint alongside health probes.

### 🚀 Scalability & Concurrency
- Validated concurrency: The deployed AppSail backend handles concurrent simulated analytical workloads.
- Verified operational resilience across core endpoints: Health, Readiness, Districts, District Intelligence, Analytics Summary, Hotspots, and Forecasting.

### 🧪 Testing & Validation
- Automated backend test suite verifies **683 tests** (`683 passed, 92 deselected, 0 failed, 0 errors`).
- Comprehensive test coverage for JWT verification, server-side RBAC, multi-tier cache operations, rate limiting, audit logging, public root/health endpoints, and domain services.

---

## 📑 Table of Contents

1. [Problem Statement](#1--problem-statement)
2. [Solution Overview](#2--solution-overview)
3. [Google Maps Integration](#3--google-maps-integration)
4. [Key Features](#4--key-features)
5. [System Architecture](#5--system-architecture)
6. [Technology Stack](#6--technology-stack)
7. [Data & Transparency](#7--data--transparency)
8. [Security & Authentication](#8--security--authentication)
9. [Project Structure](#9--project-structure)
10. [Getting Started](#10--getting-started)
11. [Configuration](#11--configuration)
12. [API Overview](#12--api-overview)
13. [Testing & Reliability](#13--testing--reliability)
14. [Deployment](#14--deployment)
15. [Production Extensions](#15--production-extensions)

---

## 1. 🎯 Problem Statement

Law-enforcement agencies generate large volumes of operational information across FIRs, districts, police stations, arrests, chargesheets, victims, accused persons, and legal records. When these records remain fragmented across siloed files and reporting systems, extracting timely, actionable intelligence becomes difficult.

| Challenge | Impact |
|-----------|--------|
| **Fragmented crime records** | Information must be combined manually before meaningful strategic or field analysis can occur. |
| **Limited analytical visibility** | High-level trends, geographic hotspots, district variations, and repeat-offender links are difficult to identify quickly. |
| **Reactive decision-making** | Historical records exist, but converting them into proactive operational intelligence requires specialized processing. |
| **Complex spatial and relational patterns** | Geographic concentrations and multi-case criminal networks remain hidden within flat tabular records. |

---

## 2. 💡 Solution Overview

**CrimeIntel** is an integrated AI-driven crime analytics and intelligence platform that converts structured police records into operational and strategic insights for data-driven policing.

> **Crime Dashboard · Geographic Crime Map · Hotspot Intelligence · District Intelligence · Trend Analytics · Network Analysis · AI/ML Insights · Secure Decision Support**

CrimeIntel follows an API-first architecture. The modern React frontend communicates with secured FastAPI backend services. Supabase provides authentication and hosted PostgreSQL infrastructure, Zoho Catalyst provides cloud deployment (AppSail and Web Client Hosting), and Zoho Catalyst Cache provides distributed L2 caching.

```text
User / Officer
      ↓
React + Vite Frontend (Catalyst Web Client)
      ↓  Bearer JWT (Supabase Auth)
FastAPI Backend (Zoho Catalyst AppSail)
      ↓
Multi-Tier Cache (L1 Memory → L2 Catalyst Cache)
      ↓ (Cache Miss)
Repository & ML Analytics Layer
      ↓
Supabase PostgreSQL Database
```

---

## 3. 🗺️ Google Maps Integration

During the Refined Prototype Phase, the initial mapping layer was upgraded to **Google Maps** (`@vis.gl/react-google-maps`) to provide a familiar, high-performance, and professional geographic visualization experience.

This integration aligns the spatial analysis workflow with modern law-enforcement UX standards while preserving all crime-intelligence and spatial telemetry features.

### Prototype Evolution

| Capability | Initial Prototype | Refined / Final Implementation |
|---|---|---|
| Mapping Technology | Leaflet | Google Maps (`@vis.gl/react-google-maps`) |
| Geographic Visualization | Basic | Enhanced Vector Maps + Satellite Layers |
| Crime Locations | Coordinate plotting | Interactive markers with rich metadata cards |
| Hotspot Detection | Bounded boxes | Dynamic DBSCAN clusters & intensity gradients |
| Density Heatmaps | Basic raster | Native high-density heatmap layers |
| Incident Clustering | Marker grouping | High-performance dynamic coordinate clustering |
| Role-Based Workflows | Unified map | Role-tailored Field Map & Intelligence Map |

### Geographic Capabilities

- **Crime Location Visualization:** Precise coordinate plotting of incidents with crime category color coding.
- **Crime Hotspots:** Visualizing geographic concentrations of recorded crime for patrol beat planning.
- **Heatmap Visualization:** Rendering density intensity maps across urban and rural police precincts.
- **Cluster Visualization:** Dynamically grouping dense incident records for clean map navigation.
- **Location-Based Telemetry:** Interactive modal inspection with FIR summary, IPC sections, and station jurisdiction.

---

## 4. ✨ Key Features

### 📊 Interactive Executive & Role Dashboards
Consolidated crime KPIs, arrest rates, chargesheet distributions, temporal trends, district comparative metrics, and executive summaries tailored for Field Officers, Intelligence Analysts, and Station Commanders.

### 🗺️ Geospatial Crime Intelligence (Google Maps)
Interactive geographic visualization of incidents, precinct boundaries, dynamic DBSCAN clusters, density heatmaps, and spatial hotspot detection.

### 🔥 Crime Hotspot Intelligence
Identifies geographic concentrations of crime using spatial clustering algorithms to support targeted patrol deployment and resource allocation.

### 📈 Trend & Temporal Analytics
Explores crime patterns across time through multi-year timeline analysis, seasonal category trends, day/night temporal distributions, and cross-district comparative metrics.

### 🏙️ District & Station Intelligence Profiles
Comprehensive district-level profiles across all 31 Karnataka districts, including station rosters, crime category breakdowns, CCRI risk indicators, and recent FIR records.

### 🔗 Criminal Network Analysis
Builds deterministic relationship graphs from FIR-person relationships to reveal linked FIRs, person-case connections, co-accused associations, and repeat-offender clusters.

### 🧠 AI/ML Analytics & Forecasting
- **DBSCAN Spatial Hotspots:** Pre-computed density-based spatial clustering of incident coordinates.
- **Composite Crime Risk Index (CCRI):** Multi-factor risk scoring and ranking across police precincts.
- **Predictive Forecasting:** Multi-day crime incident volume projections.

### 📤 Reporting, Export & Decision Support
Provides bounded operational CSV/PDF export, interactive visualizations, and structured analytical dossiers supporting evidence-based decision-making.

---

## 5. 🧩 System Architecture

```text
                       +----------------------+
                       | Police / Analyst User|
                       +----------+-----------+
                                  |
                                HTTPS
                                  |
                                  v
+----------------------------------------------------------------+
|                     React + Vite Frontend                      |
| Dashboard | Field Map | Intelligence Map | District | Network  |
+---------------------------------+------------------------------+
                                  |
                              Bearer JWT
                                  |
                                  v
+----------------------------------------------------------------+
|                        FastAPI Backend                         |
|   Public Root (GET /)  |  Health Probes  |  Protected APIs     |
+---------------------------------+------------------------------+
                                  |
      +---------------------------+---------------------------+
      |                                                       |
      v                                                       v
+-----------------------------+             +-----------------------------+
|    L1 In-Memory LRU Cache   |             |    Authentication & RBAC    |
|   Thread-Safe · TTL Bounded |             |   JWT Verify · Claim Map    |
+--------------+--------------+             +-----------------------------+
               | (cache miss)
               v
+-----------------------------+
|   L2 Zoho Catalyst Cache    |
|   Segment Store · Fail-Safe |
+--------------+--------------+
               | (cache miss)
               v
+----------------------------------------------------------------+
|                   Repository & Service Layer                   |
|       PostgreSQL Repositories    |    ML & Analytics Engine    |
+---------------------------------+------------------------------+
                                  |
                                  v
+----------------------------------------------------------------+
|                       Supabase Platform                        |
|        Supabase Auth                 PostgreSQL Database       |
|        Session + JWT                 Production Persistence    |
+----------------------------------------------------------------+

      Cloud Deployment: Zoho Catalyst (AppSail + Web Client Hosting)
```

### Multi-Tier Caching Architecture

1. **L1 In-Memory LRU Cache:** Fast in-process cache storing serializable response objects with per-item TTL expiration and capacity bounds (1,000 entries max).
2. **L2 Zoho Catalyst Cache:** Shared BaaS cache segment in Zoho Catalyst providing cross-worker cache persistence.
3. **Promotion on Miss:** When an L1 cache miss occurs, the system queries L2. On an L2 hit, the item is promoted to L1 for subsequent sub-millisecond retrieval.
4. **Single-Flight Stampede Protection:** Mutex coordination prevents redundant simultaneous backend queries for identical cache keys during heavy traffic.
5. **Fail-Safe Operation:** If L2 cache is unreachable or unconfigured, the application gracefully degrades to L1 and repository queries without throwing API errors.
6. **Targeted Invalidation:** Mutation operations trigger coordinated prefix and key invalidation across both L1 and L2 layers.

---

## 6. 🧰 Technology Stack

| Layer | Technologies | Version / Details |
|---|---|---|
| **Frontend** | React 19, Vite 8, JavaScript/JSX | Modern component-driven UI |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide React | Clean, professional dark/light police design |
| **Mapping / GIS** | Google Maps (`@vis.gl/react-google-maps`) | Coordinate plotting, heatmaps, clustering |
| **Backend** | Python 3.10, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous REST API |
| **Database** | PostgreSQL hosted on Supabase | Relational persistence, connection pooling |
| **Authentication** | Supabase Auth, JWT (PyJWT, Cryptography) | Cryptographic Bearer token verification |
| **Authorization** | Server-Side RBAC | Least-privilege role & permission mapping |
| **Caching** | Multi-Tier Cache (L1 LRU + L2 Zoho Catalyst) | In-memory TTL + Catalyst BaaS segment |
| **Analytics & ML** | Pandas, NumPy, Scikit-learn, XGBoost | DBSCAN clustering, CCRI scoring, forecasting |
| **Network Intelligence**| Graph analysis | FIR-person relationship link analysis |
| **Testing** | Pytest, TestClient, AnyIO | Automated testing suite (683 tests) |
| **Cloud Hosting** | Zoho Catalyst AppSail & Web Client Hosting | Managed serverless deployment |

---

## 7. 📋 Data & Transparency

CrimeIntel adheres to strict data-integrity and privacy principles:

- **Approved Datasets as Source of Truth:** Official crime records, FIR details, district boundaries, and station rosters serve as authoritative sources.
- **No Unattributed Synthetic Data:** Synthetic or demo data is clearly separated and never presented as authoritative government records.
- **PII Exclusion in Analytical APIs:** Person-level sensitive details (victim identities, full PII) are excluded from general analytical responses.
- **Architectural Separation:** Persistence, business logic, caching, and presentation layers are decoupled via repository contracts.
- **Data Backend Support:** Production persistence relies on PostgreSQL on Supabase, with an in-memory/CSV repository adapter available for offline unit testing.

---

## 8. 🔐 Security & Authentication

CrimeIntel implements a Zero-Trust, deny-by-default security architecture combining **Supabase Auth** for client sessions and **FastAPI JWT validation** for backend API enforcement.

```text
User / Officer
      |
      v
React Frontend (Supabase Client)
      |
      | Sign in with departmental credentials
      v
Supabase Auth Service
      |
      | Returns Session + Access JWT
      v
Frontend API Client (`fetchAPI`)
      |
      | Authorization: Bearer <JWT>
      v
FastAPI Authentication Middleware & Dependencies (`get_current_identity`)
      |
      +---> Cryptographic JWT signature & expiry check (JWKS / Secret)
      +---> Server-side RBAC claim resolution (Admin / Analyst / Officer)
      +---> Route permission check (e.g. `dashboard.read`, `map.read`)
      |
      v
Protected CrimeIntel API Handlers
```

### Security Controls

- **Public vs Protected Endpoints:**
  - **Public Endpoints:** Root service status (`GET /`) and health probes (`/health`, `/health/live`, `/health/ready`) are accessible without authentication.
  - **Protected Endpoints:** All `/api/v1/*` routes require a valid Bearer JWT. Unauthenticated requests are rejected with `HTTP 401 TOKEN_MISSING`.
- **Cryptographic Verification:** Validates token signatures against Supabase JWKS / JWT secrets, checking issuer, audience, and expiry claims.
- **Server-Side RBAC:** Maps claims to validated roles (`ADMIN`, `ANALYST`, `FIELD_OFFICER`) with explicit granular permissions (`dashboard.read`, `map.intelligence.read`, `audit.read`, etc.).
- **Rate Limiting:** In-process fixed-window rate limiter protecting cost-heavy endpoints (export, search, audit).
- **Security Headers:** Enforces `Cache-Control: no-store` on authenticated API responses, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Security Audit Trail:** Immutable append-only audit logging recording security events and denied access attempts.

---

## 9. 📂 Project Structure

```text
Datathon/
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI routes (dashboard, districts, maps, stations, analytics, auth)
│   │   ├── core/                # Auth dependencies, JWT verification, cache, audit, rate limit, config
│   │   ├── database/
│   │   │   ├── postgres/        # PostgreSQL implementation and connection pooling
│   │   │   ├── repositories/    # Repository contracts and CSV fallback adapters
│   │   │   └── ingest/          # Data ingestion utilities
│   │   ├── models/              # Pydantic and domain models
│   │   ├── schemas/             # Request/response schemas
│   │   ├── services/            # Business logic and intelligence services
│   │   └── main.py              # Application entry point, middleware, and route registration
│   ├── tests/                   # Pytest test suite (auth, rbac, cache, api, health, repositories)
│   ├── requirements.txt
│   ├── app-config.json          # Catalyst AppSail configuration
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI elements, navigation, notifications, modals
│   │   ├── context/             # AuthContext (Supabase session), NotificationContext
│   │   ├── modules/             # Analytics, dashboard, district-intelligence, hotspot-detection, map, network
│   │   ├── services/            # Unified API client (`api.js`) and Supabase client (`supabase.js`)
│   │   ├── utils/               # PDF generation, formatters
│   │   └── App.jsx              # Main routing, role switching, and view controller
│   ├── public/                  # Public assets, icons, documentation resources
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── catalyst-web-client/         # Catalyst Web Client build output directory
├── docs/                        # Architecture, API specifications, and RBAC documentation
├── ml-engine/                   # ML models, clustering notebooks, and training pipelines
├── catalyst.json                # Catalyst project deployment configuration
└── README.md
```

---

## 10. 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+ and npm**
- **Git**
- Access to Supabase project (URL and publishable/anon key)

### 1. Clone Repository

```bash
git clone https://github.com/Nirmal0804/Datathon.git
cd Datathon
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`.

### 3. Frontend Setup

In a separate terminal:
```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

## 11. 🔧 Configuration

### Backend Configuration (`backend/.env`)

```env
APP_NAME=crime-analytics-backend
ENVIRONMENT=development
API_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Database Configuration
DATA_BACKEND=postgres
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Authentication Configuration
REQUIRE_AUTH=true
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_JWKS_URL=https://your-project-ref.supabase.co/auth/v1/.well-known/jwks.json
SUPABASE_JWT_ISSUER=https://your-project-ref.supabase.co/auth/v1
SUPABASE_JWT_AUDIENCE=authenticated

# L1 In-Memory Response Cache
CACHE_ENABLED=true
CACHE_TTL_SECONDS=600
CACHE_MAX_ENTRIES=1000

# L2 Zoho Catalyst Cache
CACHE_L2_ENABLED=true
CACHE_L2_SEGMENT_ID=your-catalyst-cache-segment-id
CACHE_L2_TTL_SECONDS=600
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

*(Note: Never commit real passwords, secret keys, or service-role keys to source control.)*

---

## 12. 📡 API Overview

### Public Service & Health Probes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Public root service status and message | No |
| GET | `/health` | Application status, database connection & cache statistics | No |
| GET | `/health/live` | Process liveness probe | No |
| GET | `/health/ready` | Readiness probe verifying PostgreSQL connection | No |

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/auth/me` | Returns server-verified identity and RBAC role | Yes (`Bearer`) |

### Executive Dashboard

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/dashboard/summary` | State-level KPIs, arrest rates, chargesheet distributions | Yes (`Bearer`) |

### Field Crime Map

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/map/field/cases` | Paginated FIR case records with geospatial filters | Yes (`Bearer`) |
| GET | `/api/v1/map/field/case/{fir_identifier}` | Detailed FIR record and case summary | Yes (`Bearer`) |
| GET | `/api/v1/map/field/filters` | Distinct filter options (districts, stages, crime types) | Yes (`Bearer`) |
| GET | `/api/v1/map/field/hotspots` | Beat-level spatial crime clusters | Yes (`Bearer`) |

### Intelligence Map & Analytics

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/map/intelligence/analytics` | High-level spatial intelligence metrics | Yes (`Bearer`) |
| GET | `/api/v1/map/intelligence/heatmap` | Spatial density coordinate points for heatmaps | Yes (`Bearer`) |
| GET | `/api/v1/map/intelligence/clusters` | Station-level incident clusters | Yes (`Bearer`) |
| GET | `/api/v1/map/intelligence/hotspots` | DBSCAN spatial hotspot centroids | Yes (`Bearer`) |
| GET | `/api/v1/map/intelligence/district-comparison` | Multi-district comparative crime metrics | Yes (`Bearer`) |
| GET | `/api/v1/map/intelligence/timeline` | Temporal crime incident trend data | Yes (`Bearer`) |
| GET | `/api/v1/map/intelligence/export` | Bounded operational CSV intelligence export | Yes (`Bearer`) |

### District & Station Intelligence

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/districts` | List all 31 districts with summary metrics | Yes (`Bearer`) |
| GET | `/api/v1/districts/{district_id}/intelligence` | Single-district comprehensive intelligence dossier | Yes (`Bearer`) |
| GET | `/api/v1/stations` | List police stations with optional district filtering | Yes (`Bearer`) |
| GET | `/api/v1/stations/{station_id}` | Detailed police precinct profile and metrics | Yes (`Bearer`) |

### Predictive & ML Analytics

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/analytics/summary` | Executive ML dashboard summary metrics | Yes (`Bearer`) |
| GET | `/api/v1/analytics/hotspots` | DBSCAN spatial cluster summaries | Yes (`Bearer`) |
| GET | `/api/v1/analytics/risk-scores` | Station-level CCRI risk ranks, scores, and tiers | Yes (`Bearer`) |
| GET | `/api/v1/analytics/forecast` | Daily crime incident volume forecast (1 to 30 days) | Yes (`Bearer`) |

### Criminal Network Analysis

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/network/graph` | Deterministic FIR-person relationship graph | Yes (`Bearer`) |
| GET | `/api/v1/network/entities/{type}/{id}` | Entity detail (FIR, person, station) | Yes (`Bearer`) |
| GET | `/api/v1/network/search` | Multi-entity cross-reference search | Yes (`Bearer`) |

### Security & Administration

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/admin/audit/events` | Query security audit event logs | Yes (`admin`) |

---

## 13. ✅ Testing & Reliability

CrimeIntel is backed by a comprehensive automated test suite.

```powershell
python -m pytest tests/ -k "not test_production_db_migration"
```

**Verified Test Result:**
```text
===================== 683 passed, 92 deselected in 18.35s =====================
```

### Reliability & Verification Coverage

- **Authentication & JWT Security:** Valid token resolution, expired/malformed token rejection, JWKS validation, and algorithm-confusion protection.
- **Route Protection:** Deny-by-default access verification across all protected routes.
- **Public Root & Probes:** Verified `GET /`, `/health`, `/health/live`, and `/health/ready` responses.
- **Server-Side RBAC:** Verified least-privilege role mappings and permission gates for Field Officers, Analysts, and Admins.
- **Multi-Tier Cache Operations:** Unit and integration tests for L1 LRU memory store, L2 Catalyst Cache fallback, two-tier promotion, TTL eviction, and concurrency stampede coordination.
- **Rate Limiting:** Verified fixed-window rate limiter on standard, search, export, and audit routes.
- **Domain Services:** Tested dashboard metrics, district intelligence dossiers, station telemetry, DBSCAN hotspots, CCRI risk scoring, network graphs, and CSV data loader.

---

## 14. 📦 Deployment

CrimeIntel is deployed to **Zoho Catalyst** in a Development / Demo environment.

```text
                     Zoho Catalyst Cloud
              +--------------------------------+
Browser ----> |  Catalyst Web Client Hosting   | (React 19 + Vite 8 App)
              +---------------+----------------+
                              |
                              v
              +--------------------------------+
              |     Catalyst AppSail (Python)  | (FastAPI Service)
              +---------------+----------------+
                              |
              +---------------+----------------+
              |                                |
              v                                v
     Zoho Catalyst Cache               Supabase Cloud
     (Distributed L2 Cache)      (Auth + PostgreSQL Database)
```

### Deployed Endpoints (Development / Demo)

- **Frontend (Web Client):** [https://crime-intel-60079748823.development.catalystserverless.in/app/index.html](https://crime-intel-60079748823.development.catalystserverless.in/app/index.html)
- **Backend (AppSail):** [https://crimeintel-backend-50044367664.development.catalystappsail.in](https://crimeintel-backend-50044367664.development.catalystappsail.in)

### Deployment Commands

To deploy the AppSail backend:
```bash
catalyst deploy --only appsail:crimeintel-backend --ignore-scripts
```

To build and deploy the React frontend:
```bash
cd frontend
npm run build:catalyst
cd ..
catalyst deploy --only webclient
```

---

## 15. 🔮 Production Extensions

### Implemented in Current Release

- **Role-Based Access Control (RBAC):** Server-side role mapping (`FIELD_OFFICER`, `ANALYST`, `ADMIN`) with granular permissions.
- **Multi-Tier Response Caching:** L1 in-process LRU cache combined with L2 Zoho Catalyst Cache segment.
- **Public Root Endpoint:** Public `GET /` service response alongside health probes.
- **Google Maps GIS Integration:** Advanced coordinate plotting, clustering, and heatmap layers.
- **AI/ML Predictive Analytics:** DBSCAN spatial clustering, precinct CCRI risk scoring, and 30-day crime volume forecasting.
- **Security Audit Logging:** Append-only security audit trail with query API.
- **Multi-Language Support:** English and Kannada interface localization.
- **User Preference Persistence:** Theme, date/time formatting, and default landing preferences.

### Planned Future Extensions

- **Distributed Rate Limiting:** Migrating in-process rate limiting to distributed store for multi-region active-active deployments.
- **Authoritative Boundary Ingestion:** Integration with state GIS department boundary polygons.
- **Advanced Real-Time Telemetry:** WebSocket integration for live officer location tracking and dispatch events.
- **Expanded Statutory PDF Reporting:** Additional statutory compliance templates for automated court dossier generation.

---

<div align="center">

# 🛡️ CrimeIntel

**Crime Intelligence · Geospatial Analytics · Network Analysis · Decision Support**

### Transforming fragmented crime records into actionable intelligence.

**Built for Datathon 2026**

</div>
