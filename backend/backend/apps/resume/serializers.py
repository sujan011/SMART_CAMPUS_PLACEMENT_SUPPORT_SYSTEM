from rest_framework import serializers
from .models import ResumeTemplate, Resume, ATSAnalysis


class ResumeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeTemplate
        fields = ["id", "name", "preview_image", "color_options"]


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id", "template", "selected_color", "professional_title", "summary",
            "resume_file", "resume_score", "updated_at",
        ]
        read_only_fields = ["resume_file", "resume_score", "updated_at"]


class EnhanceSummarySerializer(serializers.Serializer):
    summary = serializers.CharField()


class ATSAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ATSAnalysis
        fields = [
            "id", "resume_file", "job_description", "overall_score", "content_score",
            "format_score", "keyword_score", "structure_score", "matched_keywords",
            "missing_keywords", "section_feedback", "improvement_suggestions", "created_at",
        ]
        read_only_fields = [
            "overall_score", "content_score", "format_score", "keyword_score",
            "structure_score", "matched_keywords", "missing_keywords",
            "section_feedback", "improvement_suggestions", "created_at",
        ]


class ATSAnalyzeRequestSerializer(serializers.Serializer):
    resume_file = serializers.FileField()
    job_description = serializers.CharField(required=False, allow_blank=True)
