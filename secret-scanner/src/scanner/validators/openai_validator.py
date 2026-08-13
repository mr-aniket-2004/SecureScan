import httpx
from src.scanner.validators.base import BaseValidator

class OpenAIValidator(BaseValidator):
    async def validate(self, token: str) -> str:
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                response = await client.get("https://api.openai.com/v1/models", headers=headers)
                if response.status_code == 200:
                    return "ACTIVE"
                elif response.status_code == 401:
                    return "REVOKED"
            except Exception:
                return "UNVERIFIED"
        return "UNVERIFIED"