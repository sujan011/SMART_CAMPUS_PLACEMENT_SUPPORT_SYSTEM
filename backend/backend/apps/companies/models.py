from django.conf import settings
from django.db import models


class Company(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    headquarters = models.CharField(max_length=150, blank=True)
    company_size = models.CharField(max_length=50, blank=True)  # "51-200 employees"

    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="companies_added")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class EligibilityCriteria(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="eligibility_criteria")
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    max_backlogs = models.IntegerField(default=0)
    eligible_branches = models.JSONField(default=list)  # ["CSE", "IT", "ECE"]
    eligible_passing_years = models.JSONField(default=list)  # [2026, 2027]


class PlacementDrive(models.Model):
    class Status(models.TextChoices):
        UPCOMING = "upcoming", "Upcoming"
        ONGOING = "ongoing", "Ongoing"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="drives")
    title = models.CharField(max_length=200)
    drive_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    registration_deadline = models.DateTimeField()
    venue = models.CharField(max_length=200, blank=True)  # "Online" or physical venue
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
