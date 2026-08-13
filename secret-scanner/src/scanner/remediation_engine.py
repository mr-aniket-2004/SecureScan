import os
import json
import asyncio
from typing import Dict, Any

# Safely import google.generativeai without crashing backend if missing
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class AIRemediationEngine:
    """Generates context-aware remediation instructions for detected secrets and security risks."""

    @staticmethod
    async def generate_remediation(
        issue_type: str, file_path: str, line_number: int, validation_status: str
    ) -> Dict[str, Any]:
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        # 1. Attempt LLM Generation if library is available & API key exists
        if GENAI_AVAILABLE and gemini_key:
            try:
                print(f"[AIRemediationEngine] Requesting AI remediation for: '{issue_type}'")
                return await AIRemediationEngine._generate_gemini_remediation(
                    issue_type, file_path, line_number, validation_status, gemini_key
                )
            except Exception as e:
                print(f"[AIRemediationEngine] Gemini API call failed: {e}. Falling back to static template.")
        else:
            if not GENAI_AVAILABLE:
                print("[AIRemediationEngine] WARNING: 'google-generativeai' package is not installed.")
            if not gemini_key:
                print("[AIRemediationEngine] WARNING: Neither GEMINI_API_KEY nor GOOGLE_API_KEY is set.")

        # 2. Fallback to static template engine
        return AIRemediationEngine._get_template_remediation(
            issue_type, file_path, line_number, validation_status
        )

    @staticmethod
    async def _generate_gemini_remediation(
        issue_type: str, file_path: str, line_number: int, validation_status: str, api_key: str
    ) -> Dict[str, Any]:
        genai.configure(api_key=api_key)

        # Offload sync I/O operation (list_models) to thread worker to prevent event loop blocking
        def get_active_models():
            discovered = []
            try:
                for m in genai.list_models():
                    if "generateContent" in m.supported_generation_methods:
                        # Clean model name string (strip 'models/' prefix if present)
                        clean_name = m.name.replace("models/", "")
                        discovered.append(clean_name)
                # Prioritize flash models
                discovered.sort(key=lambda name: 0 if "flash" in name.lower() else 1)
            except Exception as e:
                print(f"[AIRemediationEngine] Failed to list models: {e}")
            return discovered

        candidate_models = await asyncio.to_thread(get_active_models)

        # Static fallback list if dynamic discovery returns empty
        if not candidate_models:
            candidate_models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]

        print(f"[AIRemediationEngine] Discovered candidate models: {candidate_models}")

        prompt = f"""
        You are an Application Security Engineer. A security scanner detected an issue in a codebase.
        Generate clear, step-by-step remediation instructions.

        Context:
        - Issue Type: {issue_type}
        - File Path: {file_path}
        - Line Number: {line_number}
        - Validation Status: {validation_status} (ACTIVE = live leak, UNVERIFIED = potential leak)

        Respond strictly with a JSON object following this exact schema:
        {{
            "title": "Remediate <Issue Type>",
            "urgency": "CRITICAL" or "HIGH" or "MEDIUM",
            "summary": "Short 1-2 sentence overview of risk.",
            "steps": [
                "1. First step...",
                "2. Second step..."
            ],
            "code_example": "# Code snippet showing secure fix"
        }}
        """

        last_error = None
        for model_name in candidate_models:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config={"response_mime_type": "application/json"}
                )
                response = await model.generate_content_async(prompt)
                return json.loads(response.text)
            except Exception as e:
                last_error = e
                print(f"[AIRemediationEngine] Model '{model_name}' execution failed: {e}. Trying next model...")

        raise last_error

    @staticmethod
    def _get_template_remediation(
        issue_type: str, file_path: str, line_number: int, validation_status: str
    ) -> Dict[str, Any]:
        is_active = validation_status == "ACTIVE"
        issue_type_lower = issue_type.lower()

        is_dependency_issue = any(k in issue_type_lower for k in ["vulnerable", "package", "npm", "dependency", "pip"])

        remediations = {
            "GitHub Personal Access Token": {
                "title": "Remediate Leaked GitHub Token",
                "urgency": "CRITICAL" if is_active else "HIGH",
                "summary": (
                    f"A GitHub PAT was detected on line {line_number} of {file_path}. "
                    + ("This key is live and currently accessible!" if is_active else "This key appears revoked, but hardcoded references must be purged.")
                ),
                "steps": [
                    "1. Revoke Immediately: Navigate to GitHub -> Settings -> Developer Settings -> Personal Access Tokens and revoke this token.",
                    f"2. Remove from Source: Delete the secret string from '{file_path}' at line {line_number}.",
                    "3. Purge Git History: Use 'git-filter-repo' or BFG Repo-Cleaner to remove the secret from past commits.",
                    "4. Environment Variables: Store the new token in a local .env file or GitHub Secrets."
                ],
                "code_example": "import os\nGITHUB_TOKEN = os.getenv(\"GITHUB_TOKEN\")"
            },
            "OpenAI API Key": {
                "title": "Remediate Leaked OpenAI API Key",
                "urgency": "CRITICAL" if is_active else "HIGH",
                "summary": f"An OpenAI API Key was detected in {file_path}. Leaked keys can lead to unauthorized billing charges.",
                "steps": [
                    "1. Revoke Key: Log into platform.openai.com -> API Keys and delete the compromised key immediately.",
                    "2. Check Usage Logs: Review the Usage dashboard for unauthorized API requests.",
                    "3. Refactor Code: Load the key via environment variables (`os.getenv('OPENAI_API_KEY')`).",
                    "4. Add to .gitignore: Ensure `.env` files are ignored by git."
                ],
                "code_example": "from dotenv import load_dotenv\nimport os\n\nload_dotenv()\nopenai_key = os.getenv(\"OPENAI_API_KEY\")"
            },
            "Slack Bot Token": {
                "title": "Remediate Leaked Slack Bot Token",
                "urgency": "CRITICAL" if is_active else "HIGH",
                "summary": f"A Slack Bot/User Token was exposed in {file_path}.",
                "steps": [
                    "1. Re-install App / Revoke Token: Go to api.slack.com/apps -> OAuth & Permissions and reinstall the app to revoke old tokens.",
                    f"2. Clean Source File: Remove the hardcoded token from line {line_number}.",
                    "3. Rotate Webhooks: If incoming webhooks were shared, regenerate webhook URLs."
                ],
                "code_example": "import os\nSLACK_TOKEN = os.getenv(\"SLACK_BOT_TOKEN\")"
            },
            "RSA Private Key": {
                "title": "Remediate Leaked RSA Private Key",
                "urgency": "CRITICAL",
                "summary": f"An RSA Private Key was exposed in {file_path} at line {line_number}. Exposed private keys compromise server authentication.",
                "steps": [
                    "1. Revoke Access: Remove the matching public key from server `authorized_keys` or cloud provider dashboards.",
                    "2. Generate New Key Pair: Run `ssh-keygen -t rsa -b 4096` to create a fresh key pair.",
                    f"3. Purge File: Delete the private key string from `{file_path}`.",
                    "4. Externalize: Load key content or file path via environment variables or a key vault."
                ],
                "code_example": "import os\nkey_path = os.getenv(\"RSA_PRIVATE_KEY_PATH\")"
            },
            "Generic API Key": {
                "title": "Remediate Leaked Generic API Key",
                "urgency": "HIGH" if is_active else "MEDIUM",
                "summary": f"A generic API key or secret token was detected in {file_path} on line {line_number}.",
                "steps": [
                    "1. Identify Provider: Determine which third-party service issued this key.",
                    "2. Invalidate & Rotate: Invalidate the leaked key in the provider's management console and generate a replacement.",
                    f"3. Refactor Code: Remove the raw secret string from `{file_path}` line {line_number}.",
                    "4. Externalize Configuration: Inject the secret at runtime using `os.getenv()`."
                ],
                "code_example": "import os\nAPI_KEY = os.getenv(\"SERVICE_API_KEY\")"
            }
        }

        if issue_type in remediations:
            return remediations[issue_type]

        if is_dependency_issue:
            return {
                "title": f"Upgrade {issue_type}",
                "urgency": "HIGH",
                "summary": f"A vulnerable package dependency ({issue_type}) was detected in {file_path}.",
                "steps": [
                    "1. Identify Safe Version: Check official security advisories (e.g., npm audit, CVE databases) for patched releases.",
                    f"2. Update Dependency: Update the package version string in `{file_path}`.",
                    "3. Run Audit: Execute `npm audit fix` or `pip audit` to verify the patch.",
                    "4. Run Tests: Execute unit/integration tests to ensure no breaking API changes occurred."
                ],
                "code_example": "// Example fix in package.json:\n\"dependencies\": {\n  \"axios\": \"^1.7.4\"\n}"
            }

        return {
            "title": f"Remediate Leaked {issue_type}",
            "urgency": "CRITICAL" if is_active else "MEDIUM",
            "summary": f"A potential {issue_type} secret was found in {file_path} at line {line_number}.",
            "steps": [
                "1. Invalidate Credential: Revoke or rotate this secret immediately in your provider dashboard.",
                "2. Remove Hardcoded Value: Remove the raw secret string from source code.",
                "3. Externalize Configuration: Move sensitive values into environment variables.",
                "4. Commit Cleanup: Purge secret commits from past repository history."
            ],
            "code_example": "import os\nSECRET_KEY = os.getenv(\"APP_SECRET_KEY\")"
        }