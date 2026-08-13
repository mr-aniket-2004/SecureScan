from src.scanner.validators.base import BaseValidator

class AWSValidator(BaseValidator):
    async def validate(self, token: str) -> str:
        # AWS STS verification requires both ACCESS_KEY_ID and SECRET_ACCESS_KEY.
        # Standalone Key ID regex matches without the corresponding secret cannot be verified safely.
        return "UNVERIFIED"