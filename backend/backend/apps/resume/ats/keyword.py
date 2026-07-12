# def extract_keywords(text: str, num_keywords: int = 25):
#     """Pull out important nouns / proper-nouns / adjectives (skills, tools, domain terms)
#     from already-cleaned text, ranked by frequency."""
#     words = word_tokenize(text)
#     words = [w for w in words if len(w) > 2 and w not in GENERIC_SKIP]
#     tagged = pos_tag(words)
#     keywords = [LEMMATIZER.lemmatize(w)
#         for w, tag in tagged if tag.startswith("NN") or tag.startswith("JJ")]
#     freq = Counter(keywords)
#     return freq.most_common(num_keywords)


# def missing_keywords(resume_processed: str, jd_processed: str, top_n: int = 15):
#     """Keywords that matter in the JD but don't appear in the resume at all."""
#     jd_keywords = extract_keywords(jd_processed, num_keywords=40)
#     resume_tokens = set(resume_processed.split())

#     missing = [(word, freq) for word, freq in jd_keywords if word not in resume_tokens]
#     present = [(word, freq) for word, freq in jd_keywords if word in resume_tokens]
#     return missing[:top_n], present[:top_n]

from collections import Counter

import nltk
from nltk import pos_tag
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download required NLTK packages
packages = [
    "punkt_tab",
    "averaged_perceptron_tagger_eng",
    "wordnet",
]

for package in packages:
    try:
        nltk.download(package, quiet=True)
    except Exception:
        pass


LEMMATIZER = WordNetLemmatizer()

GENERIC_SKIP = {
    "experience",
    "work",
    "years",
    "year",
    "team",
    "role",
    "job",
    "company",
    "ability",
    "skill",
    "skills",
    "knowledge",
    "strong",
    "good",
    "using",
    "including",
    "responsibilities",
    "requirements",
    "preferred",
    "plus",
    "etc",
    "please",
    "must",
    "will",
    "candidate",
    "candidates",
}


def extract_keywords(text, num_keywords=25):
    """
    Extract important nouns and adjectives from text.
    """

    words = word_tokenize(text)

    words = [
        word
        for word in words
        if len(word) > 2 and word not in GENERIC_SKIP
    ]

    tagged_words = pos_tag(words)

    keywords = []

    for word, tag in tagged_words:

        if tag.startswith("NN") or tag.startswith("JJ"):

            keywords.append(
                LEMMATIZER.lemmatize(word)
            )

    frequency = Counter(keywords)

    return frequency.most_common(num_keywords)


def missing_keywords(resume_processed, jd_processed, top_n=15):
    """
    Find keywords present in the Job Description
    but missing in the Resume.
    """

    jd_keywords = extract_keywords(
        jd_processed,
        num_keywords=40
    )

    resume_tokens = set(
        resume_processed.split()
    )

    missing = []

    present = []

    for word, freq in jd_keywords:

        if word in resume_tokens:
            present.append((word, freq))
        else:
            missing.append((word, freq))

    return missing[:top_n], present[:top_n]