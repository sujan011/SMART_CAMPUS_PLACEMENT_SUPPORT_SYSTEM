import re


def calculate_quality_score(text):
    """
    Calculates Resume Quality Score out of 100.
    """

    text_lower = text.lower()

    score = 0

    details = {}

    # --------------------------
    # Resume Length (20 Marks)
    # --------------------------

    words = len(text.split())

    if words >= 300:
        score += 20
        details["resume_length"] = "Excellent"

    elif words >= 200:
        score += 15
        details["resume_length"] = "Good"

    elif words >= 100:
        score += 10
        details["resume_length"] = "Average"

    else:
        score += 5
        details["resume_length"] = "Too Short"

    # --------------------------
    # Skills (20 Marks)
    # --------------------------

    skills = [
        "python",
        "java",
        "c",
        "c++",
        "javascript",
        "react",
        "django",
        "mysql",
        "html",
        "css",
        "bootstrap",
        "node",
        "express",
        "git",
        "github",
    ]

    found_skills = []

    for skill in skills:
        pattern = r"\b" + re.escape(skill) + r"\b"

        if re.search(pattern, text_lower):
            found_skills.append(skill)

    skill_count = len(found_skills)

    if skill_count >= 8:
        score += 20
    elif skill_count >= 5:
        score += 15
    elif skill_count >= 3:
        score += 10
    else:
        score += 5

    details["skills_found"] = found_skills

    # --------------------------
    # Projects (20 Marks)
    # --------------------------

    project_count = len(re.findall(r"project", text_lower))

    if project_count >= 3:
        score += 20
    elif project_count >= 2:
        score += 15
    elif project_count >= 1:
        score += 10
    else:
        score += 0

    details["project_count"] = project_count

    # --------------------------
    # Certifications (20 Marks)
    # --------------------------

    cert_count = len(re.findall(r"certification", text_lower))

    if cert_count >= 2:
        score += 20
    elif cert_count == 1:
        score += 10

    details["certifications"] = cert_count

    # --------------------------
    # Achievements (20 Marks)
    # --------------------------

    achievement_count = len(re.findall(r"achievement", text_lower))

    if achievement_count >= 2:
        score += 20
    elif achievement_count == 1:
        score += 10

    details["achievements"] = achievement_count

    return score, details