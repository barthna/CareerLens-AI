# CareerLens AI

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-emerald?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-compose-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)

**Understand your resume. Match smarter. Get hired faster.**

CareerLens AI is a production-grade full-stack SaaS application helping job seekers evaluate resume structures, scan ATS keyword alignment, compare profiles against technical job descriptions, identify missing skills with structured learning paths, and prepare tailored interview answers using AI.

---

## Key Features

- **ATS Score Engine**: Instantly clean and parse PDF/DOCX layouts, returning scoring metrics across keyword density, skills alignment, and structural integrity.
- **Job Description Matcher**: Paste target job specs to receive compatibility analysis, responsibilities fit ratios, and recommendations.
- **AI-Powered Suggested Rewrites**: In-line experience rewrite recommendations comparing current wording with metric-driven, action-focused equivalents.
- **Personalized Interview Planner**: Formulate potential interview topics, sample questions, and strategy answers custom-tuned to candidate experiences.
- **Tenant Resource Isolation**: Strict database scoping guarantees one user's uploads/analyses are never visible to another.
- **Flexible AI Integration**: Works with live Gemini API keys or fallback mock analytics handlers for zero-config test drives.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts (Analytics), Framer Motion (Animations), Lucide React.
- **Backend**: FastAPI, Python 3.11, Pydantic, SQLAlchemy.
- **Database**: PostgreSQL (Production) / SQLite (Local Test/Dev Fallback).
- **Authentication**: JWT token-based authentication (Access & Refresh cycles), secure password hashing.
- **Infrastructure**: Docker Multi-Stage containers, Docker Compose, GitHub Actions CI.

---

## Directory Architecture

```text
careerlens-ai/
├── frontend/             # Next.js 15 App Router codebase
│   ├── app/              # Auth, Onboarding, and Dashboard route pages
│   ├── components/       # UI charts, Toast alerts, navigation shells
│   └── lib/              # api.ts connection service wrapper
├── backend/              # FastAPI Python codebase
│   ├── app/
│   │   ├── api/          # Routers (auth, resumes, jobs, dashboard)
│   │   ├── core/         # config.py, database.py, security.py
│   │   ├── models/       # SQLAlchemy relational tables
│   │   ├── schemas/      # Pydantic input validators
│   │   ├── services/     # parser.py, storage.py, ai_service.py
│   │   └── main.py       # FastAPI Entrypoint
│   ├── tests/            # pytest isolation/security test suites
│   └── requirements.txt
├── docker-compose.yml    # Main container orchestrator
└── README.md
```

---

## Getting Started

### Method A: Running with Docker (Recommended)

1. Clone the repository.
2. Spin up all services:
   ```bash
   docker compose up --build
   ```
3. Access the frontend at `http://localhost:3000` and the API docs at `http://localhost:8000/docs`.

### Method B: Running Locally

#### 1. Database Setup
Make sure PostgreSQL is running and update `DATABASE_URL` in `.env` files. If you want a quick run without configuring PostgreSQL, our backend automatically defaults to local SQLite files.

#### 2. Backend Server
```bash
cd backend
python -m venv venv
# Activate on Windows:
.\venv\Scripts\activate
# Activate on macOS/Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Start local server:
uvicorn app.main:app --reload
```

#### 3. Frontend Development Server
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:3000` to access the interface.

---

## Testing & Security

We enforce unit tests verifying resource access scopes (User A must never retrieve or edit User B's resources).

To execute tests:
```bash
cd backend
pytest
```

---

## License

Distributed under the MIT License. See `LICENSE` for more details.
