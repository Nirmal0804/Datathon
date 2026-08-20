<div align="center">

# 🛡️ CrimeIntel

### AI-Driven Crime Analytics & Intelligence Platform

**Transforming fragmented crime data into actionable intelligence for data-driven policing.**

CrimeIntel unifies crime records, geospatial intelligence, analytical dashboards, hotspot detection, district intelligence, criminal-network analysis, and AI/ML-assisted insights in a secure decision-support platform for law-enforcement workflows.

DEPLOYMENT LINK:https://crime-intel-tosumotv.onslate.in

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb)](#5-technology-stack)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20(Python)-009688)](#5-technology-stack)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e)](#5-technology-stack)
[![Auth](https://img.shields.io/badge/Auth-Supabase%20Auth%20%2B%20JWT-6f42c1)](#7-security--authentication)
[![GIS](https://img.shields.io/badge/GIS-Leaflet-1a936f)](#3-key-features)
[![Deployment](https://img.shields.io/badge/Deployment-Zoho%20Catalyst-2e7d32)](#13-deployment)

**React + Vite · FastAPI · Supabase PostgreSQL · Supabase Auth + JWT · Leaflet GIS · Zoho Catalyst**

</div>

---

## 📑 Table of Contents

1. [Problem Statement](#1--problem-statement)
2. [Solution Overview](#2--solution-overview)
3. [Key Features](#3--key-features)
4. [System Architecture](#4--system-architecture)
5. [Technology Stack](#5--technology-stack)
6. [Data & Transparency](#6--data--transparency)
7. [Security & Authentication](#7--security--authentication)
8. [Project Structure](#8--project-structure)
9. [Getting Started](#9--getting-started)
10. [Configuration](#10--configuration)
11. [API Overview](#11--api-overview)
12. [Testing & Reliability](#12--testing--reliability)
13. [Deployment](#13--deployment)
14. [Production Extensions](#14--production-extensions)

---

## 1. 🎯 Problem Statement

Law-enforcement agencies generate large volumes of information across FIRs, districts, police stations, arrests, chargesheets, victims, accused persons, and legal records. When these records remain fragmented across files and reporting systems, extracting timely intelligence becomes difficult.

| Challenge | Impact |
|-----------|--------|
| **Fragmented crime records** | Information must be combined manually before meaningful analysis. |
| **Limited analytical visibility** | Trends, hotspots, district variations, and relationships are difficult to identify quickly. |
| **Reactive decision-making** | Historical records exist, but converting them into actionable intelligence is difficult. |
| **Complex spatial and relational patterns** | Geographic concentrations and cross-case relationships can remain hidden in tabular records. |

---

## 2. 💡 Solution Overview

**CrimeIntel** is an integrated crime analytics and intelligence platform that converts structured police data into operational and strategic insights.

> **Crime Dashboard · GIS Crime Map · Hotspot Intelligence · District Intelligence · Trend Analytics · Network Analysis · AI/ML Insights · Secure Decision Support**

CrimeIntel follows an API-first architecture. The React frontend consumes secured FastAPI services. Supabase provides authentication and hosted PostgreSQL infrastructure, while Zoho Catalyst is used for application deployment.

```text
Crime / FIR Data
       |
       v
Validation & Ingestion
       |
       v
Supabase PostgreSQL
       |
       v
FastAPI Service & Security Layer
       |
       +---------------+----------------+
       |               |                |
       v               v                v
Crime Analytics   GIS Intelligence  Network Analysis
       |               |                |
       +---------------+----------------+
                       |
                       v
              React Intelligence UI
                       |
                       v
          Law-Enforcement Decision Support
```

---

## 3. ✨ Key Features

### 📊 Interactive Crime Dashboard
Consolidated crime indicators, district distribution, trends, recent cases, and intelligence summaries.

### 🗺️ Karnataka GIS Crime Map
Interactive geographic visualization of crime incidents, filters, clusters, heatmaps, and hotspot information.

### 🔥 Crime Hotspot Intelligence
Highlights geographic concentrations of crime to support location-focused analysis and operational planning.

### 📈 Trend & Temporal Analytics
Explores crime patterns over time through timeline analysis, crime-category trends, temporal distributions, and district comparisons.

### 🏙️ District Intelligence
Provides district-level statistics, category breakdowns, police-station information, recent cases, and hotspot summaries.

### 🔗 Criminal Network Analysis
Builds deterministic relationship graphs from FIR-person relationships to reveal linked FIRs, person-case relationships, and co-accused connections.

### 🧠 AI/ML-Assisted Intelligence
Provides an extensible intelligence layer for validated predictive risk, anomaly detection, forecasting, and related model-driven analytics.

### 📤 Reporting, Export & Decision Support
Provides bounded operational CSV export, interactive visualizations, and analytical workflows supporting evidence-based policing.

---

## 4. 🧩 System Architecture

```text
                       +----------------------+
                       | Police / Analyst User|
                       +----------+-----------+
                                  |
                                HTTPS
                                  |
                                  v
+----------------------------------------------------------------+
|                       React + Vite Frontend                     |
| Dashboard | Crime Map | District | Network | Analytics | Reports|
+------------------------------+---------------------------------+
                               |
                           Bearer JWT
                               |
                               v
+----------------------------------------------------------------+
|                         FastAPI Backend                        |
| Auth | Security | Audit | Validation | REST APIs               |
| Dashboard | Maps | Districts | Stations | Network | Export     |
+------------------------------+---------------------------------+
                               |
                      Repository / Service Layer
                               |
                               v
+----------------------------------------------------------------+
|                        Supabase Platform                       |
|        Supabase Auth              PostgreSQL Database          |
|        Session + JWT              Production Persistence       |
+----------------------------------------------------------------+

                Deployment Platform: Zoho Catalyst
```

Architecture principles include API-first separation, repository abstraction, backend-enforced authentication, privacy-aware responses, evidence-based analytics, and an extensible ML/GIS integration layer.

---

## 5. 🧰 Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, JavaScript/JSX, Tailwind CSS |
| **Visualization** | Interactive charts, Leaflet |
| **Backend** | Python, FastAPI, Pydantic |
| **Database** | PostgreSQL hosted on Supabase |
| **Authentication** | Supabase Auth, JWT |
| **Data Access** | Repository pattern with PostgreSQL and CSV adapters |
| **Analytics** | Python analytics and ML integration layer |
| **GIS** | Leaflet, coordinate-based spatial visualization, GeoJSON-ready architecture |
| **Network Intelligence** | FIR-person relationship graph analysis |
| **Testing** | Pytest |
| **Version Control** | Git, GitHub |
| **Deployment** | Zoho Catalyst |

---

## 6. 📋 Data & Transparency

CrimeIntel follows a strict data-transparency principle: crime records, identities, coordinates, model outputs, and district statistics must not be fabricated and represented as authoritative information.

The data layer supports structured entities including districts, police stations, FIRs, FIR-person relationships, arrests, chargesheets, and crime attributes.

**Key principles:**

- Approved datasets remain the source of truth.
- Synthetic values must not be silently mixed with real government records.
- Person-level PII is excluded from general analytical API responses.
- Persistence is separated from analytics through repository and service layers.
- Dataset provenance and limitations should remain documented as additional sources are integrated.
- Production ingestion supports batched PostgreSQL upserts and repeatable ingestion.

---

## 7. 🔐 Security & Authentication

CrimeIntel uses **Supabase Auth** for frontend authentication and **FastAPI JWT verification** for backend enforcement.

```text
User
 |
 v
React Login
 |
 | Supabase URL + Publishable/Anon Key
 v
Supabase Auth
 |
 | Session + Access JWT
 v
Frontend API Client
 |
 | Authorization: Bearer <JWT>
 v
FastAPI Authentication Middleware
 |
 | Verify identity
 v
Protected CrimeIntel APIs
```

Security controls include deny-by-default authentication, JWT signature and claim validation, HS256/JWKS verification support, explicit algorithm allowlists, algorithm-confusion protection, expiration checks, production authentication guards, security headers, controlled CORS, request IDs, structured logging, audit logging with an admin read API, centralized errors, production API-documentation hardening, and route-level RBAC enforced server-side from verified JWT claims (see `backend/docs/RBAC_AUTHORIZATION.md`).

Server-side RBAC resolves each authenticated identity to a least-privilege role (default `FIELD_OFFICER`); every protected endpoint maps to an explicit permission (`dashboard.read`, `map.intelligence.read`, `audit.read`, etc.). A fixed-window rate limiter (single-instance scope) protects route classes such as export and search. Full details: `backend/docs/RBAC_AUTHORIZATION.md`.

Frontend-safe configuration includes the Supabase project URL and publishable/anon key. Database passwords, database URLs, JWT signing secrets, and privileged Supabase service credentials remain server-side.

Database Row Level Security is enabled on all tables (`supabase/migrations/005_rls.sql`): `districts` and `police_stations` are readable by `authenticated`; all PII-bearing and operational tables are deny-by-default. The backend connects as a privileged role and bypasses RLS — its access is governed by the RBAC permissions above.

---

## 8. 📂 Project Structure

```text
Datathon/
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI routes
│   │   ├── analytics/           # Analytical logic
│   │   ├── core/                # Auth, config, logging, audit, errors
│   │   ├── database/
│   │   │   ├── repositories/    # Repository contracts/adapters
│   │   │   ├── postgres/        # PostgreSQL implementation
│   │   │   └── ingest/          # Data ingestion
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client and Supabase auth
│   │   ├── modules/
│   │   │   ├── analytics/
│   │   │   ├── dashboard/
│   │   │   ├── district-intelligence/
│   │   │   ├── hotspot-detection/
│   │   │   ├── karnataka-crime-map/
│   │   │   ├── network-analysis/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
├── data/
├── docs/
├── ml-engine/
└── README.md
```

---

## 9. 🚀 Getting Started

### Prerequisites

- Python
- Node.js and npm
- Git
- Access to the configured Supabase project for live database/auth testing

### Clone

```bash
git clone <repository-url>
cd Datathon
```

### Backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 10. 🔧 Configuration

Representative backend configuration:

```env
APP_NAME=crime-analytics-backend
ENVIRONMENT=development
API_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

DATA_BACKEND=postgres
DATABASE_URL=<postgresql-connection-string>

REQUIRE_AUTH=true
```

Representative frontend configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-publishable-or-anon-key>
```

Use the repository `.env.example` files as the authoritative configuration reference. Never commit real server credentials.

---

## 11. 📡 API Overview

### Health

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Application/dependency health |
| GET | `/health/live` | Liveness probe |
| GET | `/health/ready` | Readiness probe |

### Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/auth/me` | Backend-verified authenticated identity |

### Dashboard

| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/dashboard/summary` |

### Field Crime Map

| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/map/field/cases` |
| GET | `/api/v1/map/field/case/{fir_identifier}` |
| GET | `/api/v1/map/field/filters` |
| GET | `/api/v1/map/field/hotspots` |

### Intelligence Map

| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/map/intelligence/analytics` |
| GET | `/api/v1/map/intelligence/heatmap` |
| GET | `/api/v1/map/intelligence/clusters` |
| GET | `/api/v1/map/intelligence/hotspots` |
| GET | `/api/v1/map/intelligence/district-comparison` |
| GET | `/api/v1/map/intelligence/timeline` |
| GET | `/api/v1/map/intelligence/export` |

### District Intelligence

| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/districts` |
| GET | `/api/v1/districts/{district_id}/intelligence` |

### Stations

| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/stations` |
| GET | `/api/v1/stations/{station_id}` |

### Network Intelligence

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/network/graph` | Relationship graph |
| GET | `/api/v1/network/entities/{entity_type}/{entity_id}` | Entity detail |
| GET | `/api/v1/network/search` | Cross-entity search |

### Admin

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/audit/events` | Audit trail query (requires `audit.read`; 503 in CSV/dev) |

For exact query parameters and response contracts, refer to the API contract under `docs/`.

---

## 12. ✅ Testing & Reliability

The automated backend test suite (734 tests) covers authentication and JWT security, RBAC authorization, audit write + read API, rate limiting, dashboard services, crime-map APIs, intelligence analytics, district intelligence, stations, network analysis, health probes, error handling, repositories, ingestion, audit logging, and privacy/PII behavior.

Reliability measures include PostgreSQL connection pooling and timeouts, bounded exports, bounded graph construction, centralized error responses, deterministic repository-backed tests, and health/liveness/readiness probes. Continuous integration runs the full suite on every branch via `.github/workflows/backend-ci.yml`.

---

## 13. 📦 Deployment

CrimeIntel uses **Zoho Catalyst** for application deployment.

```text
                   Zoho Catalyst
             +-----------------------+
Browser ---> | React Web Application |
             +-----------+-----------+
                         |
                         v
             +-----------------------+
             |   FastAPI / AppSail   |
             +-----------+-----------+
                         |
              +----------+----------+
              |                     |
              v                     v
       Supabase Auth        Supabase PostgreSQL
```

The React/Vite production build is hosted as the web application, while the FastAPI backend can run through Catalyst AppSail. Supabase remains responsible for authentication and PostgreSQL persistence.

Production deployment must configure the final frontend origin in CORS and supply production environment variables securely.

---

## 14. 🔮 Production Extensions

Implemented this iteration:

- **RBAC authorization** — roles/permissions model, server-side claim resolution, route-level permission deps (`backend/docs/RBAC_AUTHORIZATION.md`).
- **Row Level Security** — deny-by-default on PII tables, selective `authenticated` reads (`supabase/migrations/005_rls.sql`).
- **Audit read API** — `GET /api/v1/admin/audit/events` behind `audit.read` (503 in CSV/dev).
- **Rate limiting** — fixed-window in-process limiter per route class.
- **CI** — `.github/workflows/backend-ci.yml` runs the full suite + production-settings guard.
- **ML integration contract** — audited `ml-engine`; artifacts documented with integration recommendations, no fabricated endpoints (`backend/docs/ML_INTEGRATION.md`).
- **Zoho Catalyst packaging** — `Procfile` + deployment/env-var guide (`backend/docs/PRODUCTION_DATABASE.md`).

Remaining as departmental requirements/authoritative artifacts become available: predictive crime-risk models served from the API, anomaly detection, authoritative GIS boundaries, approved socio-economic datasets, administrative APIs, distributed rate limiting, monitoring, and expanded reporting.

---

<div align="center">

# 🛡️ CrimeIntel

**Crime Intelligence · Geospatial Analytics · Network Analysis · Decision Support**

### From fragmented crime records to actionable intelligence.

**Built for Datathon 2026**

</div>
