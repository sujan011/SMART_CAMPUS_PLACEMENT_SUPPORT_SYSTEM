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
        return _call_ai(prompt).strip()
    except Exception as e:
        print(f"[Fallback] Chatbot AI execution failed: {e}")
        if knowledge:
            return f"[KB Answer] {knowledge[0].answer}"
        return "I am having trouble connecting to my AI brain. Please try contacting the placement office directly."
