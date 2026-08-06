import re
from src.core.regex_engine import RegexEngine
from src.core.entropy import calculate_entropy

class SecretScanner:
    def __init__(self, entropy_threshold: float = 4.5):
        self.regex_engine = RegexEngine()
        self.entropy_threshold = entropy_threshold

    def _extract_tokens(self, text: str) -> list:
        """Splits code/text into individual words and string literals for analysis."""
        # Split by whitespace, quotes, and common code symbols
        return [token for token in re.split(r'[\s\'"=;,:]+', text) if len(token) >= 8]

    def scan_line(self, line: str, line_number: int = 1) -> list:
        """
        Scans a single line of text using both Regex and Shannon Entropy logic.
        Returns a list of identified secret findings.
        """
        findings = []

        # 1. Check Regex rules
        regex_matches = self.regex_engine.scan(line)
        for match in regex_matches:
            findings.append({
                "type": "Regex Match",
                "rule": match["rule"],
                "value": match["matched_text"],
                "line": line_number
            })

        # 2. Check High Entropy tokens
        tokens = self._extract_tokens(line)
        for token in tokens:
            entropy_score = calculate_entropy(token)
            if entropy_score >= self.entropy_threshold:
                # Avoid duplicating if regex already matched this token
                already_matched = any(token in f["value"] for f in findings)
                if not already_matched:
                    findings.append({
                        "type": "High Entropy",
                        "rule": f"Entropy Score >= {self.entropy_threshold}",
                        "value": token,
                        "score": round(entropy_score, 2),
                        "line": line_number
                    })

        return findings