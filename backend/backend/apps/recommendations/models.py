from django.conf import settings
from django.db import models
from apps.jobs.models import Job


class RecommendationLog(models.Model):
    """Stores generated recommendations so the dashboard doesn't recompute on every request."""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recommendation_logs")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="recommended_to")
    match_score = models.FloatField()  # 0.0 - 1.0 cosine similarity or weighted score
    reason = models.CharField(max_length=255, blank=True)  # "Matches your skills: React, Node.js"
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-match_score"]
        unique_together = ("student", "job")
