import argparse
import asyncio
import sys
from pathlib import Path

# Import your existing engine classes
from src.scanner.secret_detector import SecretDetector
from src.scanner.dependency_checker import DependencyChecker

async def run_cli():
    parser = argparse.ArgumentParser(
        description="Ani's Secret & Dependency Scanner CLI"
    )
    parser.add_argument(
        "--path",
        default=".",
        help="Directory path to scan (defaults to current directory)",
    )
    args = parser.parse_args()

    target_path = Path(args.path).resolve()
    print(f"🔍 Starting Security Scan on: {target_path}\n")

    if not target_path.exists():
        print(f"❌ Error: Path '{target_path}' does not exist.")
        sys.exit(2)

    # 1. Execute Secret Detector Engine
    print("[1/2] Scanning for hardcoded secrets...")
    try:
        secret_detector = SecretDetector(str(target_path))
        secret_findings = await secret_detector.scan()
    except Exception as err:
        print(f"❌ Error during secret detection: {err}")
        secret_findings = []

    # 2. Execute Dependency Checker Engine
    print("[2/2] Scanning dependencies for vulnerabilities...")
    try:
        dep_checker = DependencyChecker(str(target_path))
        dep_findings = dep_checker.scan()
    except Exception as err:
        print(f"❌ Error during dependency check: {err}")
        dep_findings = []

    total_secrets = len(secret_findings)
    total_vulns = len(dep_findings)
    total_issues = total_secrets + total_vulns

    # 3. Print Results Summary
    print("\n" + "=" * 55)
    print("                 SECURITY AUDIT SUMMARY")
    print("=" * 55)
    print(f"• Secrets Detected: {total_secrets}")
    print(f"• Vulnerabilities Detected: {total_vulns}")
    print("=" * 55 + "\n")

    # 4. Handle Findings and Exit Codes
    if total_issues > 0:
        print("❌ SECURITY CHECK FAILED! Fix the following issues:\n")

        for idx, item in enumerate(secret_findings, 1):
            file_p = item.get("file_path") or item.get("file") or "Unknown"
            line = item.get("line_number", "?")
            rule = item.get("rule_id") or item.get("issue_type", "Secret Leaked")
            print(f"  [{idx}] SECRET: {file_p}:{line} | Rule: {rule}")

        for idx, item in enumerate(dep_findings, 1):
            file_p = item.get("file_path") or "requirements.txt"
            details = item.get("details") or item.get("raw_match", "Vulnerability")
            print(f"  [{idx}] VULN: {file_p} | Details: {details}")

        print("\n💡 Action Required: Remove leaked credentials before merging.")
        sys.exit(1)  # CRITICAL: Signals failure to GitHub Actions
    else:
        print("✅ SECURITY CHECK PASSED: Codebase is clean.")
        sys.exit(0)  # Signals success to GitHub Actions

if __name__ == "__main__":
    asyncio.run(run_cli())