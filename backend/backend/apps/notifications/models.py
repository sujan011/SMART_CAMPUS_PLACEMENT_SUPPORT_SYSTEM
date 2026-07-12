from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION_UPDATE = "application_update", "Application Update"
        NEW_JOB = "new_job", "New Job"
        INTERVIEW_SCHEDULED = "interview_scheduled", "Interview Scheduled"
        DRIVE_ANNOUNCEMENT = "drive_announcement", "Placement Drive Announcement"
        SYSTEM = "system", "System"

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notif_type = models.CharField(max_length=30, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    link = models.CharField(max_length=255, blank=True)  # frontend route to deep-link to, e.g. "/applications/12"
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
