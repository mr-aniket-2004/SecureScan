import os
import google.generativeai as genai

class GeminiAdvisor:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-2.5-flash")
        else:
            self.model = None

    def generate_remediation(self, issue_type: str, raw_match: str, file_path: str) -> str:
        if not self.model:
            return "Set GEMINI_API_KEY environment variable to enable AI security suggestions."

        prompt = (
            f"You are a cybersecurity expert auditing a codebase.\n"
            f"Vulnerability Type: {issue_type}\n"
            f"File Path: {file_path}\n"
            f"Detected Code/Pattern: {raw_match}\n\n"
            f"Provide a concise, 2-sentence explanation of why this is dangerous and "
            f"give the exact code snippet or step required to fix/remediate it safely."
        )

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Unable to generate AI recommendation: {str(e)}"