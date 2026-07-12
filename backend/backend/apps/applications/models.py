from django.conf import settings
from django.db import models
from apps.jobs.models import Job


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        UNDER_REVIEW = "under_review", "Under Review"
        INTERVIEW_SCHEDULED = "interview_scheduled", "Interview Scheduled"
        SELECTED = "selected", "Selected"
        REJECTED = "rejected", "Rejected"
        OFFER_RECEIVED = "offer_received", "Offer Received"

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    resume_file = models.FileField(upload_to="application_resumes/", blank=True, null=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.APPLIED)
    cover_note = models.TextField(blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "job")
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.student} -> {self.job.title} [{self.status}]"


class ApplicationStatusHistory(models.Model):
    """Audit trail of status changes, useful for the applications timeline UI."""
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="status_history")
    status = models.CharField(max_length=30, choices=Application.Status.choices)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    note = models.CharField(max_length=255, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]


class InterviewSchedule(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name="interview")
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    mode = models.CharField(max_length=20, choices=[("online", "Online"), ("offline", "Offline")], default="online")
    meeting_link = models.URLField(blank=True)
    venue = models.CharField(max_length=200, blank=True)
    interviewer_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
