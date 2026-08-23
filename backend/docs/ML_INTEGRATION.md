# ML Engine Integration Contract

Status of this document: **reference / recommendation**. This describes
the machine-learning artifacts produced by `ml-engine/` and how they may
safely integrate with the backend. It does **not** claim the backend
currently exposes ML endpoints — it does not.

## Current state (verified during audit)

- The backend (`backend/`) has **no ML integration**. No joblib loading,
  no pandas/scikit-learn dependency, no ML endpoints.
- The backend's `map/intelligence/*` endpoints (`clusters`, `hotspots`,
  `analytics`, `timeline`, `district-comparison`) are **deterministic
  aggregations** over the data layer, explicitly documented as "not ML
  clustering" in the route descriptions.
- The frontend is fully mock. The ML layer's only consumer path today is
  a static JSON export (below), which is not wired to anything.

## What the ML engine produces

`ml-engine/` is a self-contained pipeline (pandas / scikit-learn /
joblib). It trains and saves:

| Artifact | Producer | Contents (contract) |
|----------|----------|----------------------|
| `models/dbscan_hotspots.joblib` | `train_dbscan.py` | dict: `cluster_centroids` (cluster_id → (lat, lon)), `eps_km`, `min_samples`, `n_clusters` |
| `models/crime_risk_model.joblib` | `train_risk_model.py` | dict: model metadata + risk data (station-level CCRI) |
| `models/crime_forecasting_model.joblib` | `train_forecasting.py` | dict: `model_name`, `evaluation_metrics` (`MAE`, `RMSE`, `R2_Score`), fitted model |
| `outputs/hotspots.csv` | DBSCAN pipeline | FIR rows with cluster assignments |
| `outputs/hotspot_summaries.csv` | DBSCAN pipeline | `Cluster_ID`, `Primary_Crime_Head`, `Primary_District`, `Total_Crimes`, `Total_Severity_Score` |
| `outputs/station_risk_scores.csv` | CCRI pipeline | `Station_ID`, `Station_Name`, `District`, `Zone`, `Risk_Score`, `Risk_Tier`, `FIR_Count`, `Severity_Load`, `Hotspot_Count`, `Personnel_Strength`, `Patrol_Vehicles`, `Risk_Rank`, `z_*` factors |
| `outputs/crime_forecasts.csv` | forecasting pipeline | `Date`, `Day_of_Week`, `Forecasted_Crime_Count` (30 days) |
| `outputs/model_evaluation_report.md` | forecasting pipeline | MAE / RMSE / R² report |

### CLI inference (`scripts/predict.py`)

A self-contained inference CLI that reads the joblib + output CSVs:
`--station PS0069`, `--lat/--lon`, `--forecast_days N`, `--summary`.

### Frontend export (`scripts/export_ml_to_frontend.py`)

Exports `outputs/*.csv` → JSON under `frontend/public/data/`
(`hotspot_summaries.json`, `hotspots.json`, `station_risk_scores.json`,
`crime_forecasts.json`, `dashboard_kpis.json`). No such export directory
currently exists in the repo, so nothing consumes it yet.

## Integration options (recommendation, not implemented)

The mission rule is: **never fabricate ML outputs**. Options below are
recommendations only.

1. **Keep the current split (recommended for this deliverable).** The
   deterministic backend endpoints are correct and testable. The ML
   outputs remain static artifacts. No integration risk.
2. **Expose outputs via a read-only service.** Add a
   `CrimeInsightsService` that loads the output CSVs (they are small and
   static) and serve them behind explicit permissions
   (`analytics.read` / `system.configuration.read`). The joblib files
   stay out of the API process to avoid bringing in heavy ML deps.
3. **Serve forecasts/risk from Postgres.** Promote the outputs into
   tables (e.g. `station_risk_scores`, `crime_forecasts`) via the
   ingestion pipeline and serve through normal repositories — full
   audit + RBAC + RLS coverage, at the cost of a new migration.

### Guardrails for any future integration

- Never load `*.joblib` into the API process (untrusted/versioned
  binary deserialization risk; heavy dependency footprint).
- Route-level permission deps must be applied (existing pattern).
- Output rows containing station names are operational data; never
  export person-level PII from `people.csv` or FIR person IDs.
- Keep ML outputs versioned and rebuilt offline; API should degrade
  gracefully (404/503, documented) when artifacts are absent — never
  silently substitute deterministic data and label it "model output".

## Verification status

- Backend ML endpoints: **none exist** (by design).
- No `frontend/public/data/` exports present in this checkout.
- ML scripts depend on `joblib`, `pandas`, `scikit-learn`, `xgboost`,
  which are **not** part of the backend runtime requirements.