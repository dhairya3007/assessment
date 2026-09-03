# CSV Data Import Dashboard

Hey! Thanks for checking out my submission for the technical assessment. 

This is a full-stack web application designed to handle CSV customer record imports. It allows users to upload files, validates the data in the background, checks for duplicate emails, and then presents the results in a clean, paginated dashboard. 

You can view the code at: https://github.com/dhairya3007/assessment
*(Not currently deployed to a live URL, so please run it locally!)*

---

## 🛠️ Built With

- **Frontend:** React, TypeScript, and Vite. I kept the UI styling clean and modern using vanilla CSS variables.
- **Backend:** FastAPI (Python). 
- **Database:** SQLite with SQLAlchemy ORM.
- **Validation:** Pydantic (specifically leveraging email-validator for RFC-compliant email checks).

---

## 🚀 How to Run Locally

You'll need Node.js and Python 3.10+ installed on your machine.

### 1. Start the Backend

Open a terminal, navigate to the ackend folder, and set up a virtual environment:

`ash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
`
The API will spin up on http://localhost:8000. You can check out the auto-generated Swagger docs at http://localhost:8000/docs.

### 2. Start the Frontend

Open a **second terminal window**, navigate to the rontend folder, and start the Vite dev server:

`ash
cd frontend
npm install
npm run dev
`
The React app should now be running at http://localhost:5173. 

*(Make sure the backend is running first, otherwise the frontend won't be able to fetch or submit any data!)*

---

## 🧪 Testing it out

I've included a few sample CSV files in the root of the repository so you can test the validation logic without having to make your own files:

- sample_data.csv: A standard mix of valid and invalid rows.
- sample_duplicates.csv: Tests the deduplication logic (the first email is marked valid, and any subsequent matches are flagged as duplicates).
- sample_missing_fields.csv: Tests validation for required fields like Name and Company.
- sample_mixed_errors.csv: A combination of various edge cases all in one file.

## 💡 A Quick Note on Architecture

To keep the application responsive during large file uploads, the CSV processing is handled asynchronously using FastAPI's BackgroundTasks. When you upload a file, the server immediately saves it, creates a "Pending" job in the database, and returns the Job ID to the frontend. The React app then polls the backend until the processing is complete.

I used SQLite for simplicity to make it easy for you to run locally without installing Postgres or Docker, but all database interactions are batched to handle large files efficiently. 
