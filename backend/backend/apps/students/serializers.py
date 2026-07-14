from rest_framework import serializers
from .models import StudentProfile, AcademicRecord, Skill, Project, Certification, Achievement
from .utils import calculate_profile_completion


class AcademicRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicRecord
        fields = ["id", "course", "institution", "start_year", "end_year", "score", "score_type"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "proficiency"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "title", "description", "tech_stack", "start_date", "end_date", "project_url", "github_url"]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ["id", "title", "issuer", "issue_date", "credential_url"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "title", "description", "icon", "date"]


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    academic_records = AcademicRecordSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id", "email", "username", "phone", "role", "is_active", "full_name", "profile_photo", "date_of_birth", "gender",
            "address", "nationality", "languages_known", "about_me",
            "college", "branch", "enrollment_no", "cgpa", "passing_year", "current_year",
            "linkedin_url", "github_url", "portfolio_url", "is_verified",
            "academic_records", "skills", "projects", "certifications", "achievements",
            "profile_completion", "created_at", "updated_at",
        ]
        read_only_fields = ["is_verified", "created_at", "updated_at"]

    def get_profile_completion(self, obj):
        return calculate_profile_completion(obj)


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Used for updating the student's profile.
    """

    class Meta:
        model = StudentProfile
        fields = [
            "full_name",
            "profile_photo",
            "date_of_birth",
            "gender",
            "address",
            "nationality",
            "languages_known",
            "about_me",
            "college",
            "branch",
            "enrollment_no",
            "cgpa",
            "passing_year",
            "current_year",
            "linkedin_url",
            "github_url",
            "portfolio_url",
        ]

    # ----------------------------
    # CGPA Validation
    # ----------------------------

    def validate_cgpa(self, value):

        if value is None:
            return value

        if value < 0 or value > 10:
            raise serializers.ValidationError(
                "CGPA must be between 0 and 10."
            )

        return value

    # ----------------------------
    # Passing Year Validation
    # ----------------------------

    def validate_passing_year(self, value):

        if value is None:
            return value

        if value < 2020 or value > 2035:
            raise serializers.ValidationError(
                "Passing year must be between 2020 and 2035."
            )

        return value