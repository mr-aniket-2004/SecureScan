import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.db.database import Base

class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_url = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")  # PENDING, CLONING, SCANNING, COMPLETED, FAILED
    secrets_found = Column(Integer, default=0)
    vulnerabilities_found = Column(Integer, default=0)
    security_score = Column(String(5), default="N/A")  # A+, B, C, F
    pdf_report_path = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to detailed findings
    findings = relationship("ScanFinding", back_populates="job", cascade="all, delete-orphan")


class ScanFinding(Base):
    __tablename__ = "scan_findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("scan_jobs.id"), nullable=False)
    file_path = Column(Text, nullable=False)
    line_number = Column(Integer, nullable=True)
    issue_type = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    raw_match = Column(Text, nullable=True)
    commit_hash = Column(String(40), nullable=True)
    author = Column(String(100), nullable=True)

    # Link back to scan_job
    job = relationship("ScanJob", back_populates="findings")