import re

# Standard regex patterns for known secret formats
DEFAULT_PATTERNS = {
    "AWS Access Key": r"(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}",
    "Generic API Key": r"(?i)(?:api_key|apikey|secret|token)\s*[:=]\s*['\"]([a-zA-Z0-9_\-]{16,})['\"]",
    "GitHub Personal Access Token": r"ghp_[a-zA-Z0-9]{36}"
}

class RegexEngine:
    def __init__(self, patterns: dict = None):
        self.patterns = patterns if patterns is not None else DEFAULT_PATTERNS

    def scan(self, text: str) -> list:
        """
        Scans a given string for pattern matches.
        Returns a list of dictionaries with match details.
        """
        findings = []
        for rule_name, pattern in self.patterns.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                findings.append({
                    "rule": rule_name,
                    "matched_text": match.group(0),
                    "start": match.start(),
                    "end": match.end()
                })
        return findings