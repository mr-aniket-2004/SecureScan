import os
os.environ["GIT_PYTHON_GIT_EXECUTABLE"] = r"C:\Program Files\Git\cmd\git.exe"

import re
import git
from src.core.scanner import SecretScanner

# Extensions and directories that produce high noise/false positives
IGNORED_EXTENSIONS = {
    ".min.js", ".min.css", ".map", ".png", ".jpg", ".jpeg", 
    ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot"
}

IGNORED_PATHS = [
    "node_modules/", "vendor/", "static/css/", "static/js/", "migrations/"
]

def should_skip_file(file_path: str) -> bool:
    if not file_path:
        return False
    
    # Check extension
    for ext in IGNORED_EXTENSIONS:
        if file_path.endswith(ext):
            return True
            
    # Check directory path
    for path in IGNORED_PATHS:
        if path in file_path:
            return True
            
    return False

def is_false_positive_line(line: str) -> bool:
    """Checks if a single line matches common non-secret patterns like HTML/Template tags."""
    # HTML subresource integrity hashes
    if any(hash_prefix in line for hash_prefix in ["sha256-", "sha384-", "sha512-"]):
        return True

    # Django / Jinja template tags (e.g. {{ i.subject.product_name }})
    if "{{" in line or "}}" in line or "{%" in line or "%}" in line:
        return True

    # HTML elements (e.g. <h3>, <div>, <script>)
    if re.search(r"</?[a-zA-Z0-9]+[^>]*>", line):
        return True

    return False

class GitTraverser:
    def __init__(self, repo_path: str, scanner: SecretScanner):
        self.repo = git.Repo(repo_path)
        self.scanner = scanner

    def scan_history(self) -> list:
        all_findings = []
        
        for commit in self.repo.iter_commits():
            if commit.parents:
                diffs = commit.parents[0].diff(commit, create_patch=True)
            else:
                diffs = commit.diff(git.NULL_TREE, create_patch=True)

            for diff in diffs:
                file_path = diff.a_path or diff.b_path
                
                # Filter out binary assets, minified code, and migrations
                if should_skip_file(file_path):
                    continue

                patch_text = diff.diff.decode("utf-8", errors="ignore")
                for line in patch_text.splitlines():
                    if line.startswith("+") and not line.startswith("+++"):
                        clean_line = line[1:].strip()
                        
                        # Filter out HTML, Django template tags, and hashes
                        if is_false_positive_line(clean_line):
                            continue

                        results = self.scanner.scan_line(clean_line)
                        
                        for match in results:
                            match["commit_hash"] = commit.hexsha[:8]
                            match["author"] = commit.author.name
                            match["file"] = file_path
                            all_findings.append(match)

        return all_findings