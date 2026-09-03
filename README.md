# OnePrism CSV Data Import Dashboard

A full-stack application for uploading, validating, and reviewing CSV customer records - built with **React + TypeScript**, **FastAPI**, and **SQLite**.

**Submission Links:**
- **Repository:** https://github.com/dhairya3007/assessment
- **Deployed Application:** Not yet deployed

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | FastAPI, Python 3.10+ |
| Database | SQLite via SQLAlchemy ORM |
| Validation | Pydantic v2, email-validator |

---

## Project Structure

`	ext
assisment/
+-- backend/              # FastAPI application
    +-- main.py           # API routes and request handling
    +-- services.py       # CSV processing and validation logic
    +-- models.py         # SQLAlchemy ORM models
    +-- schemas.py        # Pydantic request/response schemas
    +-- database.py       # DB engine, session factory
    +-- requirements.txt  # Python dependencies
+-- frontend/             # React + Vite application
    +-- src/
        +-- pages/        # UploadPage, ResultsPage, HistoryPage
        +-- components/   # Layout component
        +-- lib/api.ts    # API client
+-- sample_data.csv             # Mixed valid/invalid rows
+-- sample_duplicates.csv       # Duplicate email test data
+-- sample_missing_fields.csv   # Missing name/company test data
+-- sample_mixed_errors.csv     # All error types combined
+-- README.md
`

---

## Setup & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

---

### 1. Backend (FastAPI)

`ash
cd backend

python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
`

- **API Base URL:** http://localhost:8000
- **Interactive Docs (Swagger):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

### 2. Frontend (React)

`ash
cd frontend
npm install
npm run dev
`

- **App URL:** http://localhost:5173

> **Important:** Start the backend before the frontend. The frontend calls http://localhost:8000.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /imports | Upload a CSV file; returns a job ID immediately |
| GET | /imports | List all import jobs (most recent first) |
| GET | /imports/{job_id} | Get status and counts for a specific job |
| GET | /imports/{job_id}/records | Paginated records with filter and search |
| GET | /imports/{job_id}/download | Download valid records as CSV |

### Records Query Parameters

| Param | Default | Description |
|-------|---------|-------------|
| page | 1 | Page number |
| limit | 50 | Records per page |
| filter | all | all, valid, invalid, duplicate |
| search | (none) | Searches name, email, company, city |

---

## Validation Rules

| Field | Rule |
|-------|------|
| name | Required, must not be blank |
| company | Required, must not be blank |
| email | Required, valid format (RFC-compliant via email-validator) |
| phone | Optional. If present, must contain 10-15 digits |
| Duplicates | First occurrence of a unique email = valid. Later matches = duplicate |
| Malformed rows | Rows with missing columns flagged as invalid |

---

## Architecture & Design Decisions

### Async Processing with BackgroundTasks
CSV processing runs in a background task via FastAPI BackgroundTasks, avoiding blocking the HTTP request thread while staying simple enough for this scope. A production system would use Celery + Redis.

### Batched DB Writes
Records are inserted in batches of 500 rows to avoid loading the full file into memory before committing.

### Server-side Pagination & Search
/records uses SQL LIMIT/OFFSET with JSON_EXTRACT for field-level search. Records are never fetched all at once.

### SQLite
Zero-setup persistence. A production system would use PostgreSQL.

### Error Handling Strategy
- HTTP errors: Raised as APIException with a structured { detail, error_code } body.
- Processing errors: Caught inside the background task; job is marked as failed with an error_message.
- DB failures mid-import: Wrapped in try/except/finally - the session is always closed and the job is marked failed on any exception.

---

## Sample Test Files

| File | What it tests |
|------|--------------|
| sample_data.csv | Mix of valid and invalid records |
| sample_duplicates.csv | Same email appearing multiple times |
| sample_missing_fields.csv | Rows with blank name, email, or company |
| sample_mixed_errors.csv | All error types in one file |
| sample_large_valid.csv | All valid records for performance testing |

---

## Known Limitations

- No authentication or user accounts.
- Real-time progress via WebSockets was skipped (polling used instead).
- No UI for editing invalid records inline.
- Unit/integration tests were not written within the timebox.
