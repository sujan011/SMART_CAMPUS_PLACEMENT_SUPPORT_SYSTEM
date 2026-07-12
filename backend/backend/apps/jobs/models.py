from django.conf import settings
from django.db import models
from apps.companies.models import Company, PlacementDrive


class Job(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = "full_time", "Full Time"
        INTERNSHIP = "internship", "Internship"
        PPO = "ppo", "PPO"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    drive = models.ForeignKey(PlacementDrive, on_delete=models.SET_NULL, null=True, blank=True, related_name="jobs")

    title = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    description = models.TextField()
    responsibilities = models.JSONField(default=list, blank=True)
    required_skills = models.JSONField(default=list, blank=True)  # ["React", "Node.js"]
    benefits = models.JSONField(default=list, blank=True)

    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    eligible_branches = models.JSONField(default=list, blank=True)

    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # LPA
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=150, blank=True)
    is_remote = models.BooleanField(default=False)

    application_deadline = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} @ {self.company.name}"


class SavedJob(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_jobs")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="saved_by")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "job")
