import os
import json
import re
from typing import List, Dict, Any

# Simple security database for common high-risk or outdated package versions
KNOWN_VULNERABILITIES = {
    "requests": {"vulnerable_below": "2.31.0", "cve": "CVE-2023-32681", "severity": "MEDIUM"},
    "django": {"vulnerable_below": "4.2.8", "cve": "CVE-2023-46809", "severity": "HIGH"},
    "flask": {"vulnerable_below": "2.2.5", "cve": "CVE-2023-30861", "severity": "HIGH"},
    "pyyaml": {"vulnerable_below": "6.0.1", "cve": "CVE-2020-14343", "severity": "CRITICAL"},
    "express": {"vulnerable_below": "4.19.2", "cve": "CVE-2024-29041", "severity": "HIGH"},
    "axios": {"vulnerable_below": "1.7.4", "cve": "CVE-2024-39338", "severity": "HIGH"},
}

class DependencyChecker:
    """Scans requirements.txt and package.json files for vulnerable packages."""

    def __init__(self, target_dir: str):
        self.target_dir = target_dir

    def scan(self) -> List[Dict[str, Any]]:
        vulnerabilities = []
        
        for root, _, files in os.walk(self.target_dir):
            if "requirements.txt" in files:
                req_path = os.path.join(root, "requirements.txt")
                vulnerabilities.extend(self._scan_requirements_txt(req_path))
                
            if "package.json" in files:
                pkg_path = os.path.join(root, "package.json")
                vulnerabilities.extend(self._scan_package_json(pkg_path))

        return vulnerabilities

    def _scan_requirements_txt(self, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        rel_path = os.path.relpath(file_path, self.target_dir)

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                for line_no, line in enumerate(f, start=1):
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    
                    # Match package==version or package>=version
                    match = re.match(r"^([a-zA-Z0-9_\-]+)\s*==\s*([0-9\.]+)", line)
                    if match:
                        pkg_name, version = match.group(1).lower(), match.group(2)
                        if pkg_name in KNOWN_VULNERABILITIES:
                            info = KNOWN_VULNERABILITIES[pkg_name]
                            findings.append({
                                "file_path": rel_path,
                                "line_number": line_no,
                                "issue_type": f"Vulnerable Dependency ({pkg_name} {version})",
                                "severity": info["severity"],
                                "raw_match": f"{pkg_name}=={version} ({info['cve']})"
                            })
        except Exception:
            pass
        return findings

    def _scan_package_json(self, file_path: str) -> List[Dict[str, Any]]:
        findings = []
        rel_path = os.path.relpath(file_path, self.target_dir)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                
                for pkg_name, ver_str in deps.items():
                    clean_ver = re.sub(r"[^0-9\.]", "", ver_str)
                    pkg_lower = pkg_name.lower()
                    if pkg_lower in KNOWN_VULNERABILITIES:
                        info = KNOWN_VULNERABILITIES[pkg_lower]
                        findings.append({
                            "file_path": rel_path,
                            "line_number": 1,
                            "issue_type": f"Vulnerable JS Package ({pkg_name} {ver_str})",
                            "severity": info["severity"],
                            "raw_match": f"{pkg_name}: {ver_str} ({info['cve']})"
                        })
        except Exception:
            pass
        return findings