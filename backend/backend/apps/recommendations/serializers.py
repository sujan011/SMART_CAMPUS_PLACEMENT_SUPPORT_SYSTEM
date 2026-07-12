from rest_framework import serializers
from apps.jobs.serializers import JobListSerializer
from .models import RecommendationLog


class RecommendationSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    match_percent = serializers.SerializerMethodField()

    class Meta:
        model = RecommendationLog
        fields = ["id", "job", "match_percent", "reason", "generated_at"]

    def get_match_percent(self, obj):
        return round(obj.match_score * 100)
