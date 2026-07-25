# AGENTS.md — Datathon Crime Analytics Backend

## 1. Mission

You are assisting with the backend of **AI-Driven Crime Analytics & Visualization Platform for Karnataka Police**.

This repository targets a **production-oriented government crime analytics system**. Prototype shortcuts must not be introduced unless explicitly identified as temporary. Every architectural decision should be suitable for eventual production deployment.

The backend developer owns the application/API/integration layer. Work incrementally, preserve team boundaries, and produce reviewable changes.

Before making backend changes, read these files in this order:

1. `BACKEND_GUARDRAILS.md`
2. `BACKEND_ARCHITECTURE.md`
3. `BACKEND_IMPLEMENTATION_PLAN.md`
4. This `AGENTS.md`

If repository reality conflicts with these documents, **do not silently redesign the repository**. Inspect the conflict, explain it, and propose the smallest safe adaptation.

---

## 2. Backend developer ownership

### Own
- FastAPI application and REST API contracts.
- Request/response validation.
- Database connectivity and repositories.
- Backend queries, filters, pagination and deterministic aggregations required to serve the UI.
- Service/business orchestration.
- Integration of approved data/database supplied by the data team.
- Integration/inference of trained ML or analytics artifacts supplied by the responsible teammate.
- Caching/background processing only where justified by measured or obvious workload needs.
- Error handling, logging, configuration and API documentation.
- Report/export API implementation.
- Backend tests.
- Integration with Nirmal's frontend.
- Backend deployment/runtime configuration when required.

### Do not assume ownership
- Dataset sourcing or creation.
- Dataset labeling.
- Inventing missing government data.
- ML training/tuning/evaluation.
- Creating a substitute ML model merely because the real artifact is unavailable.
- Claiming model accuracy.
- Redesigning the frontend.
- Changing another teammate's files without a backend integration reason.

---

## 3. Repository and branch context

The backend branch is expected to originate from:

`feature-frontend-only-v1-Nirmal`

Backend working branch:

`feature-backend-tamilselvi`

Never assume the current branch. At the beginning of a work session inspect:

```bash
git status
git branch --show-current
git log --oneline -5
```

Do not checkout, merge, rebase, commit, push, reset, force-push or delete branches unless explicitly instructed.

Do not modify `/frontend` unless the user explicitly asks for frontend integration changes. If a frontend contract mismatch is discovered, report it first.

---

## 4. Architecture rules

Target logical structure:

