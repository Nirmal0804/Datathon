# Karnataka Police Crime Analytics Platform

A crime analytics, predictive modeling, and GIS hotspot intelligence platform for Karnataka Police.

## Repository Structure

```
ProjectRoot/
├── frontend/     # React dashboard & GIS interactive visualization web app
├── ml/           # Machine learning pipelines, datasets, models, and scripts
├── README.md     # Project documentation
└── .gitignore    # Git ignore rules
```

## Quick Start

### 1. Machine Learning Workflows (`ml/`)
To run ML model training pipelines and export data to the frontend:

```bash
# Train DBSCAN geospatial hotspot model
python ml/scripts/train_dbscan.py

# Train Composite Crime Risk Index (CCRI) station scoring model
python ml/scripts/train_risk_model.py

# Train time-series crime forecasting pipeline
python ml/scripts/train_forecasting.py

# Run unified prediction CLI
python ml/scripts/predict.py --summary

# Export ML outputs to frontend public/data/
python ml/scripts/export_ml_to_frontend.py
```

### 2. Frontend Web Application (`frontend/`)
To launch the React dashboard:

```bash
cd frontend
npm install
npm run dev
```
