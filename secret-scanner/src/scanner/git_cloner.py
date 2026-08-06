import os
import shutil
import tempfile
from git import Repo

class GitCloner:
    """Handles cloning repositories to a temporary directory and cleaning up afterwards."""
    
    def __init__(self, repo_url: str):
        self.repo_url = repo_url
        self.temp_dir = None

    def clone_repo(self) -> str:
        """Clones the target repository into a temporary directory."""
        self.temp_dir = tempfile.mkdtemp(prefix="sec_scan_")
        print(f"[*] Cloning {self.repo_url} into temporary directory: {self.temp_dir}")
        try:
            Repo.clone_from(self.repo_url, self.temp_dir, depth=1)  # Shallow clone (depth=1) for speed
            return self.temp_dir
        except Exception as e:
            self.cleanup()
            raise RuntimeError(f"Failed to clone repository: {str(e)}")

    def cleanup(self):
        """Deletes the temporary cloned repository directory."""
        if self.temp_dir and os.path.exists(self.temp_dir):
            print(f"[*] Cleaning up temporary directory: {self.temp_dir}")
            shutil.rmtree(self.temp_dir, ignore_errors=True)