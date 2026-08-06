from src.scanner.git_cloner import GitCloner
from src.scanner.secret_detector import SecretDetector

test_url = "https://github.com/mr-aniket-2004/Sem_5_project.git"

print("[*] Starting local scanner test...")
cloner = GitCloner(test_url)

try:
    path = cloner.clone_repo()
    detector = SecretDetector(path)
    findings = detector.scan()
    print(f"[+] Scan finished! Detected secrets count: {len(findings)}")
    for f in findings:
        print(f)
finally:
    cloner.cleanup()