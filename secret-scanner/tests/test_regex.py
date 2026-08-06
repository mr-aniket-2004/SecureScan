from src.core.regex_engine import RegexEngine

engine = RegexEngine()

sample_code = """
aws_key = "AKIAIOSFODNN7EXAMPLE"
print("Connecting to service...")
"""

results = engine.scan(sample_code)
print("Regex Findings:", results)