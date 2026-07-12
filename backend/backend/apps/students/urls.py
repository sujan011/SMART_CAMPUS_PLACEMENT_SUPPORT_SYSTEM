from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"academic-records", views.AcademicRecordViewSet, basename="academic-record")
router.register(r"skills", views.SkillViewSet, basename="skill")
router.register(r"projects", views.ProjectViewSet, basename="project")
router.register(r"certifications", views.CertificationViewSet, basename="certification")
router.register(r"achievements", views.AchievementViewSet, basename="achievement")

urlpatterns = [
    path("profile/", views.MyProfileView.as_view(), name="my-profile"),
    path("profile/completion/", views.ProfileCompletionView.as_view(), name="profile-completion"),
    path("", views.StudentListView.as_view(), name="student-list"),
    path("<int:pk>/verify/", views.VerifyStudentView.as_view(), name="verify-student"),
] + router.urls
