from django.urls import path
from .views import StudentDashboardView, OfficerDashboardView

urlpatterns = [
    path(
        "student/",
        StudentDashboardView.as_view(),
        name="student-dashboard",
    ),

    path(
        "officer/",
        OfficerDashboardView.as_view(),
        name="officer-dashboard",
    ),
]