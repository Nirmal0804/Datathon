# Machine Learning Engine - Karnataka Police Crime Analytics Platform

This directory contains the machine learning pipelines, datasets, trained model artifacts, output predictions, and inference scripts for the Crime Analytics Platform.

## Directory Overview

```
ml/
├── datasets/     # Primary FIRs, stations, districts, and people datasets
├── models/       # Trained model binary artifacts (.joblib)
├── outputs/      # Evaluation reports, generated CSV forecasts, and plots
├── scripts/      # Python ML scripts (training, evaluation, prediction, export)
├── requirements.txt # Python dependencies
└── run_ml.bat    # Windows batch launcher script
```

## ML Pipelines & Scripts

1. **DBSCAN Geospatial Hotspot Detection**:
   - `python ml/scripts/train_dbscan.py`
   - Detects spatial clusters of crime using spherical Haversine distance metric.

2. **Composite Crime Risk Index (CCRI)**:
   - `python ml/scripts/train_risk_model.py`
   - Computes weighted station-level risk scores (0-100) and risk tiers.

3. **Time-Series Crime Forecasting**:
   - `python ml/scripts/train_forecasting.py`
   - Trains ML regression models and generates 30-day out-of-sample projections.

4. **Unified Prediction & Inference CLI**:
   - `python ml/scripts/predict.py --summary`
   - `python ml/scripts/predict.py --station PS0069`
   - `python ml/scripts/predict.py --lat 12.97 --lon 77.59`
   - `python ml/scripts/predict.py --forecast_days 14`

5. **Frontend Dataset Exporter**:
   - `python ml/scripts/export_ml_to_frontend.py`
   - Exports generated ML output CSVs into structured JSON datasets under `frontend/public/data/`.
