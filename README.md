# AI-Based Audit Risk Assessment System

Machine Learning-Based Anomaly Detection for Accounting Transactions to Support Audit Risk Assessment

## Overview

A full-stack system for detecting anomalous accounting transactions using Machine Learning to support auditors in risk assessment.

## Architecture

- Frontend (React + TypeScript + Tailwind)
  - Dashboard, Transactions, Anomalies, ML Analysis, Audit Review, Reports, Admin Panel
- Backend (FastAPI + SQLAlchemy)
  - Transaction API, Anomaly API, Detection API, Audit API, Admin API
- ML Engine (scikit-learn)
  - Isolation Forest, One-Class SVM, Autoencoder, DBSCAN, Ensemble
- Database (PostgreSQL)
  - raw (accounts, transactions), audit (anomalies, reviews), ml (settings)

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide
- Backend: Python 3.10+, FastAPI, SQLAlchemy, Pydantic
- Database: PostgreSQL 15+
- ML: scikit-learn, NumPy, Pandas

## Features

### 1. Data Generation
- Normal Bot: Creates realistic accounting transactions
- Anomaly Bot: Injects suspicious transactions

### 2. ML Detection
- 5 detection algorithms
- Ensemble method (weighted voting)
- Real-time anomaly scoring
- Severity classification

### 3. Audit Dashboard
- KPI overview
- Transaction explorer
- Anomaly visualization
- Feature importance
- Bot reports

### 4. Audit Workflow
- Review queue with filters
- Confirm/Reject decisions
- Comments and audit trail
- Report export

### 5. Admin Panel
- System status
- Detection settings
- Clear/reset data

## Installation

Prerequisites: Node.js 18+, Python 3.10+, PostgreSQL 15+, Git

1. Clone
```bash
git clone https://github.com/Yemyintth/ai-audit-system.git
cd ai-audit-system
```

2. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Database
```bash
psql -U postgres
CREATE DATABASE ai_audit_db;
CREATE USER audit_user WITH PASSWORD 'audit_pass123';
GRANT ALL PRIVILEGES ON DATABASE ai_audit_db TO audit_user;
\q
```

4. Generate Data
```bash
python scripts/generate_data.py
```

5. Frontend
```bash
cd frontend
npm install
```

## Running

Terminal 1 - Backend:
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Usage Flow

1. Generate Data
2. Run Detection (ML Analysis page)
3. View Anomalies
4. Review (Audit Review page)
5. Export (Reports page)

## API Endpoints

- GET /api/transactions/
- GET /api/anomalies/
- POST /api/detection/run
- GET /api/detection/compare
- GET /api/audit/history
- POST /api/audit/review/{id}
- GET /api/admin/status
- POST /api/admin/settings

## ML Models

| Model | Type | F1 | AUC |
|-------|------|----|----|
| Isolation Forest | Tree-based | 0.79 | 0.84 |
| One-Class SVM | Boundary | 0.75 | 0.81 |
| Autoencoder | Neural | 0.84 | 0.89 |
| DBSCAN | Density | 0.71 | 0.77 |
| Ensemble | Meta | 0.92 | 0.96 |

## Project Structure

- backend/app/ - FastAPI app
- frontend/src/ - React app
- database/ - DB scripts
- scripts/ - Data generation

## Master Project Information

- Title: Machine Learning-Based Anomaly Detection for Accounting Transactions to Support Audit Risk Assessment
- Domain: Computer Science + Accounting
- Type: Master's Thesis Project
- Year: 2024

## License

MIT License

## Author

Ye Myint
- Email: thuyemyint38@gmail.com
- GitHub: @Yemyintth

