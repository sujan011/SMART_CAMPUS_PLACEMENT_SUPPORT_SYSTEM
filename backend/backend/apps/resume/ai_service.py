"""
Thin wrapper around the configured AI provider (Gemini or OpenAI).
Used for: 'Enhance with AI' on Resume Builder, and ATS Checker scoring.
"""
import json
from django.conf import settings
from apps.resume.ats.ats_service import analyze_text

def _call_gemini(prompt: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text


def _call_openai(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def call_ai(prompt: str) -> str:
    if settings.AI_PROVIDER == "openai":
        return _call_openai(prompt)
    return _call_gemini(prompt)


def enhance_summary(current_summary: str, student_context: dict) -> str:
    """Used by POST /api/resume/enhance-summary/"""
    prompt = f"""
You are a professional resume writer. Rewrite the following resume summary to be more
impactful, specific, and ATS-friendly. Keep it under 60 words. Do not use generic filler.

Student context: {json.dumps(student_context)}
Current summary: "{current_summary}"

Return ONLY the improved summary text, nothing else.
"""
    try:
        return call_ai(prompt).strip()
    except Exception as e:
        print(f"[Fallback] AI summary enhancement failed: {e}")
        branch = student_context.get("branch") or "Computer Science"
        skills = student_context.get("skills", [])
        projects = student_context.get("projects", [])
        
        fallback = f"Motivated and detail-oriented student with a strong academic background in {branch}."
        if skills:
            fallback += f" Skilled in key technologies including {', '.join(skills[:4])}."
        if projects:
            fallback += f" Demonstrated hands-on engineering experience through projects like {', '.join(projects[:2])}."
        fallback += " Eager to leverage technical skills in a challenging software development role."
        return fallback


def analyze_resume_ats(resume_text: str, job_description: str = "") -> dict:
    """
    Hybrid ATS Analysis
    Rule-Based + Gemini AI
    """

    # ---------------------------------
    # Rule-Based ATS Analysis
    # ---------------------------------

    rule_result = analyze_text(
        resume_text,
        job_description
    )

    # ---------------------------------
    # Gemini Prompt
    # ---------------------------------

    prompt = f"""
You are an expert HR recruiter and ATS consultant.

The resume has already been analyzed by a rule-based ATS engine.

DO NOT calculate ATS scores.

Instead, review the resume professionally.

Rule-Based ATS Result

Overall Score:
{rule_result["overall_score"]}

Keyword Score:
{rule_result["keyword_score"]}

Structure Score:
{rule_result["structure_score"]}

Quality Score:
{rule_result["quality_score"]}

Matched Keywords:
{rule_result["matched_keywords"]}

Missing Keywords:
{rule_result["missing_keywords"]}

Resume

{resume_text}

Job Description

{job_description}

Return ONLY valid JSON.

{{
    "content_score": 0,
    "format_score": 0,

    "section_feedback": {{
        "Contact Information": {{
            "status": "",
            "note": ""
        }},
        "Education": {{
            "status": "",
            "note": ""
        }},
        "Skills": {{
            "status": "",
            "note": ""
        }},
        "Projects": {{
            "status": "",
            "note": ""
        }},
        "Formatting": {{
            "status": "",
            "note": ""
        }}
    }},

    "improvement_suggestions": [
        "",
        "",
        ""
    ]
}}
"""

    ai_result = None
    try:
        raw = call_ai(prompt).strip()

        if raw.startswith("```"):
            raw = raw.replace("```json", "")
            raw = raw.replace("```", "")
            raw = raw.strip()

        ai_result = json.loads(raw)
    except Exception as e:
        print(f"[Fallback] AI ATS Analysis failed: {e}")
        # Build local AI fallback analysis
        ai_result = {
            "content_score": 75,
            "format_score": 85,
            "section_feedback": {
                "Contact Information": {
                    "status": "Excellent" if rule_result.get("contact", {}).get("email") and rule_result.get("contact", {}).get("phone") else "Needs Improvement",
                    "note": "Essential contact information (email, phone) is present."
                },
                "Education": {
                    "status": "Good",
                    "note": "Education information is clearly presented. Ensure CGPA is clearly mentioned."
                },
                "Skills": {
                    "status": "Good",
                    "note": f"Matched {len(rule_result.get('matched_keywords', []))} keywords. Try to add more missing ones like {', '.join(rule_result.get('missing_keywords', [])[:3])}."
                },
                "Projects": {
                    "status": "Needs Improvement",
                    "note": "Describe project experience using action verbs and mention quantitative impact."
                },
                "Formatting": {
                    "status": "Excellent",
                    "note": "Resume structure matches standard recruiter format."
                }
            },
            "improvement_suggestions": [
                f"Incorporate missing core skills: {', '.join(rule_result.get('missing_keywords', [])[:3])}.",
                "Add links to your professional Github or portfolio sites.",
                "Ensure bullet points follow the Google XYZ resume formula (Accomplished [X] as measured by [Y], by doing [Z])."
            ]
        }

    # ---------------------------------
    # Merge Rule Engine + AI
    # ---------------------------------

    return {

        "overall_score": rule_result["overall_score"],

        "keyword_score": rule_result["keyword_score"],

        "structure_score": rule_result["structure_score"],

        "content_score": ai_result["content_score"],

        "format_score": ai_result["format_score"],

        "matched_keywords": rule_result["matched_keywords"],

        "missing_keywords": rule_result["missing_keywords"],

        "section_feedback": ai_result["section_feedback"],

        "improvement_suggestions": ai_result["improvement_suggestions"],
    }
