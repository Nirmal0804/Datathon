# Crime Analytics Backend

AI-Driven Crime Analytics & Visualization Platform backend for Karnataka Police.

## Prerequisites

- Python 3.11+

## Setup

```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Linux / macOS
.venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env
```

## Running the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`.

Interactive docs are available at `http://localhost:8000/docs`.

## Running Tests

```bash
pytest tests/ -v
```

## Environment Variables

See `.env.example` for available configuration. All settings have safe defaults for local development.

Do not commit `.env` or any file containing real credentials.

## Project Structure

```text
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API route definitions
│   ├── services/            # Business logic / orchestration
│   ├── models/              # Database/domain entity definitions
│   ├── schemas/             # Pydantic API contracts
│   ├── analytics/           # Analytics and ML integration adapters
│   ├── database/
│   │   └── repositories/    # Data access layer
│   ├── core/
│   │   └── config.py        # Typed application configuration
│   └── utils/               # Generic helpers
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```
