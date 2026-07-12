from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile")

    # Personal info
    full_name = models.CharField(max_length=150)
    profile_photo = models.ImageField(upload_to="profile_photos/", blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    address = models.TextField(blank=True)
    nationality = models.CharField(max_length=50, blank=True)
    languages_known = models.JSONField(default=list, blank=True)  # ["English", "Hindi"]
    about_me = models.TextField(blank=True)

    # Academic
    college = models.CharField(max_length=200, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    enrollment_no = models.CharField(max_length=50, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    passing_year = models.IntegerField(null=True, blank=True)
    current_year = models.CharField(max_length=50, blank=True)  # "Final Year (8th Sem)"

    # Social links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    # Verification (by placement officer)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.email


class AcademicRecord(models.Model):
    """10th, 12th, Bachelor's etc."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="academic_records")
    course = models.CharField(max_length=150)          # "B.Tech - Computer Science"
    institution = models.CharField(max_length=200)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    score = models.DecimalField(max_digits=5, decimal_places=2)   # CGPA or %
    score_type = models.CharField(max_length=10, choices=[("cgpa", "CGPA"), ("percent", "Percentage")])

    class Meta:
        ordering = ["-end_year"]


class Skill(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)
    proficiency = models.IntegerField(default=50)  # 0-100, shown as progress bar

    class Meta:
        unique_together = ("student", "name")


class Project(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    tech_stack = models.JSONField(default=list, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    project_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)


class Certification(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="certifications")
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=150)
    issue_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(blank=True)


class Achievement(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="achievements")
    title = models.CharField(max_length=200)         # "Smart India Hackathon 2024"
    description = models.CharField(max_length=255, blank=True)  # "Participant" / "Ranked in Top 50"
    icon = models.CharField(max_length=50, blank=True)
    date = models.DateField(null=True, blank=True)
