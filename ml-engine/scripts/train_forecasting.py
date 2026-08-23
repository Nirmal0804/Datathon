import os
from pathlib import Path
import time
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Try importing xgboost dynamically
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

ML_DIR = Path(__file__).resolve().parent.parent
DEFAULT_INPUT_PATH = ML_DIR / "datasets" / "firs.csv"
DEFAULT_OUTPUT_FORECAST_PATH = ML_DIR / "outputs" / "crime_forecasts.csv"
DEFAULT_MODEL_OUTPUT_PATH = ML_DIR / "models" / "crime_forecasting_model.joblib"
DEFAULT_PLOT_ACTUAL_PATH = ML_DIR / "outputs" / "forecast_actual_vs_predicted.png"
DEFAULT_PLOT_IMPORTANCE_PATH = ML_DIR / "outputs" / "forecast_feature_importance.png"
DEFAULT_PLOT_PROJECTION_PATH = ML_DIR / "outputs" / "forecast_30day_projection.png"

def train_and_benchmark_forecasting(
    input_path=DEFAULT_INPUT_PATH,
    output_forecast_path=DEFAULT_OUTPUT_FORECAST_PATH,
    model_output_path=DEFAULT_MODEL_OUTPUT_PATH,
    plot_actual_path=DEFAULT_PLOT_ACTUAL_PATH,
    plot_importance_path=DEFAULT_PLOT_IMPORTANCE_PATH,
    plot_projection_path=DEFAULT_PLOT_PROJECTION_PATH
):
    input_path = Path(input_path)
    output_forecast_path = Path(output_forecast_path)
    model_output_path = Path(model_output_path)
    plot_actual_path = Path(plot_actual_path)
    plot_importance_path = Path(plot_importance_path)
    plot_projection_path = Path(plot_projection_path)

    print("=" * 65)
    print("STARTING MODULE 3: TIME-SERIES FORECASTING BENCHMARKING PIPELINE")
    print("=" * 65)

    # 1. Load Data & Aggregate Daily Counts
    print("[1/6] Loading FIR dataset and aggregating daily incident time series...")
    firs = pd.read_csv(input_path)
    firs['Incident_Date'] = pd.to_datetime(firs['Incident_Date'], errors='coerce')
    firs['Date'] = firs['Incident_Date'].dt.date

    daily = firs.groupby('Date').size().rename('Incident_Count').to_frame()

    # Reindex to full date range (365 days)
    min_date = daily.index.min()
    max_date = daily.index.max()
    full_idx = pd.date_range(start=min_date, end=max_date, freq='D').date
    daily = daily.reindex(full_idx, fill_value=0).reset_index()
    daily.columns = ['Date', 'Incident_Count']
    daily['Date'] = pd.to_datetime(daily['Date'])

    print(f"      Time series range: {daily['Date'].min().strftime('%Y-%m-%d')} to {daily['Date'].max().strftime('%Y-%m-%d')} ({len(daily)} days).")

    # 2. Feature Engineering
    print("[2/6] Engineering calendar, lag, and rolling statistics features...")
    df = daily.copy()
    
    # Calendar features
    df['Day_of_Week'] = df['Date'].dt.dayofweek
    df['Day_of_Month'] = df['Date'].dt.day
    df['Month'] = df['Date'].dt.month
    df['Quarter'] = df['Date'].dt.quarter
    df['Is_Weekend'] = df['Day_of_Week'].isin([5, 6]).astype(int)

    # Autoregressive Lags
    df['Lag_1'] = df['Incident_Count'].shift(1)
    df['Lag_7'] = df['Incident_Count'].shift(7)
    df['Lag_14'] = df['Incident_Count'].shift(14)

    # Rolling window statistics (shifted by 1 to prevent target leakage)
    df['Rolling_Mean_7'] = df['Incident_Count'].shift(1).rolling(window=7, min_periods=1).mean()
    df['Rolling_Mean_30'] = df['Incident_Count'].shift(1).rolling(window=30, min_periods=1).mean()
    df['Rolling_Std_7'] = df['Incident_Count'].shift(1).rolling(window=7, min_periods=1).std().fillna(0)

    # Drop initial rows with NaNs from shifting lags
    df_clean = df.dropna().reset_index(drop=True)
    feature_cols = [
        'Day_of_Week', 'Day_of_Month', 'Month', 'Quarter', 'Is_Weekend',
        'Lag_1', 'Lag_7', 'Lag_14', 'Rolling_Mean_7', 'Rolling_Mean_30', 'Rolling_Std_7'
    ]

    X = df_clean[feature_cols]
    y = df_clean['Incident_Count']

    # 3. Chronological Train-Test Split (80% Train, 20% Test)
    split_idx = int(len(df_clean) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    test_dates = df_clean['Date'].iloc[split_idx:]

    print(f"      Train size: {len(X_train)} days | Test size: {len(X_test)} days.")

    # 4. Model Candidates Definition
    candidates = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=42)
    }

    if HAS_XGBOOST:
        candidates["XGBoost"] = xgb.XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42)

    # 5. Model Benchmarking Execution
    print("[3/6] Running model benchmark tournament...")
    results = []

    for name, model in candidates.items():
        # Measure Training Time
        t0 = time.time()
        model.fit(X_train, y_train)
        t_train = time.time() - t0

        # Measure Prediction Time
        t1 = time.time()
        preds = model.predict(X_test)
        t_pred = time.time() - t1

        # Metrics
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)

        results.append({
            'Model': name,
            'MAE': mae,
            'RMSE': rmse,
            'R2_Score': r2,
            'Train_Time_Sec': round(t_train, 4),
            'Pred_Time_Sec': round(t_pred, 6),
            'fitted_model': model,
            'test_preds': preds
        })

    results_df = pd.DataFrame(results).sort_values(by='MAE', ascending=True).reset_index(drop=True)

    print("\n" + "=" * 65)
    print("MODEL BENCHMARK RESULTS (RANKED BY LOWEST MAE):")
    print("=" * 65)
    display_df = results_df[['Model', 'MAE', 'RMSE', 'R2_Score', 'Train_Time_Sec', 'Pred_Time_Sec']].copy()
    display_df['MAE'] = display_df['MAE'].round(3)
    display_df['RMSE'] = display_df['RMSE'].round(3)
    display_df['R2_Score'] = display_df['R2_Score'].round(3)
    print(display_df.to_string(index=False))
    print("=" * 65)

    # Automatic Selection of Best Model
    best_row = results_df.iloc[0]
    best_model_name = best_row['Model']
    best_model = best_row['fitted_model']
    best_preds = best_row['test_preds']
    print(f"\n[SELECTED WINNING MODEL]: {best_model_name}")

    # Retrain Best Model on full dataset for out-of-sample forecasting
    print(f"[4/6] Retraining selected {best_model_name} model on full dataset...")
    best_model.fit(X, y)

    # 6. Generate 30-Day Forward Forecast
    print("[5/6] Generating 30-day forward recursive out-of-sample forecast...")
    last_date = df['Date'].max()
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=30, freq='D')
    
    # Recursive Forecasting loop
    history_df = df.copy()
    future_records = []

    for f_date in future_dates:
        dow = f_date.dayofweek
        dom = f_date.day
        month = f_date.month
        quarter = f_date.quarter
        is_weekend = 1 if dow in [5, 6] else 0

        lag_1 = history_df['Incident_Count'].iloc[-1]
        lag_7 = history_df['Incident_Count'].iloc[-7] if len(history_df) >= 7 else lag_1
        lag_14 = history_df['Incident_Count'].iloc[-14] if len(history_df) >= 14 else lag_1

        roll_7 = history_df['Incident_Count'].iloc[-7:].mean()
        roll_30 = history_df['Incident_Count'].iloc[-30:].mean()
        roll_std_7 = history_df['Incident_Count'].iloc[-7:].std() if len(history_df) >= 7 else 0.0

        feat_dict = {
            'Day_of_Week': dow,
            'Day_of_Month': dom,
            'Month': month,
            'Quarter': quarter,
            'Is_Weekend': is_weekend,
            'Lag_1': lag_1,
            'Lag_7': lag_7,
            'Lag_14': lag_14,
            'Rolling_Mean_7': roll_7,
            'Rolling_Mean_30': roll_30,
            'Rolling_Std_7': np.nan_to_num(roll_std_7)
        }

        X_f = pd.DataFrame([feat_dict])[feature_cols]
        pred_val = max(0.0, float(best_model.predict(X_f)[0]))

        # Append to history for next recursive step
        new_row = feat_dict.copy()
        new_row['Date'] = f_date
        new_row['Incident_Count'] = pred_val
        history_df = pd.concat([history_df, pd.DataFrame([new_row])], ignore_index=True)

        future_records.append({
            'Date': f_date.strftime('%Y-%m-%d'),
            'Forecasted_Crime_Count': round(pred_val, 2),
            'Forecast_Day': len(future_records) + 1,
            'Day_of_Week': f_date.strftime('%A')
        })

    forecast_df = pd.DataFrame(future_records)

    # 7. Plotting & Persistence
    print("[6/6] Generating visualization plots and saving artifacts...")
    output_forecast_path.parent.mkdir(parents=True, exist_ok=True)
    model_output_path.parent.mkdir(parents=True, exist_ok=True)

    forecast_df.to_csv(output_forecast_path, index=False)

    model_artifact = {
        'best_model': best_model,
        'model_name': best_model_name,
        'feature_cols': feature_cols,
        'benchmark_results': display_df.to_dict(orient='records'),
        'evaluation_metrics': {
            'MAE': round(best_row['MAE'], 3),
            'RMSE': round(best_row['RMSE'], 3),
            'R2_Score': round(best_row['R2_Score'], 3)
        }
    }
    joblib.dump(model_artifact, model_output_path)

    # Plot 1: Actual vs Predicted (Test Split)
    plt.figure(figsize=(10, 5))
    plt.plot(test_dates, y_test, label='Actual Daily Crimes', color='#1f77b4', linewidth=2)
    plt.plot(test_dates, best_preds, label=f'Predicted ({best_model_name})', color='#ff7f0e', linestyle='--', linewidth=2)
    plt.title(f'Module 3: Actual vs Predicted Daily Crime Count ({best_model_name})', fontsize=12, fontweight='bold')
    plt.xlabel('Date')
    plt.ylabel('Incident Count')
    plt.legend()
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(plot_actual_path, dpi=300)
    plt.close()

    # Plot 2: Feature Importance (if tree-based or coefficients if linear)
    plt.figure(figsize=(10, 5))
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        indices = np.argsort(importances)
        plt.barh([feature_cols[i] for i in indices], importances[indices], color='#2ca02c')
        plt.title(f'Feature Importances ({best_model_name})', fontsize=12, fontweight='bold')
        plt.xlabel('Relative Importance')
    elif hasattr(best_model, 'coef_'):
        coefs = np.abs(best_model.coef_)
        indices = np.argsort(coefs)
        plt.barh([feature_cols[i] for i in indices], coefs[indices], color='#d62728')
        plt.title('Absolute Coefficient Weight (Linear Regression)', fontsize=12, fontweight='bold')
        plt.xlabel('Magnitude')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(plot_importance_path, dpi=300)
    plt.close()

    # Plot 3: 30-Day Forward Projection
    plt.figure(figsize=(10, 5))
    hist_tail = daily.tail(60)
    plt.plot(hist_tail['Date'], hist_tail['Incident_Count'], label='Historical (Last 60 Days)', color='#1f77b4', linewidth=2)
    plt.plot(future_dates, forecast_df['Forecasted_Crime_Count'], label='30-Day Out-of-Sample Forecast', color='#d62728', linestyle='--', marker='o', markersize=4)
    plt.title(f'Karnataka Police 30-Day Crime Volume Forecast ({best_model_name})', fontsize=12, fontweight='bold')
    plt.xlabel('Date')
    plt.ylabel('Daily Crime Volume')
    plt.legend()
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(plot_projection_path, dpi=300)
    plt.close()

    print("\nSUCCESS: Module 3 Model Benchmarking & Forecasting Completed.")
    print("=" * 65)

if __name__ == "__main__":
    train_and_benchmark_forecasting()
