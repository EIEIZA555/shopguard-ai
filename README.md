# ShopGuard AI

E-Commerce platform with AI-powered test failure analysis — built to showcase **Full-Stack Development**, **QA Automation (Playwright)**, and **AI/RAG Integration** for resume/portfolio.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  React UI   │────▶│  FastAPI     │────▶│  SQL Server │
│  Tailwind   │     │  Python      │     │  + SPs      │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │  ChromaDB    │
                    │  + Gemini    │
                    └──────────────┘
                           ▲
                    ┌──────┴───────┐
                    │  Playwright  │
                    │  E2E Suite   │
                    └──────────────┘
```

## Quick Start (Local Dev)

### Prerequisites
- Python 3.11+
- Node.js 20+
- (Optional) Docker Desktop for full stack

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

### 3. E2E Tests

```bash
# Start backend + frontend first, then:
cd tests/e2e
npm install
npx playwright install chromium
npm test
```

### Docker (Full Stack)

```bash
docker compose up --build
```

## Demo Accounts

| Role     | Email                    | Password   |
|----------|--------------------------|------------|
| Customer | customer@shopguard.dev   | Test123!   |
| Admin    | admin@shopguard.dev      | Admin123!  |

## Project Structure

```
shopguard-ai/
├── backend/           # FastAPI — auth, products, orders, test-runs, AI analyzer
│   ├── app/
│   │   ├── ai/        # RAG failure analyzer (LangChain + ChromaDB + Gemini)
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   └── models/    # SQLAlchemy ORM
│   ├── sql/           # Stored Procedures
│   └── tests/unit/    # pytest
├── frontend/          # React + Tailwind — shop, cart, admin test dashboard
├── tests/e2e/         # Playwright E2E specs (12+ tests)
├── azure-pipelines.yml
└── docker-compose.yml
```

## Key Features

- **E-Commerce Core** — product catalog, cart, checkout with inventory validation
- **JWT Auth + RBAC** — customer vs admin roles
- **QA Test Dashboard** — view Playwright run results, flaky scores
- **AI Failure Analyzer** — RAG over historical failures + Gemini root-cause analysis
- **CI/CD** — Azure DevOps pipeline with parallel Playwright shards + AI analysis on failure
- **SQL Stored Procedures** — `sp_ProcessCheckout`, `sp_GetTestRunStats`, etc.

## Resume Bullet Points

- Engineered a full-stack e-commerce platform (React + FastAPI + SQL) with 12+ Playwright E2E tests covering checkout, auth, and RBAC flows.
- Implemented an AI-powered test failure analyzer using LangChain, ChromaDB, and Gemini API, reducing debug time via RAG-based root-cause suggestions.
- Automated CI/CD quality gates in Azure DevOps with parallel Playwright shards, retry policy, and pipeline-blocking on regression.

## Environment Variables

| Variable         | Description                    | Default              |
|------------------|--------------------------------|----------------------|
| `GEMINI_API_KEY` | Google Gemini API key          | (required for AI)    |
| `JWT_SECRET`     | JWT signing secret             | dev-secret           |
| `DATABASE_URL`   | SQLAlchemy connection string   | sqlite local         |
| `CHROMA_HOST`    | ChromaDB host                  | localhost            |

See [docs/ROADMAP.md](docs/ROADMAP.md) for the 30-day MVP plan.
