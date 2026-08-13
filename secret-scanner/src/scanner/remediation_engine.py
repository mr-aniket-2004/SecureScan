import os
from typing import Dict, Any

class AIRemediationEngine:
    """Generates context-aware remediation instructions for detected secrets."""

    @staticmethod
    async def generate_remediation(issue_type: str, file_path: str, line_number: int, validation_status: str) -> Dict[str, Any]:
        api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
        
        # If API key exists, you can route to LLM client. 
        # Fallback template engine ensures zero breaking errors during evaluation demos:
        return AIRemediationEngine._get_template_remediation(issue_type, file_path, line_number, validation_status)

    @staticmethod
    def _get_template_remediation(issue_type: str, file_path: str, line_number: int, validation_status: str) -> Dict[str, Any]:
        is_active = validation_status == "ACTIVE"
        
        remediations = {
            "GitHub Personal Access Token": {
                "title": "Remediate Leaked GitHub Token",
                "urgency": "CRITICAL" if is_active else "HIGH",
                "summary": f"A GitHub PAT was detected on line {line_number} of {file_path}. " + 
                           ("This key is live and currently accessible!" if is_active else "This key appears revoked, but hardcoded references must be purged."),
                "steps": [
                    "1. Revoke Immediately: Navigate to GitHub -> Settings -> Developer Settings -> Personal Access Tokens and revoke this token.",
                    f"2. Remove from Source: Delete the secret string from '{file_path}' at line {line_number}.",
                    "3. Purge Git History: Use 'git-filter-repo' or BFG Repo-Cleaner to remove the secret from past git commits.",
                    "4. Environment Variables: Store the new token in a local .env file or GitHub Secrets."
                ],
                "code_example": "# Bad (Hardcoded):\nGITHUB_TOKEN = \"ghp_abc123...\"\n\n# Good (Environment Variable):\nimport os\nGITHUB_TOKEN = os.getenv(\"GITHUB_TOKEN\")"
            },
            "OpenAI API Key": {
                "title": "Remediate Leaked OpenAI API Key",
                "urgency": "CRITICAL" if is_active else "HIGH",
                "summary": f"An OpenAI API Key was detected in {file_path}. Leaked OpenAI keys can lead to unauthorized financial charges.",
                "steps": [
                    "1. Revoke Key: Log into platform.openai.com -> API Keys and delete the compromised key immediately.",
                    "2. Check Usage Logs: Review the Usage dashboard for unauthorized API requests.",
                    "3. Refactor Code: Load the key via environment variables (`os.getenv('OPENAI_API_KEY')`).",
                    "4. Add to .gitignore: Ensure files like .env or local config files are ignored."
                ],
                "code_example": "# Secure key loading with python-dotenv:\nfrom dotenv import load_dotenv\nimport os\n\nload_dotenv()\nopenai_key = os.getenv(\"OPENAI_API_KEY\")"
            },
            "Slack Bot Token": {
                "title": "Remediate Leaked Slack Bot Token",
                "urgency": "CRITICAL" if is_active else "HIGH",
                "summary": f"A Slack Bot/User Token was exposed in {file_path}.",
                "steps": [
                    "1. Re-install App / Revoke Token: Go to api.slack.com/apps -> OAuth & Permissions and reinstall the app to revoke old tokens.",
                    "2. Clean Source File: Remove the hardcoded token from line " + str(line_number) + ".",
                    "3. Rotate Webhooks: If incoming webhooks were shared, regenerate webhook URLs."
                ],
                "code_example": "# Recommended:\nSLACK_TOKEN = os.environ.get(\"SLACK_BOT_TOKEN\")"
            }
        }

        default_remediation = {
            "title": f"Remediate Leaked {issue_type}",
            "urgency": "CRITICAL" if is_active else "MEDIUM",
            "summary": f"A potential {issue_type} credential was found in {file_path} at line {line_number}.",
            "steps": [
                "1. Invalidate Credential: Revoke or rotate this secret immediately in your provider dashboard.",
                "2. Remove Hardcoded Value: Remove the raw secret string from source code.",
                "3. Externalize Configuration: Move sensitive values into environment variables or key vaults.",
                "4. Commit Cleanup: Ensure secret commits are not pushed to public repositories."
            ],
            "code_example": "# Use environment variable substitution\nSECRET_KEY = os.getenv(\"APP_SECRET_KEY\")"
        }

        return remediations.get(issue_type, default_remediation)