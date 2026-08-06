import argparse
import os
import sys
import tempfile
import shutil
import git
from src.core.scanner import SecretScanner
from src.git.traverser import GitTraverser

# Folder within project directory where temporary repos will be cloned
LOCAL_TEMP_BASE = os.path.join(os.path.dirname(__file__), "benchmarks", "temp_clones")

def is_remote_url(path: str) -> bool:
    """Checks if the provided path is a remote Git URL."""
    return path.startswith("http://") or path.startswith("https://") or path.startswith("git@")

def main():
    parser = argparse.ArgumentParser(description="Secret Scanner - Detect leaked credentials in Git history.")
    parser.add_argument("--repo", type=str, required=True, help="Local folder path OR remote Git repo URL")
    parser.add_argument("--entropy-threshold", type=float, default=4.5, help="Entropy threshold (default: 4.5)")
    
    args = parser.parse_args()

    target_repo_path = args.repo
    temp_dir = None

    # Handle Remote URLs by cloning them temporarily inside local project folder
    if is_remote_url(args.repo):
        print(f"[*] Remote repository URL detected: {args.repo}")
        
        # Ensure benchmarks/temp_clones directory exists inside our project
        os.makedirs(LOCAL_TEMP_BASE, exist_ok=True)
        
        # Create temp folder inside project instead of system C:\AppData\Local\Temp
        temp_dir = tempfile.mkdtemp(prefix="secret_scanner_", dir=LOCAL_TEMP_BASE)
        print(f"[*] Cloning repository to local project folder: {temp_dir}...")
        
        try:
            git.Repo.clone_from(args.repo, temp_dir)
            target_repo_path = temp_dir
            print(f"[+] Clone completed successfully.\n")
        except Exception as e:
            print(f"[!] Failed to clone repository: {e}")
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
            sys.exit(1)

    print(f"[*] Initializing Secret Scanner Engine...")
    print(f"[*] Target Path: {target_repo_path}")
    print(f"[*] Entropy Threshold: {args.entropy_threshold}\n")

    scanner = SecretScanner(entropy_threshold=args.entropy_threshold)
    
    try:
        traverser = GitTraverser(target_repo_path, scanner)
        findings = traverser.scan_history()
        
        print(f"=== SCAN RESULTS ({len(findings)} findings) ===")
        for i, match in enumerate(findings, 1):
            print(f"[{i}] Commit: {match['commit_hash']} | Author: {match['author']} | File: {match['file']}")
            print(f"    Type: {match['type']} ({match['rule']})")
            print(f"    Detected Secret: {match['value']}\n")

    except git.exc.InvalidGitRepositoryError:
        print(f"[!] Error: The directory '{target_repo_path}' is not a valid Git repository (missing .git directory).")
        sys.exit(1)
    except Exception as e:
        print(f"[!] Error scanning repository: {e}")
        sys.exit(1)
        
    finally:
        # Clean up temporary cloned repository if it was a remote URL
        if temp_dir and os.path.exists(temp_dir):
            print(f"[*] Cleaning up temporary directory...")
            shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    main()