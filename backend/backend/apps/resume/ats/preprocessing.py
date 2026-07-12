# def clean_text(text: str) -> str:
#     """Lowercase, keep letters/digits (so things like 'aws', 'c++'->'c', '5 years' survive
#     reasonably), collapse whitespace."""
#     text = text.lower()
#     text = re.sub(r"[^a-z0-9\+\#\s]", " ", text)  
#     text = re.sub(r"\s+", " ", text).strip()
#     return text


# def tokenize_and_lemmatize(text: str, keep_stopwords: bool = False):
#     """Tokenize, remove stopwords (optional), lemmatize, drop very short tokens."""
#     words = word_tokenize(text)
#     out = []
#     for w in words:
#         if len(w) <= 2:
#             continue
#         if not keep_stopwords and w in STOPWORDS:
#             continue
#         out.append(LEMMATIZER.lemmatize(w))
#     return out


# def preprocess(text: str) -> str:
#     """Full cleaning pipeline -> space joined lemmatized tokens (stopwords removed)."""
#     cleaned = clean_text(text)
#     tokens = tokenize_and_lemmatize(cleaned, keep_stopwords=False)
#     return " ".join(tokens)

import re
import nltk

from nltk.corpus import stopwords

from nltk.tokenize import word_tokenize

from nltk.stem import WordNetLemmatizer


# Download required packages

packages = [
    "punkt_tab",
    "stopwords",
    "wordnet"
]

for package in packages:

    try:

        nltk.download(package, quiet=True)

    except:

        pass


LEMMATIZER = WordNetLemmatizer()

STOPWORDS = set(stopwords.words("english"))


def clean_text(text):

    text = text.lower()

    text = re.sub(r"[^a-z0-9\+\#\s]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def tokenize_and_lemmatize(text):

    words = word_tokenize(text)

    tokens = []

    for word in words:

        if len(word) <= 2:
            continue

        if word in STOPWORDS:
            continue

        word = LEMMATIZER.lemmatize(word)

        tokens.append(word)

    return tokens


def preprocess(text):

    cleaned = clean_text(text)

    tokens = tokenize_and_lemmatize(cleaned)

    return " ".join(tokens)