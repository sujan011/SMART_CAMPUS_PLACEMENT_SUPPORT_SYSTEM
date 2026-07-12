from django.conf import settings
from django.db import models


class ResumeTemplate(models.Model):
    name = models.CharField(max_length=100)
    preview_image = models.ImageField(upload_to="resume_templates/", blank=True, null=True)
    color_options = models.JSONField(default=list)  # ["blue", "green", "purple", "navy", "red"]
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Resume(models.Model):
    """One active resume per student, built from their profile + manual overrides."""
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resume")
    template = models.ForeignKey(ResumeTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    selected_color = models.CharField(max_length=20, default="blue")

    # Editable independently from the main profile (resume-specific wording)
    professional_title = models.CharField(max_length=150, blank=True)
    summary = models.TextField(max_length=500, blank=True)

    resume_file = models.FileField(upload_to="resumes/", blank=True, null=True)  # exported PDF
    resume_score = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resume: {self.student.email}"


class ATSAnalysis(models.Model):
    """Result of running a resume through the ATS Checker."""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ats_analyses")
    resume_file = models.FileField(upload_to="ats_uploads/")
    job_description = models.TextField(blank=True)  # optional: score against a specific JD

    overall_score = models.IntegerField(default=0)
    content_score = models.IntegerField(default=0)
    format_score = models.IntegerField(default=0)
    keyword_score = models.IntegerField(default=0)
    structure_score = models.IntegerField(default=0)

    matched_keywords = models.JSONField(default=list, blank=True)
    missing_keywords = models.JSONField(default=list, blank=True)

    # Per-section feedback, e.g. {"Contact Information": {"status": "Good", "note": "..."}, ...}
    section_feedback = models.JSONField(default=dict, blank=True)
    improvement_suggestions = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "ATS Analyses"
