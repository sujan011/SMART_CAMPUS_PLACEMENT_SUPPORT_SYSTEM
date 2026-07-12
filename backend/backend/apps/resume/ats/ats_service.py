from .similarity import similarity_score
from .keyword import missing_keywords
from .section_checker import (
    check_contact_information,
    check_resume_sections,
    calculate_structure_score,
)
from .quality_checker import calculate_quality_score


def analyze_text(resume_text, job_description):
    """
    Complete Rule-Based ATS Analysis
    """

    # ----------------------------
    # Similarity Score
    # ----------------------------

    similarity, resume_processed, jd_processed = similarity_score(
        resume_text,
        job_description
    )

    # ----------------------------
    # Keyword Analysis
    # ----------------------------

    missing, matched = missing_keywords(
        resume_processed,
        jd_processed
    )

    # ----------------------------
    # Contact Information
    # ----------------------------

    contact = check_contact_information(resume_text)

    # ----------------------------
    # Resume Sections
    # ----------------------------

    sections = check_resume_sections(resume_text)

    # ----------------------------
    # Structure Score
    # ----------------------------

    structure_score = calculate_structure_score(
        contact,
        sections
    )

    # ----------------------------
    # Resume Quality
    # ----------------------------

    quality_score, quality_details = calculate_quality_score(
        resume_text
    )

    # ----------------------------
    # Keyword Score
    # ----------------------------

    total_keywords = len(matched) + len(missing)

    if total_keywords == 0:
        keyword_score = 0
    else:
        keyword_score = round(
            (len(matched) / total_keywords) * 100,
            2
        )

    # ----------------------------
    # Final Overall Score
    # ----------------------------

    overall_score = round(
        (
            keyword_score * 0.40
            + structure_score * 0.30
            + quality_score * 0.30
        ),
        2
    )

    return {

        "overall_score": overall_score,

        "keyword_score": keyword_score,

        "structure_score": structure_score,

        "quality_score": quality_score,

        "matched_keywords": [word for word, _ in matched],

        "missing_keywords": [word for word, _ in missing],

        "contact": contact,

        "sections": sections,

        "quality_details": quality_details,

        "resume_processed": resume_processed,

        "jd_processed": jd_processed,
    }