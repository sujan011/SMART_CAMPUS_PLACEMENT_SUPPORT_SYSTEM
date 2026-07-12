from rest_framework import serializers
from .models import (
    PreparationCategory, Topic, StudentTopicProgress,
    StudentStreak, MockInterview, SkillFocusArea,
)


class CategoryCardSerializer(serializers.ModelSerializer):
    """Top cards row: Aptitude / Technical / Coding Practice / HR / Mock / Company Wise"""
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = PreparationCategory
        fields = ["id", "name", "slug", "icon", "description", "total_topics", "total_problems", "progress_percent"]

    def get_progress_percent(self, obj):
        student = self.context["request"].user
        progresses = StudentTopicProgress.objects.filter(student=student, topic__category=obj)
        total_topics = obj.topics.count()
        if not total_topics:
            return 0
        completed_weight = sum(p.progress_percent for p in progresses)
        return int(completed_weight / total_topics) if total_topics else 0


class TopicSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ["id", "title", "subtitle", "tag", "difficulty", "content", "progress_percent", "status"]

    def _get_progress(self, obj):
        student = self.context["request"].user
        return StudentTopicProgress.objects.filter(student=student, topic=obj).first()

    def get_progress_percent(self, obj):
        progress = self._get_progress(obj)
        return progress.progress_percent if progress else 0

    def get_status(self, obj):
        progress = self._get_progress(obj)
        return progress.status if progress else "not_started"


class RecommendedTopicSerializer(serializers.ModelSerializer):
    """'Recommended for You' list -- includes category name for the tag pill + action label"""
    category_name = serializers.CharField(source="category.name", read_only=True)
    progress_percent = serializers.SerializerMethodField()
    action_label = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ["id", "title", "subtitle", "tag", "category_name", "progress_percent", "action_label"]

    def get_progress_percent(self, obj):
        student = self.context["request"].user
        progress = StudentTopicProgress.objects.filter(student=student, topic=obj).first()
        return progress.progress_percent if progress else 0

    def get_action_label(self, obj):
        percent = self.get_progress_percent(obj)
        if percent == 0:
            return "Practice"
        if percent >= 100:
            return "Review"
        return "Continue"


class StudentStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentStreak
        fields = ["current_streak", "longest_streak", "daily_goal_total", "daily_goal_completed"]


class MockInterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockInterview
        fields = [
            "id", "title", "interview_type", "scheduled_at", "duration_minutes",
            "status", "meeting_link", "ai_feedback", "score",
        ]


class SkillFocusAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillFocusArea
        fields = ["id", "name", "description", "importance"]


class UpdateTopicProgressSerializer(serializers.Serializer):
    progress_percent = serializers.IntegerField(min_value=0, max_value=100)
