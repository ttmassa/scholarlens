import string

def format_text(text: str):
    # Strip whitespace and convert to lowercase
    formatted_text = text.strip().lower()

    # Remove punctuation
    formatted_text = formatted_text.translate(str.maketrans('', '', string.punctuation))

    # Remove special characters
    formatted_text = ''.join(char for char in formatted_text if char.isalnum() or char.isspace())

    return formatted_text