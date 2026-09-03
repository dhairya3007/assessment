from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class JobBase(BaseModel):
    id: str
    filename: str
    status: str
    total_count: int
    valid_count: int
    invalid_count: int
    duplicate_count: int
    created_at: datetime
    error_message: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class RecordBase(BaseModel):
    id: str
    job_id: str
    row_number: int
    raw_data: Dict[str, Any]
    is_valid: bool
    is_duplicate: bool
    validation_reasons: List[str]
    
    model_config = ConfigDict(from_attributes=True)

class PaginatedRecords(BaseModel):
    total: int
    page: int
    limit: int
    records: List[RecordBase]

class ErrorResponse(BaseModel):
    detail: str
    error_code: str
