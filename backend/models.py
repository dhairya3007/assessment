import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from sqlalchemy import  String, Integer, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base

class ImportJob(Base):
    __tablename__ = "import_jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    filename: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    total_count: Mapped[int] = mapped_column(Integer, default=0)
    valid_count: Mapped[int] = mapped_column(Integer, default=0)
    invalid_count: Mapped[int] = mapped_column(Integer, default=0)
    duplicate_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    records: Mapped[List["ImportRecord"]] = relationship("ImportRecord", back_populates="job", cascade="all, delete-orphan")

class ImportRecord(Base):
    __tablename__ = "import_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(String, ForeignKey("import_jobs.id"), nullable=False, index=True)
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    raw_data: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    is_valid: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    validation_reasons: Mapped[List[str]] = mapped_column(JSON, nullable=False)

    job: Mapped["ImportJob"] = relationship("ImportJob", back_populates="records")

