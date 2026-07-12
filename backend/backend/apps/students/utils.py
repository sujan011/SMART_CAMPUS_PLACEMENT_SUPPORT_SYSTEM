"""
Centralized profile-completion logic.
Used by: Dashboard, Profile page, sidebar CTA card, Resume Builder gating.
"""

SECTION_WEIGHTS = {
    "personal_information": 15,
    "academic_details": 15,
    "skills": 15,
    "projects": 15,
    "certifications": 15,
    "resume": 15,
    "social_links": 10,
}


def calculate_profile_completion(student_profile):
    """
    Returns dict:
    {
        "overall_percent": 75,
        "sections": {
            "personal_information": 100,
            "academic_details": 100,
            "skills": 75,
            ...
        }
    }
    """
    sections = {}

    # Personal info: required core fields
    personal_fields = [
        student_profile.full_name,
        student_profile.date_of_birth,
        student_profile.gender,
        student_profile.address,
        student_profile.nationality,
    ]
    filled = sum(1 for f in personal_fields if f)
    sections["personal_information"] = int((filled / len(personal_fields)) * 100)

    # Academic details
    academic_fields = [
        student_profile.college,
        student_profile.branch,
        student_profile.enrollment_no,
        student_profile.cgpa,
    ]
    filled = sum(1 for f in academic_fields if f)
    has_records = student_profile.academic_records.exists()
    sections["academic_details"] = 100 if (filled == len(academic_fields) and has_records) else int(
        (filled / len(academic_fields)) * 100
    )

    # Skills: consider "complete" at 5+ skills
    skill_count = student_profile.skills.count()
    sections["skills"] = min(100, int((skill_count / 5) * 100)) if skill_count else 0

    # Projects: complete at 2+
    project_count = student_profile.projects.count()
    sections["projects"] = min(100, int((project_count / 2) * 100)) if project_count else 0

    # Certifications: complete at 2+
    cert_count = student_profile.certifications.count()
    sections["certifications"] = min(100, int((cert_count / 2) * 100)) if cert_count else 0

    # Resume
    has_resume = hasattr(student_profile.user, "resume") and bool(student_profile.user.resume.resume_file if hasattr(student_profile.user.resume, "resume_file") else False)
    sections["resume"] = 100 if has_resume else 0

    # Social links: linkedin + github + portfolio
    social_fields = [student_profile.linkedin_url, student_profile.github_url, student_profile.portfolio_url]
    filled = sum(1 for f in social_fields if f)
    sections["social_links"] = int((filled / len(social_fields)) * 100)

    overall = sum(
        (sections[key] / 100) * weight for key, weight in SECTION_WEIGHTS.items()
    )

    return {
        "overall_percent": round(overall),
        "sections": sections,
    }
