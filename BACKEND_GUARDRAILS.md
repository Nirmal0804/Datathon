# BACKEND_GUARDRAILS.md — Non-Negotiable Backend Boundaries

## 1. Why this file exists

This project concerns police crime analytics. OpenCode must not fill missing information with plausible-looking data, models or relationships. Correctness, provenance and clear team ownership matter more than making every screen appear complete.

Read this file before implementation.

---

## 2. Never invent project data

Do not invent:
- FIRs;
- arrests;
- accused identities;
- victim identities;
- incident coordinates;
- district statistics;
- police station statistics;
- crime categories claimed to be source-recorded;
- socio-economic values;
- model scores.

If the frontend currently contains mock values, treat them as frontend mocks unless the user explicitly says they are authoritative.

Do not migrate mock values into backend "real data."

---

## 3. Dataset ownership boundary

The backend developer does not own dataset sourcing/creation/training-data preparation.

When data is missing:
- identify exactly which fields/table/join keys are required;
- create an interface/schema only if useful;
- stop before inventing values.

The backend may perform runtime normalization/validation needed to consume the approved handoff, but must not redefine source truth silently.

---

## 4. ML ownership boundary

Do not:
- train a predictive-risk model;
- tune hyperparameters;
- train an anomaly model;
- generate fake model artifacts;
- create random risk scores;
- create a heuristic and label it "AI" without explicit team approval;
- claim accuracy/precision/recall not supplied by the ML team.

Allowed backend work:
- define an adapter/interface;
- load/call supplied artifact;
- map DB values to agreed runtime inputs;
- validate model output;
- expose output through API;
- handle unavailable artifact;
- mock the adapter in tests.

A test double is not a project model.

---

## 5. Hotspot/analytics ownership

Do not assume hotspot detection, anomaly detection, correlation or graph algorithms belong to backend merely because an `analytics/` directory exists.

Before implementing an algorithm:
1. check project/team assignment;
2. check existing code/artifact;
3. determine whether backend owns deterministic computation or only integration.

If uncertain, build the integration boundary and flag the missing handoff.

---

## 6. No invented database schema

Never create columns based only on abstract feature descriptions.

Examples:
- `risk_score` may be a computed response field, not a DB column.
- `severity` may not exist in the approved schema.
- `latitude`/`longitude` may not exist.
- `case_status` naming may differ.

Use the actual schema.

If schema is unavailable, create no production ORM model pretending otherwise.

---

## 7. Do not modify source data to satisfy UI

Never:
- fill missing coordinates with district centers and present them as incident points;
- replace unknown dates with today's date;
- convert null arrest status to "not arrested";
- infer case closure from unrelated fields;
- merge people by name similarity alone.

Unknown must remain unknown unless an approved transformation exists.

---

## 8. Sensitive-data handling

Assume crime/person records are sensitive.

Do not:
- print entire records in logs;
- return all columns by default;
- expose internal IDs unnecessarily;
- commit source DB dumps;
- commit private CSVs;
- include sensitive fixture data copied from real records;
- put credentials in examples.

Use fabricated minimal data only in unit-test fixtures, clearly scoped to tests.

---

## 9. Criminal network safety

A graph edge can be misinterpreted.

Every relationship must be traceable to an actual supported relationship such as:
- co-appearance in the same case;
- recorded arrest relation;
- recorded station relation.

Do not infer:
- gang membership;
- conspiracy;
- guilt;
- association based merely on geographic proximity;
- relationship based solely on similar names.

Use neutral relationship labels.

---

## 10. Predictive outputs

Risk/anomaly outputs are decision-support outputs.

Never present:
- district risk as certainty;
- anomaly as proof of wrongdoing;
- predicted crime as an event that will occur;
- a person-level "criminality score."

Prefer geographic/operational risk analysis aligned with the project requirements.

Include model/method metadata when available.

---

## 11. Socio-economic analysis

Never state that literacy, income, employment, population or urbanization **causes** crime based on correlation.

Responses/reports must use wording such as:
- "associated with";
- "correlated with";
- "observed relationship."

Preserve source and time-period metadata.

---

## 12. Frontend boundary

Do not redesign or refactor Nirmal's frontend while doing backend checkpoints.

Allowed:
- inspect frontend code to discover data requirements;
- document expected response contracts;
- make small integration edits only when explicitly requested.

If the frontend assumes fields the backend cannot support from real data, report the mismatch.

---

## 13. Git safety

Never without explicit user instruction:
- commit;
- push;
- force-push;
- reset `--hard`;
- delete branches;
- rewrite shared history;
- merge into `main`, `develop` or Nirmal's branch.

Never stage unrelated files.

Before a proposed commit:
```bash
git status
git diff
git diff --check
git diff --staged
```

Do not commit:
- `.env`;
- secrets;
- private datasets;
- DB dumps;
- virtual environments;
- caches;
- generated reports;
- large model artifacts unless the team has an explicit artifact strategy.

---

## 14. Dependency guardrail

Do not add Redis, Celery/RQ, PostGIS, Neo4j, Docker, Alembic or another infrastructure component simply because it sounds scalable.

Add it when:
- current requirements need it;
- repository compatibility is understood;
- local/team setup remains manageable;
- the user approves if it materially changes architecture.

Prefer architecture that can adopt these later.

---

## 15. No destructive migrations

Before any migration:
- determine who owns the DB schema;
- inspect existing migration history;
- show intended schema change.

Never drop/rename production/team columns or tables without explicit approval.

---

## 16. Error behavior

Do not hide missing dependencies behind fake success.

Bad:
```json
{"risk_score": 72}
```
when no model exists.

Good:
```json
{
  "status": "unavailable",
  "reason": "Risk model has not been integrated"
}
```

Do not expose raw stack traces to clients.

---

## 17. Scope guardrail

One checkpoint per session.

Do not "helpfully" implement future modules.

If checkpoint is Dashboard:
- do Dashboard;
- do tests;
- show diff;
- stop.

This keeps commits understandable and prevents ownership creep.

---

## 18. Evidence hierarchy

When deciding what is true, use this order:

1. actual approved DB/schema/data contract;
2. actual supplied ML artifact contract;
3. current repository implementation;
4. agreed project/backend documents;
5. abstract/feature requirements;
6. frontend mockups.

A lower-level source must not silently override a higher-level source.

---

## 19. When blocked

Return a precise blocker:

```text
BLOCKED:
Module: Predictive Risk
Need: exact ML inference input/output contract
Why: backend cannot safely map DB fields to model inputs without it
Can continue with: adapter interface + unavailable-path tests only
```

Do not guess.
