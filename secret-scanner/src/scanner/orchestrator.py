import traceback
import logging
from sqlalchemy.orm import Session
from src.db.models import ScanJob, ScanFinding
from src.scanner.git_cloner import GitCloner
from src.scanner.secret_detector import SecretDetector
from src.scanner.dependency_checker import DependencyChecker
from src.reports.pdf_generator import PDFReportGenerator

logger = logging.getLogger("uvicorn.error")

async def run_scan_job(job_id: str, db: Session):
    job = db.query(ScanJob).filter(ScanJob.id == job_id).first()
    if not job:
        logger.error(f"[!] Scan job '{job_id}' not found in database.")
        return

    job.status = "IN_PROGRESS"
    db.commit()

    cloner = GitCloner(job.repo_url)
    try:
        print(f"[*] [1/5] Cloning repository: {job.repo_url}")
        repo_dir = cloner.clone_repo()

        print("[*] [2/5] Executing Secret Detector...")
        secret_detector = SecretDetector(repo_dir)
        secret_findings = await secret_detector.scan()

        print("[*] [3/5] Executing Dependency Checker...")
        dep_checker = DependencyChecker(repo_dir)
        dep_findings = dep_checker.scan()

        print("[*] [4/5] Saving findings to database...")
        all_findings = secret_findings + dep_findings

        saved_findings = []
        for item in all_findings:
            finding_record = ScanFinding(
                job_id=job.id,
                file_path=item.get("file_path") or item.get("file") or "Unknown File",
                line_number=item.get("line_number", 0),
                issue_type=item.get("issue_type") or item.get("rule_id", "Vulnerability"),
                severity=item.get("severity", "MEDIUM"),
                raw_match=str(item.get("raw_match") or item.get("details", "")),
                validation_status=item.get("validation_status", "UNVERIFIED")
            )
            db.add(finding_record)
            saved_findings.append(finding_record)

        secrets_count = len(secret_findings)
        vulns_count = len(dep_findings)
        total_issues = secrets_count + vulns_count

        job.secrets_found = secrets_count
        job.vulnerabilities_found = vulns_count
        job.security_score = "F" if total_issues > 3 else "C" if total_issues > 0 else "A"

        # Isolated PDF Report Generation
        print("[*] [5/5] Generating PDF report...")
        try:
            pdf_gen = PDFReportGenerator()
            job_data = {
                "id": job.id,
                "repo_url": job.repo_url,
                "status": "COMPLETED",
                "security_score": job.security_score,
                "secrets_found": secrets_count,
                "vulnerabilities_found": vulns_count
            }
            report_path = pdf_gen.generate_report(job_data, saved_findings)
            job.pdf_report_path = report_path
        except Exception as pdf_err:
            print(f"[!] Warning: PDF report generation failed: {pdf_err}")
            job.pdf_report_path = None

        job.status = "COMPLETED"
        db.commit()
        print(f"[+] Scan completed successfully for job {job.id}")

    except Exception as e:
        db.rollback()
        print(f"[!] Scan pipeline crashed on job {job_id}: {e}")
        traceback.print_exc()

        # Re-fetch job to update status safely after session rollback
        failed_job = db.query(ScanJob).filter(ScanJob.id == job_id).first()
        if failed_job:
            failed_job.status = "FAILED"
            db.commit()

    finally:
        cloner.cleanup()