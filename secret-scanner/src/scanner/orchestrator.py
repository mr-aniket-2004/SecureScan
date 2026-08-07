import traceback
from sqlalchemy.orm import Session
from src.db.models import ScanJob, ScanFinding
from src.scanner.git_cloner import GitCloner
from src.scanner.secret_detector import SecretDetector
from src.scanner.dependency_checker import DependencyChecker
from src.reports.pdf_generator import PDFReportGenerator

def run_scan_job(job_id: str, db: Session):
    job = db.query(ScanJob).filter(ScanJob.id == job_id).first()
    if not job:
        return

    job.status = "IN_PROGRESS"
    db.commit()

    cloner = GitCloner(job.repo_url)
    try:
        repo_dir = cloner.clone_repo()

        secret_detector = SecretDetector(repo_dir)
        secret_findings = secret_detector.scan()

        dep_checker = DependencyChecker(repo_dir)
        dep_findings = dep_checker.scan()

        all_findings = secret_findings + dep_findings

        saved_findings = []
        for item in all_findings:
            finding_record = ScanFinding(
                job_id=job.id,
                file_path=item["file_path"],
                line_number=item["line_number"],
                issue_type=item["issue_type"],
                severity=item["severity"],
                raw_match=item["raw_match"]
            )
            db.add(finding_record)
            saved_findings.append(finding_record)

        secrets_count = len(secret_findings)
        vulns_count = len(dep_findings)
        total_issues = secrets_count + vulns_count

        job.secrets_found = secrets_count
        job.vulnerabilities_found = vulns_count
        job.security_score = "F" if total_issues > 3 else "C" if total_issues > 0 else "A"
        
        # Generate PDF Report
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

        job.status = "COMPLETED"
        db.commit()
        print(f"[+] Scan & PDF Report generated successfully for job {job.id}")

    except Exception as e:
        db.rollback()
        job.status = "FAILED"
        db.commit()
        traceback.print_exc()

    finally:
        cloner.cleanup()