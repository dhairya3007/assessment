# OnePrism CSV Data Import Dashboard

Technical assessment submission. This is a full-stack web application designed to handle CSV customer record imports. It allows users to upload files, validates the data in the background, checks for duplicate emails, and then presents the results in a clean, paginated dashboard.

## 🔗 Submission Links

- **Repository Link:** https://github.com/dhairya3007/assessment
- **Deployed Application:** Not yet deployed (built for local review).

---

## 🚀 Setup Instructions

You'll need Node.js and Python 3.10+ installed on your machine.

### 1. Start the Backend (FastAPI)

Open a terminal, navigate to the `backend` folder, and set up a virtual environment:

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
The API will spin up on `http://localhost:8000`. 

### 2. Start the Frontend (React + Vite)

Open a **second terminal window**, navigate to the `frontend` folder, and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```
The React app should now be running at `http://localhost:5173`. *(Make sure the backend is running first!)*

---

## 🧪 Sample CSV Files for Testing

I've included a few sample CSV files in the root of the repository so you can test the validation logic easily:

- **`sample_data.csv`**: A standard mix of valid and invalid rows.
- **`sample_duplicates.csv`**: Tests the deduplication logic (first email is valid, subsequent matches are flagged).
- **`sample_missing_fields.csv`**: Tests validation for required fields like Name and Company.
- **`sample_mixed_errors.csv`**: A combination of various edge cases in one file.

---

## 💡 Explanation of Important Technical Decisions

### 1. Asynchronous Background Processing
To keep the application responsive during large file uploads, the CSV processing is handled asynchronously using FastAPI's `BackgroundTasks`. When a file is uploaded, the server saves it, creates a "Pending" job in the database, and returns the Job ID immediately. The frontend then polls until processing completes. 

### 2. Validation with Pydantic
Instead of writing messy manual string checks, I used Pydantic (with `email-validator`) to declare a strict schema for every row. If a row is malformed, Pydantic catches it immediately, ensuring bad data never reaches the persistent database without being flagged.

### 3. Batched Database Writes
All database insertions are batched to handle large files efficiently and prevent memory overload. I used SQLite for this assessment for simplicity and zero setup, but the ORM (SQLAlchemy) allows an easy swap to PostgreSQL for production.

---

## ⚠️ Incomplete Features & Known Limitations

- **Real-time Updates:** Currently, the frontend uses HTTP polling (fetching job status every 2 seconds). In a production environment, I would implement WebSockets or Server-Sent Events (SSE) to push progress updates to the client.
- **Message Broker:** BackgroundTasks run in the same memory space as the API. For a real-world application, I would offload this to Celery and Redis to ensure jobs persist across server restarts.
- **Automated Testing:** Due to the timebox, there are no automated unit tests (e.g., `pytest` or `jest`). Validation was primarily tested manually using the provided sample CSVs.
