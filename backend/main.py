import csv
import io
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Depends, HTTPException, Request, status, Query
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import String, or_, func

import models
import schemas
import services
from database import SessionLocal, engine, get_db

# Ensure all database tables are created
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OnePrism CSV Import API",
    description="API for importing and validating customer data from CSV files.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback exception handler for unhandled server errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "error_code": "INTERNAL_ERROR"},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler for FastAPI request validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc), "error_code": "VALIDATION_ERROR"},
    )

class APIException(HTTPException):
    """Custom API exception to include standard error codes."""
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code

@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    """Handler for custom API exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": exc.error_code},
    )

@app.post(
    "/imports", 
    status_code=status.HTTP_202_ACCEPTED, 
    response_model=schemas.JobBase,
    summary="Upload a CSV file for import"
)
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Accepts a CSV file upload, creates a new ImportJob, and spawns a background task
    to process and validate the records.
    
    - Validates file extension
    - Validates file size (max 10MB)
    - Returns the initial job status (pending)
    """
    if not file.filename.endswith(".csv"):
        raise APIException(status_code=400, detail="Invalid file type. Only CSV allowed.", error_code="INVALID_FILE_TYPE")
    
    file_content = await file.read()
    if len(file_content) == 0:
        raise APIException(status_code=400, detail="File is empty.", error_code="EMPTY_FILE")
        
    if len(file_content) > 10 * 1024 * 1024:
        raise APIException(status_code=413, detail="File too large (max 10MB).", error_code="FILE_TOO_LARGE")
        
    job = models.ImportJob(filename=file.filename)
    db.add(job)
    db.commit()
    db.refresh(job)
    
    background_tasks.add_task(services.process_csv_file, str(job.id), file_content)
    
    return job

@app.get(
    "/imports", 
    response_model=list[schemas.JobBase],
    summary="List all import jobs"
)
def list_imports(db: Session = Depends(get_db)):
    """Returns a list of all import jobs, ordered by creation date descending."""
    jobs = db.query(models.ImportJob).order_by(models.ImportJob.created_at.desc()).all()
    return jobs

@app.get(
    "/imports/{job_id}", 
    response_model=schemas.JobBase,
    summary="Get import job details"
)
def get_import(job_id: str, db: Session = Depends(get_db)):
    """Retrieves the details and current status of a specific import job."""
    job = db.query(models.ImportJob).filter(models.ImportJob.id == job_id).first()
    if not job:
        raise APIException(status_code=404, detail="Job not found", error_code="NOT_FOUND")
    return job

@app.get(
    "/imports/{job_id}/records", 
    response_model=schemas.PaginatedRecords,
    summary="Get records for an import job"
)
def get_records(
    job_id: str, 
    page: int = Query(1, ge=1, description="Page number"), 
    limit: int = Query(50, ge=1, le=100, description="Records per page"), 
    filter: str = Query("all", description="Filter by valid, invalid, duplicate, or all"), 
    search: str = Query(None, description="Search query across name, email, company, city"), 
    db: Session = Depends(get_db)
):
    """
    Retrieves the processed records for a specific import job.
    Supports pagination, filtering by validation status, and free-text searching.
    """
    job = db.query(models.ImportJob).filter(models.ImportJob.id == job_id).first()
    if not job:
        raise APIException(status_code=404, detail="Job not found", error_code="NOT_FOUND")
        
    query = db.query(models.ImportRecord).filter(models.ImportRecord.job_id == job_id)
    
    if filter == "valid":
        query = query.filter(models.ImportRecord.is_valid == True)
    elif filter == "invalid":
        query = query.filter(models.ImportRecord.is_valid == False, models.ImportRecord.is_duplicate == False)
    elif filter == "duplicate":
        query = query.filter(models.ImportRecord.is_duplicate == True)
        
    if search:
        search_pattern = f"%{search.lower()}%"
        # Search only on meaningful text fields using SQLite JSON functions
        query = query.filter(
            or_(
                func.lower(func.json_extract(models.ImportRecord.raw_data, '$.name')).ilike(search_pattern),
                func.lower(func.json_extract(models.ImportRecord.raw_data, '$.email')).ilike(search_pattern),
                func.lower(func.json_extract(models.ImportRecord.raw_data, '$.company')).ilike(search_pattern),
                func.lower(func.json_extract(models.ImportRecord.raw_data, '$.city')).ilike(search_pattern),
            )
        )

    total = query.count()
    records = query.order_by(models.ImportRecord.row_number.asc()).offset((page - 1) * limit).limit(limit).all()
    
    return schemas.PaginatedRecords(
        total=total,
        page=page,
        limit=limit,
        records=records
    )

@app.get(
    "/imports/{job_id}/download",
    summary="Download valid records as CSV"
)
def download_valid_records(job_id: str, db: Session = Depends(get_db)):
    """
    Downloads only the valid records from a specific import job as a new CSV file.
    """
    job = db.query(models.ImportJob).filter(models.ImportJob.id == job_id).first()
    if not job:
        raise APIException(status_code=404, detail="Job not found", error_code="NOT_FOUND")
        
    valid_records = db.query(models.ImportRecord).filter(
        models.ImportRecord.job_id == job_id,
        models.ImportRecord.is_valid == True
    ).order_by(models.ImportRecord.row_number.asc()).all()
    
    output = io.StringIO()
    if valid_records:
        fieldnames = valid_records[0].raw_data.keys()
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for record in valid_records:
            writer.writerow(record.raw_data)
            
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=valid_records_{job_id}.csv"
    return response
