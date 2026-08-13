from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import List, Optional

# Request body when starting a scan
class ScanRequest(BaseModel):
    repo_url: str

# Schema for individual findings in response
class FindingResponse(BaseModel):
    id: str
    file_path: str
    line_number: Optional[int]
    issue_type: str
    severity: str
    raw_match: Optional[str]
    validation_status: str
    commit_hash: Optional[str]
    author: Optional[str]

    class Config:
        from_attributes = True

# Schema for full scan job details
class ScanJobResponse(BaseModel):
    id: str
    repo_url: str
    status: str
    secrets_found: int
    vulnerabilities_found: int
    security_score: str
    pdf_report_path: Optional[str]
    created_at: datetime
    findings: List[FindingResponse] = []

    class Config:
        from_attributes = True