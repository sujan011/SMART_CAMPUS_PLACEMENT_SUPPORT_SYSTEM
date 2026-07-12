import re


EMAIL_PATTERN = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

PHONE_PATTERN = r"(\+?\d{1,3}[- ]?)?\d{10}"

LINKEDIN_PATTERN = r"linkedin\.com"

GITHUB_PATTERN = r"github\.com"


def check_contact_information(text):
    """
    Checks whether the resume contains basic contact details.
    """

    result = {
        "email": False,
        "phone": False,
        "linkedin": False,
        "github": False,
    }

    if re.search(EMAIL_PATTERN, text, re.IGNORECASE):
        result["email"] = True

    if re.search(PHONE_PATTERN, text):
        result["phone"] = True

    if re.search(LINKEDIN_PATTERN, text, re.IGNORECASE):
        result["linkedin"] = True

    if re.search(GITHUB_PATTERN, text, re.IGNORECASE):
        result["github"] = True

    return result


def check_resume_sections(text):
    """
    Detects important resume sections.
    """

    text = text.lower()

    sections = {
        "education": False,
        "skills": False,
        "projects": False,
        "experience": False,
        "certifications": False,
        "achievements": False,
    }

    if "education" in text:
        sections["education"] = True

    if "skills" in text:
        sections["skills"] = True

    if "project" in text:
        sections["projects"] = True

    if "experience" in text:
        sections["experience"] = True

    if "certification" in text:
        sections["certifications"] = True

    if "achievement" in text:
        sections["achievements"] = True

    return sections


def calculate_structure_score(contact, sections):
    """
    Calculates a structure score out of 100.
    """

    score = 0

    # Contact Information (40 marks)

    score += 10 if contact["email"] else 0
    score += 10 if contact["phone"] else 0
    score += 10 if contact["linkedin"] else 0
    score += 10 if contact["github"] else 0

    # Resume Sections (60 marks)

    score += 10 if sections["education"] else 0
    score += 10 if sections["skills"] else 0
    score += 10 if sections["projects"] else 0
    score += 10 if sections["experience"] else 0
    score += 10 if sections["certifications"] else 0
    score += 10 if sections["achievements"] else 0

    return score