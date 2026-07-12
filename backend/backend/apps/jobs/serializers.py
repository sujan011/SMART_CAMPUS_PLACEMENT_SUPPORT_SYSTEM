from rest_framework import serializers
from apps.companies.serializers import CompanySerializer
from .models import Job, SavedJob


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job cards / search results grid."""
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_logo = serializers.ImageField(source="company.logo", read_only=True)
    is_saved = serializers.SerializerMethodField()
    match_percent = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "title", "company_name", "company_logo", "job_type",
            "location", "is_remote", "salary_min", "salary_max",
            "application_deadline", "is_saved", "match_percent", "created_at",
        ]

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(student=request.user, job=obj).exists()
        return False

    def get_match_percent(self, obj):
        # Simple placeholder — real logic lives in apps.recommendations
        
        request = self.context.get("request")

        if (
            not request
            or not request.user.is_authenticated
            or request.user.role != "student"
            or not hasattr(request.user, "student_profile")
        ):
            return None
        
        student = request.user.student_profile
        student_skills = set(s.name.lower() for s in student.skills.all())
        required = set(s.lower() for s in obj.required_skills)
        if not required:
            return None
        overlap = len(student_skills & required)
        return int((overlap / len(required)) * 100)


class JobDetailSerializer(serializers.ModelSerializer):
    """Full serializer for the Job Details page."""
    company = CompanySerializer(read_only=True)
    is_saved = serializers.SerializerMethodField()
    similar_jobs = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "title", "job_type", "description", "responsibilities",
            "required_skills", "benefits", "min_cgpa", "eligible_branches",
            "salary_min", "salary_max", "location", "is_remote",
            "application_deadline", "is_active", "company", "is_saved",
            "similar_jobs", "created_at",
        ]

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(student=request.user, job=obj).exists()
        return False

    def get_similar_jobs(self, obj):
        similar = Job.objects.filter(
            company=obj.company, is_active=True
        ).exclude(id=obj.id)[:4]
        return JobListSerializer(similar, many=True, context=self.context).data


class JobWriteSerializer(serializers.ModelSerializer):
    """Used by placement officers to create/edit job postings."""
    class Meta:
        model = Job
        fields = [
            "id", "company", "drive", "title", "job_type", "description",
            "responsibilities", "required_skills", "benefits", "min_cgpa",
            "eligible_branches", "salary_min", "salary_max", "location",
            "is_remote", "application_deadline", "is_active",
        ]


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ["id", "job", "saved_at"]
