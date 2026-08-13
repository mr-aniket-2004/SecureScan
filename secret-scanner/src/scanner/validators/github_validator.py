import httpx
from src.scanner.validators.base import BaseValidator

class GitHubValidator(BaseValidator):
    async def validate(self, token: str) -> str:
        headers = {
            "Authorization": f"token {token}",
            "User-Agent": "SecureScan-Validator"
        }
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                response = await client.get("https://api.github.com/user", headers=headers)
                if response.status_code == 200:
                    return "ACTIVE"
                elif response.status_code in (401, 403):
                    return "REVOKED"
            except Exception:
                return "UNVERIFIED"
        return "UNVERIFIED"