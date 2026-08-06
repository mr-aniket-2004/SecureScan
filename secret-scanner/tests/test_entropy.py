from src.core.entropy import calculate_entropy

# Standard code text (Low randomness)
low_entropy_str = "def get_user_name(): return 'john_doe'"

# Random API Key / Secret (High randomness)
high_entropy_str = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

print(f"Low Entropy Score:  {calculate_entropy(low_entropy_str):.2f}")
print(f"High Entropy Score: {calculate_entropy(high_entropy_str):.2f}")

