import nltk

# Download the necessary NLTK resources
nltk.download('punkt_tab', quiet=True)

def split_into_sentences(text: str):
    # Use NLTK's sentence tokenizer
    sentences = nltk.sent_tokenize(text)
    return sentences

def tokenize_words(text: str):
    return text.split()