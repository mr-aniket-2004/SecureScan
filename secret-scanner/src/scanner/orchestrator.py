import traceback
import asyncio
from sqlalchemy.orm import Session
from src.db.models import ScanJob, ScanFinding
from src.scanner.git_cloner import GitCloner
from src.scanner.secret_detector import SecretDetector
from src.scanner.dependency_checker import DependencyChecker
# from src.scanner.ai_advisor import GeminiAdvisor
from src.reports.pdf_generator import PDFReportGenerator
from src.api.websocket import ws_manager

async def run_scan_job(job_id: str, db: Session):
    job = db.query(ScanJob).filter(ScanJob.id == job_id).first()
    if not job:
        return

    job.status = "IN_PROGRESS"
    db.commit()

    # Step 1: Initialize Scan Stream
    await ws_manager.broadcast_log(
        job_id, "INIT", "Initializing secure scan job environment...", 10
    )

    cloner = GitCloner(job.repo_url)
    try:
        # Step 2: Clone Repository
        await ws_manager.broadcast_log(
            job_id, "CLONE", f"Cloning repository: {job.repo_url}", 25
        )
        repo_dir = cloner.clone_repo()

        # Step 3: Run Secret Detector
        await ws_manager.broadcast_log(
            job_id, "SECRET_SCAN", "Scanning codebase for leaked API keys & secrets...", 45
        )
        secret_detector = SecretDetector(repo_dir)
        secret_findings = secret_detector.scan()

        # Step 4: Run Dependency Auditor
        await ws_manager.broadcast_log(
            job_id, "DEP_AUDIT", "Auditing package manifests for vulnerable dependencies...", 65
        )
        dep_checker = DependencyChecker(repo_dir)
        dep_findings = dep_checker.scan()

        all_findings = secret_findings + dep_findings

        # Step 5: Phase 2 AI Remediation Engine (Gemini)
        await ws_manager.broadcast_log(
            job_id, "AI_ANALYSIS", "Running Gemini AI security advisor on detected vulnerabilities...", 80
        )
        # ai_advisor = GeminiAdvisor()
        
        saved_findings = []
        for item in all_findings:
            # Generate AI Fix Recommendation per finding
            # remediation_advice = ai_advisor.generate_remediation(
            #     issue_type=item["issue_type"],
            #     raw_match=item["raw_match"],
            #     file_path=item["file_path"]
            # )

            finding_record = ScanFinding(
                job_id=job.id,
                file_path=item["file_path"],
                line_number=item["line_number"],
                issue_type=item["issue_type"],
                severity=item["severity"],
                raw_match=item["raw_match"],
                # remediation=remediation_advice  # New DB field for AI remediation
            )
            db.add(finding_record)
            saved_findings.append(finding_record)

        secrets_count = len(secret_findings)
        vulns_count = len(dep_findings)
        total_issues = secrets_count + vulns_count

        job.secrets_found = secrets_count
        job.vulnerabilities_found = vulns_count
        job.security_score = "F" if total_issues > 3 else "C" if total_issues > 0 else "A"

        # Step 6: Generate Executive PDF Report
        await ws_manager.broadcast_log(
            job_id, "PDF_GEN", "Compiling findings and generating PDF executive report...", 90
        )
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

        # Step 7: Broadcast Complete Signal
        await ws_manager.broadcast_log(
            job_id, "COMPLETED", "Scan execution completed successfully!", 100, status="COMPLETED"
        )
        print(f"[+] Scan & PDF Report generated successfully for job {job.id}")

    except Exception as e:
        db.rollback()
        job.status = "FAILED"
        db.commit()

        # Broadcast Failure via WebSocket
        await ws_manager.broadcast_log(
            job_id, "ERROR", f"Scan failed due to an exception: {str(e)}", 100, status="FAILED"
        )
        traceback.print_exc()

    finally:
        cloner.cleanup()