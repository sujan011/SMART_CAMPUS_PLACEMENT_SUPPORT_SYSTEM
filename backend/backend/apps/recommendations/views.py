from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.models import StudentProfile
from .models import RecommendationLog
from .serializers import RecommendationSerializer
from . import ml_engine


class RecommendationListView(generics.ListAPIView):
    """GET /api/recommendations/  -- cached recommendations for the dashboard"""
    serializer_class = RecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RecommendationLog.objects.filter(student=self.request.user).select_related("job", "job__company")


class RefreshRecommendationsView(APIView):
    """
    POST /api/recommendations/refresh/
    Recomputes recommendations on demand (e.g. after the student updates skills/projects).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user, defaults={"full_name": request.user.username}
        )
        recs = ml_engine.save_recommendations(request.user, profile)
        logs = RecommendationLog.objects.filter(student=request.user).select_related("job", "job__company")
        return Response(RecommendationSerializer(logs, many=True).data)
