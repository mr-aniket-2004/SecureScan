import uuid
import os
import logging
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from src.db.database import get_db, engine, Base, SessionLocal
from src.db.models import ScanJob
from src.api.schemas import ScanRequest, ScanJobResponse
from src.scanner.orchestrator import run_scan_job

# Configure logger for Render visibility
logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title="GitHub Repo Security & Health Scanner API",
    version="1.0.0"
)

# 1. FIXED CORS CONFIGURATION
# Specific origins are required when allow_credentials=True
allowed_origins = [
    "https://secure-scan-plum.vercel.app",  # Your Vercel domain
    "http://localhost:5173",                 # Local Vite development
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. SAFE DB INITIALIZATION
@app.on_event("startup")
def startup_db_client():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Database setup error on startup: {e}")

# 3. ROBUST BACKGROUND TASK WITH EXCEPTION HANDLING
def process_scan_background(job_id: str):
    db = SessionLocal()
    try:
        run_scan_job(job_id, db)
    except Exception as e:
        logger.error(f"Background task failed for job {job_id}: {e}")
        # Update job status to FAILED so frontend doesn't hang in PENDING state
        job = db.query(ScanJob).filter(ScanJob.id == job_id).first()
        if job:
            job.status = "FAILED"
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Security Scanner API is running!"}


@app.post("/api/v1/scan", response_model=ScanJobResponse, status_code=status.HTTP_201_CREATED)
def create_scan_job(
    request: ScanRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """Triggers a new scan job asynchronously in background."""
    new_job = ScanJob(
        id=str(uuid.uuid4()),
        repo_url=str(request.repo_url),
        status="PENDING",
        secrets_found=0,
        vulnerabilities_found=0,
        security_score="N/A"
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Queue background scanning job
    background_tasks.add_task(process_scan_background, new_job.id)
    
    return new_job


@app.get("/api/v1/scan/{job_id}", response_model=ScanJobResponse)
def get_scan_job(job_id: str, db: Session = Depends(get_db)):
    """Fetches job status and results for a given job_id."""
    job = db.query(ScanJob).filter(ScanJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Scan job with ID '{job_id}' not found."
        )
    return job


@app.get("/api/v1/scan/{job_id}/pdf")
def download_pdf_report(job_id: str, db: Session = Depends(get_db)):
    """Downloads the generated PDF report for a completed scan job."""
    job = db.query(ScanJob).filter(ScanJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Scan job not found.")
        
    if not job.pdf_report_path or not os.path.exists(job.pdf_report_path):
        raise HTTPException(status_code=404, detail="PDF report not ready or file missing.")

    return FileResponse(
        path=job.pdf_report_path,
        filename=f"Security_Report_{job_id[:8]}.pdf",
        media_type="application/pdf"
    )