```text
backend/
├── app/
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

The existing repository is authoritative. Do not move an existing frontend into a new `/frontend` directory just to match this diagram.

### Persistence independence

The current data layer uses CSV-backed in-memory repositories. This is a **transitional adapter**, not the production persistence target.

- New service/API code must remain persistence-independent through repository abstractions.
- Services must never import CSV-specific modules directly.
- Repository protocols define the contract; persistence adapters implement it.
- The production persistence target is **Supabase PostgreSQL** (not yet implemented).
- Do not describe CSV repositories as the final production database.

### Security, privacy and auditability

These are architectural requirements, not optional add-ons:

- Authentication and authorization are required for production deployment.
- PII must be minimized in API responses.
- Sensitive crime/person data requires access controls.
- Audit logging for security-relevant events is required.
- Production-sensitive architectural decisions must be documented rather than silently assumed.

### Layer boundaries

`api/`
- HTTP boundary only.
- Parse/validate request.
- Call service.
- Translate known domain exceptions into HTTP responses when not globally handled.
- Return declared schema.
- No raw SQL.
- No model training.
- No large analytics implementation.

`services/`
- Orchestrate repositories, backend calculations and model/analytics adapters.
- Enforce business/application rules.
- Build API-ready results.
- Do not contain HTTP-specific logic.

`database/repositories/`
- All SQL/ORM data-access logic.
- Query only fields needed.
- Apply filters efficiently.
- Avoid N+1 queries.
- Add pagination to list queries.

`models/`
- Reflect actual approved database/domain entities.
- Never invent columns because a UI mockup contains a field.

`schemas/`
- Stable Pydantic API contracts.
- Frontend JSON must not depend on accidental database column naming.

`analytics/`
- Integration boundary for analytics/model functionality.
- Backend-owned deterministic transformations may live here when explicitly in backend scope.
- ML-owned behavior must call/wrap the supplied artifact/API/function.
- Never train models here.

`core/`
- Settings, logging, shared exceptions, middleware and cross-cutting configuration.

`utils/`
- Small generic helpers only.
- Do not hide business logic here.

---

## 5. Required working method

### Phase A — inspect before coding

For every checkpoint:

1. Read relevant guidance files.
2. Inspect repository tree.
3. Inspect existing package/config files.
4. Inspect related frontend page/components only to understand the contract.
5. Search for existing API clients, mock data, types and endpoint assumptions.
6. Inspect existing backend code before creating duplicates.
7. Identify missing external dependencies:
   - database/schema handoff;
   - dataset field contract;
   - ML artifact/inference contract.
8. State a short implementation plan.
9. Only then edit.

Never invent database fields or ML contracts to keep moving.

### Phase B — implement one checkpoint

One checkpoint/module per session unless explicitly told otherwise.

Prefer the smallest complete vertical slice:

`schema → repository → service → API → tests`

Do not build unrelated future infrastructure.

### Phase C — verify

After edits:

1. Run targeted tests.
2. Run broader backend tests when feasible.
3. Run formatting/lint/type checks if the repo has them.
4. Run `git status`.
5. Run `git diff --check`.
6. Show/summarize `git diff`.
7. List files created/changed.
8. Explain assumptions and unresolved handoffs.
9. Stop.

### Phase D — Git

Never auto-commit or auto-push.

When explicitly asked to prepare a commit:
- stage only files belonging to the checkpoint;
- show `git diff --staged`;
- use a descriptive conventional commit;
- wait for explicit permission before pushing if permission was not already given.

---

## 6. Code quality

- Prefer clear code over clever abstractions.
- Use type hints.
- Use dependency injection where FastAPI naturally supports it.
- Use async only where the selected DB/client stack genuinely supports and benefits from it.
- Avoid blocking CPU-heavy work in an async request handler.
- Validate all external input.
- Use UTC internally for timestamps unless domain requirements dictate otherwise.
- Keep filter semantics consistent across endpoints.
- Add pagination for potentially large lists.
- Never return unrestricted bulk FIR/person records.
- Do not expose stack traces, DB credentials or internal filesystem paths.
- Avoid broad `except Exception` unless re-raising/logging appropriately.
- Centralize configuration; do not scatter environment reads.
- No secrets in source.

---

## 7. API conventions

Default prefix:

`/api/v1`

Health:

`GET /health`

Use consistent filters where applicable:
- `start_date`
- `end_date`
- `period`
- `district_id`
- `police_station_id`
- `crime_category`
- `crime_status`
- `severity`
- pagination parameters

Responses should be predictable and typed.

For unavailable ML functionality, use a typed unavailable result/error. Never fabricate a score.

Example conceptual response:

```json
{
  "status": "unavailable",
  "reason": "Risk model artifact has not been handed off",
  "model_version": null
}
```

Do not expose sensitive details in error messages.

---

## 8. Testing requirements

Every completed endpoint should have:
- happy-path test;
- relevant validation/filter test;
- empty-result behavior;
- dependency-unavailable test where applicable.

Test service logic separately when it contains meaningful orchestration/calculation.

Mock external ML/inference dependencies in backend tests. Do not train a model inside tests.

Use small synthetic **test fixtures only** when necessary to verify code behavior. Test fixtures must never be presented as project data.

---

## 9. Security and government-data rules

Treat crime/person data as sensitive. This is a government crime analytics system handling PII, biometric data, and sensitive case information.

- Minimize returned fields.
- Do not log full FIR/person payloads.
- Do not commit private datasets, DB dumps, tokens or credentials.
- Never infer guilt, dangerousness or criminal association beyond supported records.
- Graph edges require evidence-backed relationship types.
- Risk/anomaly outputs are decision-support signals, not facts.
- Correlation must not be described as causation.
- If authorization requirements are not yet defined, isolate the concern and flag it instead of inventing a production auth policy.

### Production security requirements

- Never expose Supabase service-role credentials to the frontend.
- Never hardcode production database credentials.
- Frontend authorization state is not a security boundary.
- Privileged database operations must occur through trusted backend components.
- Secrets must come from approved environment/secret-management mechanisms.
- Database credentials and API secrets must never appear in source code or logs.

---

## 10. Scalability rule: earn complexity

Do not install infrastructure simply because it appears in an architecture document.

PostgreSQL/PostGIS, Redis, a worker queue, Docker, Alembic, NetworkX and similar tools are candidates, not mandatory checkpoint-zero dependencies.

Before adding one:
1. inspect current repo/runtime;
2. identify the concrete module requirement;
3. explain why the dependency is needed now;
4. choose the smallest maintainable option.

Start simple, but keep boundaries that permit scaling later.

---

## 11. Stop conditions

Stop and ask/report instead of guessing when:
- actual DB schema is required but absent;
- a model input/output contract is required but absent;
- a dataset join key is unknown;
- a requested field is not supported by approved data;
- frontend expectations contradict the agreed API contract;
- a migration could destructively alter team data;
- a security-sensitive design decision requires team approval.

---

## 12. End-of-session response format

Always finish backend implementation sessions with:

1. **Completed**
2. **Files changed**
3. **Tests/checks run**
4. **Git status/diff summary**
5. **Assumptions**
6. **Blocked/waiting on**
7. **Recommended next checkpoint**

Then stop.
