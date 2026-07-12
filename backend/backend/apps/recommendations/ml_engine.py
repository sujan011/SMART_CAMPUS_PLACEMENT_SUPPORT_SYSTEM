"""
Content-based job recommendation engine.

Builds a text profile per student (skills + projects + certifications + department)
and per job (required_skills + description + title), vectorizes both with TF-IDF,
and ranks jobs by cosine similarity. Simple, explainable, and good enough for a
final-year project -- swap for a proper collaborative-filtering model later if needed.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from apps.jobs.models import Job
from .models import RecommendationLog


def build_student_text(student_profile) -> str:
    parts = [
        student_profile.branch,
        " ".join(s.name for s in student_profile.skills.all()),
        " ".join(p.title + " " + p.description for p in student_profile.projects.all()),
        " ".join(c.title for c in student_profile.certifications.all()),
    ]
    return " ".join(filter(None, parts))


def build_job_text(job: Job) -> str:
    parts = [
        job.title,
        " ".join(job.required_skills),
        job.description,
    ]
    return " ".join(filter(None, parts))


def generate_recommendations(student_profile, top_n: int = 10):
    """
    Returns a list of (job, score, reason) tuples, best matches first.
    Only considers jobs the student meets minimum CGPA eligibility for.
    """
    eligible_jobs = list(
        Job.objects.filter(is_active=True, min_cgpa__lte=(student_profile.cgpa or 0)).select_related("company")
    )
    if not eligible_jobs:
        return []

    student_text = build_student_text(student_profile)
    job_texts = [build_job_text(j) for j in eligible_jobs]

    corpus = [student_text] + job_texts
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    student_vector = tfidf_matrix[0:1]
    job_vectors = tfidf_matrix[1:]
    similarities = cosine_similarity(student_vector, job_vectors)[0]

    student_skills = set(s.name.lower() for s in student_profile.skills.all())

    ranked = sorted(zip(eligible_jobs, similarities), key=lambda x: x[1], reverse=True)[:top_n]

    results = []
    for job, score in ranked:
        matched_skills = student_skills & set(s.lower() for s in job.required_skills)
        reason = (
            f"Matches your skills: {', '.join(sorted(matched_skills)[:3])}"
            if matched_skills else "Based on your profile and department"
        )
        results.append((job, float(score), reason))

    return results


def save_recommendations(student, student_profile, top_n: int = 10):
    """Regenerates and persists recommendations -- call from a management command or signal."""
    RecommendationLog.objects.filter(student=student).delete()
    recs = generate_recommendations(student_profile, top_n)
    RecommendationLog.objects.bulk_create([
        RecommendationLog(student=student, job=job, match_score=score, reason=reason)
        for job, score, reason in recs
    ])
    return recs
