from src.core.scanner import SecretScanner

scanner = SecretScanner(entropy_threshold=4.0)

code_snippet = """
aws_secret = "AKIAIOSFODNN7EXAMPLE"
custom_db_password = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
user_name = "john_doe"
"""

print("--- SCANNING CODE SNIPPET ---")
for line_no, line in enumerate(code_snippet.strip().split("\n"), 1):
    results = scanner.scan_line(line, line_number=line_no)
    if results:
        print(f"\nLine {line_no}: {line.strip()}")
        for match in results:
            print(f"  └─> Found [{match['type']}]: {match['value']} (Rule: {match['rule']})")