# CSV Import Dashboard

A full-stack application built for importing, validating, and reviewing customer records from CSV files. 

**Submission Links:**
- **Repository:** https://github.com/dhairya3007/assessment
- **Deployed Application:** Not yet deployed

---

## Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Backend:** FastAPI, Python
- **Database:** SQLite (via SQLAlchemy)
- **Data Validation:** Pydantic

## Getting Started

### 1. Backend Setup
Navigate to the `backend` directory and set up a virtual environment:

```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
In a new terminal, navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

> **Note:** Ensure the backend is running before using the frontend application, as it depends on the API at `localhost:8000`.

## Testing the Application
Several sample CSV files are included in the root directory to help test the validation engine:
- `sample_data.csv`: A general mix of valid and invalid rows.
- `sample_duplicates.csv`: Tests the deduplication logic (first email is valid, subsequent matches are flagged).
- `sample_missing_fields.csv`: Tests validation for required fields (Name, Company, Email).
- `sample_mixed_errors.csv`: A combination of various edge cases.

## Key Features
- **Asynchronous Processing:** CSV processing is handled in the background to avoid blocking the API.
- **Robust Validation:** Pydantic enforces strict type and format checking on every row.
- **Pagination & Filtering:** The UI handles large datasets efficiently through server-side pagination, search, and filtering.
