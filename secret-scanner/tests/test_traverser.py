import os
import shutil
import git
from src.core.scanner import SecretScanner
from src.git.traverser import GitTraverser

TEST_REPO_PATH = os.path.join("benchmarks", "test_datasets", "dummy_repo")

def setup_dummy_repo():
    """Creates a temporary Git repository with hidden secrets in history."""
    if os.path.exists(TEST_REPO_PATH):
        shutil.rmtree(TEST_REPO_PATH)

    os.makedirs(TEST_REPO_PATH, exist_ok=True)
    repo = git.Repo.init(TEST_REPO_PATH)

    # Commit 1: Add a file with a secret
    secret_file = os.path.join(TEST_REPO_PATH, "config.py")
    with open(secret_file, "w") as f:
        f.write('AWS_KEY = "AKIAIOSFODNN7EXAMPLE"\n')
        f.write('DB_PASS = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"\n')

    repo.index.add(["config.py"])
    repo.index.commit("Add initial config with keys")

    # Commit 2: Remove the secrets (simulating a developer trying to hide them)
    with open(secret_file, "w") as f:
        f.write('AWS_KEY = os.getenv("AWS_KEY")\n')
        f.write('DB_PASS = os.getenv("DB_PASS")\n')

    repo.index.add(["config.py"])
    repo.index.commit("Remove secrets and use environment variables")

    return repo

def cleanup():
    """Cleans up temporary files."""
    if os.path.exists(TEST_REPO_PATH):
        shutil.rmtree(TEST_REPO_PATH, ignore_errors=True)

if __name__ == "__main__":
    print("Creating dummy git repository...")
    setup_dummy_repo()

    print("Running Git Traverser scan on history...\n")
    scanner = SecretScanner(entropy_threshold=4.0)
    traverser = GitTraverser(TEST_REPO_PATH, scanner)

    results = traverser.scan_history()

    for match in results:
        print(f"Commit [{match['commit_hash']}] by {match['author']}:")
        print(f"  ├─ File: {match['file']}")
        print(f"  ├─ Type: {match['type']}")
        print(f"  └─ Secret Found: {match['value']}\n")

    cleanup()