from abc import ABC, abstractmethod

class BaseValidator(ABC):
    @abstractmethod
    async def validate(self, token: str) -> str:
        """
        Validates the given secret token.
        Returns: "ACTIVE", "REVOKED", or "UNVERIFIED"
        """
        pass