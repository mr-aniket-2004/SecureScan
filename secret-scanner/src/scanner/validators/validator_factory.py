from src.scanner.validators.github_validator import GitHubValidator
from src.scanner.validators.slack_validator import SlackValidator
from src.scanner.validators.openai_validator import OpenAIValidator
from src.scanner.validators.aws_validator import AWSValidator

class ValidatorFactory:
    _validators = {
        "GitHub Personal Access Token": GitHubValidator(),
        "Slack Bot Token": SlackValidator(),
        "OpenAI API Key": OpenAIValidator(),
        "AWS Access Key ID": AWSValidator(),
    }

    @classmethod
    async def validate(cls, issue_type: str, raw_secret: str) -> str:
        validator = cls._validators.get(issue_type)
        if not validator:
            return "UNVERIFIED"
        return await validator.validate(raw_secret)