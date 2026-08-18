<h1 align="center">🔍 CareerLens AI</h1>

<p align="center">
  <strong>Understand your resume. Match smarter. Get hired faster.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15+-000000?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-20232a?style=flat&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-compose-2496ED?style=flat&logo=docker" alt="Docker" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Directory Structure](#-architecture--directory-structure)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Method A: Run with Docker (Recommended)](#method-a-running-with-docker-recommended)
  - [Method B: Running Locally](#method-b-running-locally)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security & Multi-Tenancy](#-security--multi-tenancy)

---

## 🌟 Overview

**CareerLens AI** is a production-grade, full-stack SaaS application built to empower job seekers in a highly competitive market. By leveraging advanced parsing algorithms and artificial intelligence, the platform helps users optimize their resumes for Applicant Tracking Systems (ATS), target specific job descriptions, and prepare tailored interview answers.

---

## ✨ Key Features

- **📊 ATS Score Engine**: Instantly parses PDF/DOCX layouts, returning scoring metrics across keyword density, skills alignment, and structural integrity.
- **🎯 Job Description Matcher**: Compare your profile against target job specifications to receive detailed compatibility analysis, responsibilities fit ratios, and recommendations.
- **✍️ AI-Powered Suggested Rewrites**: In-line experience rewrite recommendations comparing current wording with metric-driven, action-focused equivalents.
- **💬 Personalized Interview Planner**: Formulate potential interview topics, sample questions, and strategy answers custom-tuned to candidate experiences.
- **🛡️ Tenant Resource Isolation**: Strict database scoping guarantees one user's uploads/analyses are never visible to another.
- **🔌 Flexible AI Integration**: Works with live Gemini API keys or fallback mock analytics handlers for zero-config test drives.

---

## 🏗️ Architecture & Directory Structure

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

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15 (App Router)** | Modern React framework for performance, routing, and SSR |
| | **TypeScript** | Type safety and enhanced developer experience |
| | **Tailwind CSS** | Sleek, modern utility-first styling |
| | **Framer Motion** | Premium micro-interactions and smooth transitions |
| | **Recharts** | Interactive and responsive analytics graphs |
| **Backend** | **FastAPI** | High-performance Python web framework for APIs |
| | **SQLAlchemy** | SQL Toolkit and Object-Relational Mapper (ORM) |
| | **Pydantic** | Fast data validation and serialization |
| **Database** | **PostgreSQL** | Production-grade relational database |
| | **SQLite** | Local dev fallback for zero-config startup |
| **DevOps** | **Docker & Docker Compose** | Containerized builds and multi-service orchestration |

---

## 🚀 Getting Started

### Method A: Running with Docker (Recommended)

1. Clone the repository.
2. Spin up all services:
   ```bash
   docker compose up --build
   ```
3. Access the services:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Method B: Running Locally

#### 1. Database Setup
Make sure PostgreSQL is running and update `DATABASE_URL` in `.env` files. If you want a quick run without configuring PostgreSQL, the backend automatically defaults to local SQLite files.

#### 2. Backend Server
```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
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

# Start development server:
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the interface.

---

## 🧪 Testing & Quality Assurance

We enforce robust unit tests verifying resource access scopes to ensure absolute security and correct system behaviors.

To execute tests:
```bash
cd backend
pytest
```

---

## 🔒 Security & Multi-Tenancy

- **Token Isolation**: Uses JWT token-based authentication (Access & Refresh cycles) with secure password hashing.
- **Resource Scoping**: Strict row-level scoping guarantees that User A can never retrieve, edit, or access User B's resumes, jobs, or suggestions.
