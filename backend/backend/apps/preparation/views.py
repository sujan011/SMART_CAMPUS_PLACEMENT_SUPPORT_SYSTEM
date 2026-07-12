from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    PreparationCategory, Topic, StudentTopicProgress,
    StudentStreak, MockInterview, SkillFocusArea,
)
from .serializers import (
    CategoryCardSerializer, TopicSerializer, RecommendedTopicSerializer,
    StudentStreakSerializer, MockInterviewSerializer, SkillFocusAreaSerializer,
    UpdateTopicProgressSerializer,
)


class PreparationDashboardView(APIView):
    """
    GET /api/preparation/dashboard/

    Single aggregated payload for the whole Interview Preparation page:
    category cards, recommended-for-you list, streak, upcoming mock interview,
    top skills to focus, and an overall progress percentage.
    Avoids the frontend firing 6+ separate requests for one screen.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        context = {"request": request}
        student = request.user

        categories = PreparationCategory.objects.all()
        category_data = CategoryCardSerializer(categories, many=True, context=context).data

        # Recommended: topics the student has started but not finished, or newest topics in weak categories
        in_progress_topic_ids = StudentTopicProgress.objects.filter(
            student=student, status=StudentTopicProgress.Status.IN_PROGRESS
        ).values_list("topic_id", flat=True)
        recommended_topics = Topic.objects.filter(id__in=in_progress_topic_ids)[:4]
        if recommended_topics.count() < 4:
            extra = Topic.objects.exclude(id__in=in_progress_topic_ids)[: 4 - recommended_topics.count()]
            recommended_topics = list(recommended_topics) + list(extra)
        recommended_data = RecommendedTopicSerializer(recommended_topics, many=True, context=context).data

        streak, _ = StudentStreak.objects.get_or_create(student=student)
        streak_data = StudentStreakSerializer(streak).data

        upcoming_interview = (
            MockInterview.objects.filter(student=student, status=MockInterview.Status.SCHEDULED)
            .order_by("scheduled_at")
            .first()
        )
        interview_data = MockInterviewSerializer(upcoming_interview).data if upcoming_interview else None

        skill_areas = SkillFocusArea.objects.all()
        skills_data = SkillFocusAreaSerializer(skill_areas, many=True).data

        # Overall progress: average of all category progress percentages
        overall = (
            int(sum(c["progress_percent"] for c in category_data) / len(category_data))
            if category_data else 0
        )

        return Response({
            "overall_progress_percent": overall,
            "categories": category_data,
            "recommended_for_you": recommended_data,
            "streak": streak_data,
            "upcoming_mock_interview": interview_data,
            "top_skills_to_focus": skills_data,
            "stats": {
                "topics_completed": StudentTopicProgress.objects.filter(
                    student=student, status=StudentTopicProgress.Status.COMPLETED
                ).count(),
                "topics_total": Topic.objects.count(),
                "mock_interviews_done": MockInterview.objects.filter(
                    student=student, status=MockInterview.Status.COMPLETED
                ).count(),
                "problems_solved": StudentTopicProgress.objects.filter(
                    student=student, status=StudentTopicProgress.Status.COMPLETED
                ).count(),  # replace with real coding-practice count if tracked separately
            },
        })


class CategoryTopicsView(generics.ListAPIView):
    """GET /api/preparation/categories/<slug>/topics/"""
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Topic.objects.filter(category__slug=self.kwargs["slug"])


class UpdateTopicProgressView(APIView):
    """POST /api/preparation/topics/<id>/progress/  body: {progress_percent}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        serializer = UpdateTopicProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        percent = serializer.validated_data["progress_percent"]

        progress, _ = StudentTopicProgress.objects.get_or_create(student=request.user, topic_id=pk)
        progress.progress_percent = percent
        progress.status = (
            StudentTopicProgress.Status.COMPLETED if percent >= 100
            else StudentTopicProgress.Status.IN_PROGRESS if percent > 0
            else StudentTopicProgress.Status.NOT_STARTED
        )
        progress.save()

        # bump daily streak goal progress
        streak, _ = StudentStreak.objects.get_or_create(student=request.user)
        if progress.status == StudentTopicProgress.Status.COMPLETED:
            streak.daily_goal_completed = min(streak.daily_goal_total, streak.daily_goal_completed + 1)
            streak.save()

        return Response({"detail": "Progress updated.", "progress_percent": progress.progress_percent})


class MockInterviewViewSet(viewsets.ModelViewSet):
    """/api/preparation/mock-interviews/"""
    serializer_class = MockInterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MockInterview.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
