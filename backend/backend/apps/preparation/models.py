from django.conf import settings
from django.db import models


class PreparationCategory(models.Model):
    """Aptitude, Technical, Coding Practice, HR Questions, Mock Interviews, Company Wise"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True)
    description = models.CharField(max_length=255, blank=True)
    total_topics = models.IntegerField(default=0)
    total_problems = models.IntegerField(default=0)  # used for Coding Practice card ("450+ Problems")
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "Preparation Categories"
        ordering = ["order"]

    def __str__(self):
        return self.name


class Topic(models.Model):
    """e.g. 'Data Structures - Arrays', 'Verbal Ability - Reading Comprehension'"""
    category = models.ForeignKey(PreparationCategory, on_delete=models.CASCADE, related_name="topics")
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=255, blank=True)  # "Learn arrays and solve problems"
    tag = models.CharField(max_length=50, blank=True)  # Technical / Aptitude / Coding / HR
    difficulty = models.CharField(max_length=20, choices=[("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")], default="medium")
    content = models.TextField(blank=True)  # markdown/HTML content or reference to external resource
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class StudentTopicProgress(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="topic_progress")
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="student_progress")
    progress_percent = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    last_attempted_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "topic")


class StudentStreak(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="streak")
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    daily_goal_total = models.IntegerField(default=5)
    daily_goal_completed = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)


class MockInterview(models.Model):
    class InterviewType(models.TextChoices):
        TECHNICAL = "technical", "Technical"
        HR = "hr", "HR"
        AI = "ai", "AI Mock"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mock_interviews")
    title = models.CharField(max_length=200)  # "Frontend Developer Mock Interview"
    interview_type = models.CharField(max_length=20, choices=InterviewType.choices, default=InterviewType.AI)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    meeting_link = models.URLField(blank=True)
    ai_feedback = models.JSONField(default=dict, blank=True)  # populated after AI mock interview completes
    score = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["scheduled_at"]


class SkillFocusArea(models.Model):
    """'Top Skills to Focus' cards -- DSA, System Design, DBMS, OS, Behavioral"""
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    importance = models.CharField(max_length=10, choices=[("high", "High"), ("medium", "Medium"), ("low", "Low")])
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]
