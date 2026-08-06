import math
from collections import Counter

def calculate_entropy(text: str) -> float:
    """
    Calculates the Shannon Entropy of a string to measure its randomness.
    Returns a float value (typically between 0.0 and 8.0 for text).
    """
    if not text:
        return 0.0

    length = len(text)
    counts = Counter(text)
    
    entropy = 0.0
    for count in counts.values():
        probability = count / length
        entropy -= probability * math.log2(probability)
        
    return entropy