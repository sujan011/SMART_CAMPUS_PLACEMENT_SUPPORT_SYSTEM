from django.conf import settings
from django.db import models


class ChatSession(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_sessions")
    started_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=150, blank=True)  # auto-generated from first message


class ChatMessage(models.Model):
    class Sender(models.TextChoices):
        USER = "user", "User"
        BOT = "bot", "Bot"

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=Sender.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class ChatbotKnowledgeEntry(models.Model):
    """
    Admin-managed knowledge base the chatbot can be grounded on
    (placement process, eligibility rules, FAQs, etc.) -- 'Chatbot knowledge management'.
    """
    topic = models.CharField(max_length=150)
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ("placement_process", "Placement Process"),
            ("eligibility", "Eligibility"),
            ("companies", "Companies"),
            ("resume", "Resume"),
            ("interview_prep", "Interview Preparation"),
            ("recommendations", "Job Recommendations"),
            ("technical", "Technical Interview Questions"),
            ("aptitude", "Aptitude Guidance"),
        ],
        default="placement_process",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Chatbot Knowledge Entries"
