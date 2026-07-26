@echo off
REM Karnataka Police Crime Analytics - Helper Launcher Script
set SCRIPT_DIR=%~dp0
set PYTHON=%SCRIPT_DIR%..\venv\Scripts\python.exe
if not exist "%PYTHON%" set PYTHON=python

if "%1"=="" (
    echo Usage: run_ml.bat [script_name] [args]
    echo Example: run_ml.bat scripts/train_dbscan.py
    echo Example: run_ml.bat scripts/predict.py --summary
    exit /b 1
)

"%PYTHON%" %*
