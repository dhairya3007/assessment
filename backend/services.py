import csv
import io
import contextlib
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from validators import validate_row

def process_csv_file(job_id: str, file_content: bytes):
    with contextlib.closing(SessionLocal()) as db:
        job = db.query(models.ImportJob).filter(models.ImportJob.id == job_id).first()
        if not job:
            return

        try:
            job.status = "processing"
            db.commit()

            try:
                content_str = file_content.decode("utf-8-sig")
            except UnicodeDecodeError:
                raise ValueError("File encoding must be UTF-8")

            reader = csv.DictReader(io.StringIO(content_str))
            fieldnames = reader.fieldnames
            if not fieldnames:
                raise ValueError("Missing required columns or empty file")

            seen_emails = set()
            batch_size = 500
            records_to_insert = []
            
            for row_num, row in enumerate(reader, start=2): # row 1 is header
                clean_row = {}
                for k, v in row.items():
                    if k is not None:
                        clean_row[k.strip().lower()] = (v.strip() if isinstance(v, str) else str(v) if v is not None else "")
                
                if None in row or any(v is None for v in row.values()):
                    is_valid = False
                    reasons = ["Malformed or unexpected data"]
                    is_duplicate = False
                else:
                    is_valid, reasons = validate_row(clean_row)
                    is_duplicate = False
                    
                    email = clean_row.get("email", "")
                    if email and "Invalid email" not in reasons:
                        if email.lower() in seen_emails:
                            is_duplicate = True
                            is_valid = False
                            reasons.append("Duplicate email in file")
                        else:
                            seen_emails.add(email.lower())
                
                record = models.ImportRecord(
                    job_id=job_id,
                    row_number=row_num,
                    raw_data=row,
                    is_valid=is_valid,
                    is_duplicate=is_duplicate,
                    validation_reasons=reasons
                )
                records_to_insert.append(record)
                
                job.total_count += 1
                if is_duplicate:
                    job.duplicate_count += 1
                elif is_valid:
                    job.valid_count += 1
                else:
                    job.invalid_count += 1
                    
                if len(records_to_insert) >= batch_size:
                    db.add_all(records_to_insert)
                    db.commit()
                    records_to_insert = []
                    
            if records_to_insert:
                db.add_all(records_to_insert)
                db.commit()
                
            job.status = "completed"
            db.commit()
            
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

