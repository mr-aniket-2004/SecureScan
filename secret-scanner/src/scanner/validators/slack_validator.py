import httpx
from src.scanner.validators.base import BaseValidator

class SlackValidator(BaseValidator):
    async def validate(self, token: str) -> str:
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                response = await client.post("https://slack.com/api/auth.test", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("ok") is True:
                        return "ACTIVE"
                    elif data.get("error") in ("invalid_auth", "token_revoked", "account_inactive"):
                        return "REVOKED"
            except Exception:
                return "UNVERIFIED"
        return "UNVERIFIED"