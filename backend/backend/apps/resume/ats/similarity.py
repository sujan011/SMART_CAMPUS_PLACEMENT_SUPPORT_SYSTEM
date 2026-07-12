# def similarity_score(resume_text: str, jd_text: str):
#     """
#     Cosine similarity between resume and JD.

#     NOTE: With only two documents, classic TF-IDF's IDF term barely helps and can
#     actually *downweight* words that appear in both texts -- exactly the overlap
#     we want to reward. Plain term-frequency (CountVectorizer) is more reliable
#     for this two-document comparison, so we use that instead of TF-IDF here.
#     """
#     r_processed = preprocess(resume_text)
#     j_processed = preprocess(jd_text)

#     if not r_processed.strip() or not j_processed.strip():
#         return 0.0, r_processed, j_processed

#     vectorizer = CountVectorizer()
#     vectors = vectorizer.fit_transform([r_processed, j_processed])
#     score = cosine_similarity(vectors[0], vectors[1])[0][0] * 100
#     return round(score, 2), r_processed, j_processed

from sklearn.feature_extraction.text import CountVectorizer

from sklearn.metrics.pairwise import cosine_similarity

from .preprocessing import preprocess


def similarity_score(resume_text, job_description):

    resume_processed = preprocess(resume_text)

    jd_processed = preprocess(job_description)

    if not resume_processed.strip():

        return 0, "", ""

    if not jd_processed.strip():

        return 0, "", ""

    vectorizer = CountVectorizer()

    vectors = vectorizer.fit_transform([resume_processed, jd_processed])

    score = cosine_similarity(vectors[0], vectors[1])[0][0]

    score = round(score * 100, 2)

    return score, resume_processed, jd_processed