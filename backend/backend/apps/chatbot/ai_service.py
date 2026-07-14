"""
AI Helpdesk logic. Floating chat widget on every student page (per spec).
Grounds the model's answer on ChatbotKnowledgeEntry rows + the student's own data
(applications, profile) so it can answer things like 'why was I rejected' contextually.
"""
from django.conf import settings
from .models import ChatbotKnowledgeEntry


def _call_gemini(prompt: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    return model.generate_content(prompt).text


def _call_openai(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def _call_ai(prompt: str) -> str:
    if settings.AI_PROVIDER == "openai":
        return _call_openai(prompt)
    return _call_gemini(prompt)


def build_context_block(student) -> str:
    """Pulls lightweight student context so answers can be personalized."""
    lines = []
    if hasattr(student, "student_profile"):
        profile = student.student_profile
        lines.append(f"Branch: {profile.branch}, CGPA: {profile.cgpa}, Passing year: {profile.passing_year}")
    applications = student.applications.select_related("job", "job__company")[:5]
    if applications:
        lines.append("Recent applications: " + "; ".join(
            f"{a.job.title} at {a.job.company.name} ({a.status})" for a in applications
        ))
    return "\n".join(lines)


def get_relevant_knowledge(message: str, limit: int = 5):
    """Naive keyword-overlap retrieval. Swap for embeddings/vector search as the KB grows."""
    words = set(message.lower().split())
    entries = ChatbotKnowledgeEntry.objects.filter(is_active=True)
    scored = []
    for entry in entries:
        overlap = len(words & set((entry.question + " " + entry.topic).lower().split()))
        if overlap:
            scored.append((overlap, entry))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [entry for _, entry in scored[:limit]]


def get_rule_based_response(student, message: str) -> str:
    """Smart keyword-matching fallback system for offline/local usage."""
    msg = message.lower()
    
    # Greetings
    if any(g in msg for g in ["hi", "hello", "hey", "who are you", "help"]):
        name = student.username
        if hasattr(student, "student_profile") and student.student_profile.full_name:
            name = student.student_profile.full_name
        return (
            f"Hello {name}! I am your Smart Campus Placement Assistant. How can I help you today?\n\n"
            f"You can ask me about:\n"
            f"- **Placement Process** (how campus placements work)\n"
            f"- **Job Eligibility Criteria** (CGPA, verification status)\n"
            f"- **Resume Building** tips & **ATS Checker** guide\n"
            f"- **Interview Preparation** (Aptitude, Coding, HR rounds)\n"
            f"- **Your Application Status** (recently applied drives)"
        )

    # Profile & Eligibility
    if any(k in msg for k in ["eligib", "criteria", "cgpa", "verified", "status"]):
        if hasattr(student, "student_profile"):
            profile = student.student_profile
            status_str = "Verified" if profile.is_verified else "Pending Review"
            cgpa_str = str(profile.cgpa) if profile.cgpa is not None else "Not updated yet"
            return (
                f"Your placement profile details:\n"
                f"- **Verification Status**: {status_str}\n"
                f"- **Department/Branch**: {profile.branch or 'Not specified'}\n"
                f"- **Current CGPA**: {cgpa_str}\n\n"
                f"Most company drives require a 'Verified' profile status. "
                f"Ensure your academic records, skills, and projects are updated in your Profile page."
            )
        return "I couldn't locate your student profile in the database. Please verify your profile info."

    # Applications
    if any(k in msg for k in ["application", "applied", "drives", "job"]):
        apps = student.applications.select_related("job", "job__company")[:5]
        if apps:
            app_list = []
            for a in apps:
                status_formatted = a.status.replace('_', ' ').title()
                app_list.append(f"- **{a.job.title}** at *{a.job.company.name}* (Status: `{status_formatted}`)")
            return "Here are your recent job application statuses:\n" + "\n".join(app_list) + "\n\nYou can browse more job drives in the 'Search Jobs' page."
        return "You have not applied to any job drives yet. Visit the 'Search Jobs' page to view active placement opportunities."

    # Resume & ATS
    if any(k in msg for k in ["resume", "ats", "cv"]):
        return (
            "To optimize your resume matching:\n"
            "1. Build a professional resume under **Resume Builder**.\n"
            "2. Paste a job description into the **ATS Checker** to analyze matching keywords and your compatibility score before applying."
        )

    # Interview Prep
    if any(k in msg for k in ["interview", "prep", "coding", "aptitude", "hr"]):
        return (
            "For interview prep, use the **Interview Preparation** section in the sidebar. It contains study material and mock questions for:\n"
            "- **Aptitude**: Quantitative, Logical, and Verbal Ability\n"
            "- **Technical**: core topics (OOPs, DBMS, OS, DSA)\n"
            "- **Coding Practice**: coding challenges and SQL queries\n"
            "- **HR Questions**: common questions with model answers"
        )

    # Default fallback
    return (
        "I am currently running in local backup mode. For this question, you can check the general FAQs in the sidebar or ask the Placement Officer. "
        "Let me know if you need help with your profile, applications, or general placement guidelines!"
    )


def get_bot_reply(student, message: str, history: list) -> str:
    knowledge = get_relevant_knowledge(message)
    knowledge_block = "\n".join(f"Q: {k.question}\nA: {k.answer}" for k in knowledge) or "No specific KB entry matched."
    history_block = "\n".join(f"{h['sender']}: {h['content']}" for h in history[-6:])
    student_context = build_context_block(student)

    prompt = f"""
You are the AI Helpdesk for a college placement portal. Answer the student's question
helpfully and concisely. Only use the knowledge base and student context given below;
if you don't know, say so and suggest contacting the placement office.

Knowledge base:
{knowledge_block}

Student context:
{student_context}

Conversation so far:
{history_block}

Student's new message: "{message}"

Reply as the assistant, in plain text, no markdown headers.
"""
    try:
        # Check if the API key is placeholder
        if "your-gemini" in settings.GEMINI_API_KEY or "your-openai" in settings.OPENAI_API_KEY:
            raise Exception("AI API keys are not configured. Using rule-based fallback.")
            
        return _call_ai(prompt).strip()
    except Exception as e:
        print(f"[Fallback] Chatbot AI execution failed: {e}")
        if knowledge:
            return f"[Seeded KB] {knowledge[0].answer}"
        return get_rule_based_response(student, message)

