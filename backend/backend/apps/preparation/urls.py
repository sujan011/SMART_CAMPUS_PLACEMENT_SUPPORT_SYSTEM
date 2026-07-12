from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"mock-interviews", views.MockInterviewViewSet, basename="mock-interview")

urlpatterns = [
    path("dashboard/", views.PreparationDashboardView.as_view(), name="preparation-dashboard"),
    path("categories/<slug:slug>/topics/", views.CategoryTopicsView.as_view(), name="category-topics"),
    path("topics/<int:pk>/progress/", views.UpdateTopicProgressView.as_view(), name="update-topic-progress"),
] + router.urls
