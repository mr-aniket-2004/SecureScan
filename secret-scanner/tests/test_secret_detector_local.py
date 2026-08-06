from src.scanner.secret_detector import SecretDetector

print("[*] Running local secret detector test on 'tests/' directory...")
detector = SecretDetector("tests")
findings = detector.scan()

print(f"\n[+] Scan finished! Total secrets detected: {len(findings)}\n")

for idx, finding in enumerate(findings, 1):
    print(f"Finding #{idx}:")
    print(f"  File: {finding['file_path']}")
    print(f"  Line: {finding['line_number']}")
    print(f"  Issue: {finding['issue_type']}")
    print(f"  Severity: {finding['severity']}")
    print(f"  Matched: {finding['raw_match']}")
    print("-" * 40)