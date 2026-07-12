from rest_framework import serializers
from .models import Company, EligibilityCriteria, PlacementDrive


class EligibilityCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EligibilityCriteria
        fields = ["id", "min_cgpa", "max_backlogs", "eligible_branches", "eligible_passing_years"]


class PlacementDriveSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = PlacementDrive
        fields = ["id", "company", "company_name", "title", "drive_date", "status", "registration_deadline", "venue", "created_at"]
        read_only_fields = ["created_at"]


class CompanySerializer(serializers.ModelSerializer):
    eligibility_criteria = EligibilityCriteriaSerializer(many=True, read_only=True)
    drives = PlacementDriveSerializer(many=True, read_only=True)
    open_jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id", "name", "logo", "website", "industry", "description",
            "headquarters", "company_size", "eligibility_criteria", "drives",
            "open_jobs_count", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_open_jobs_count(self, obj):
        return obj.jobs.filter(is_active=True).count()
