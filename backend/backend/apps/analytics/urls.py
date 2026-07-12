from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.PlacementAnalyticsView.as_view(), name="analytics-dashboard"),
    path("readiness-score/", views.StudentReadinessScoreView.as_view(), name="readiness-score"),
]
