from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import (IsStudent, IsOfficerOrAdmin,)
from .models import StudentProfile, AcademicRecord, Skill, Project, Certification, Achievement
from .serializers import (
    StudentProfileSerializer,
    StudentProfileUpdateSerializer,
    AcademicRecordSerializer,
    SkillSerializer,
    ProjectSerializer,
    CertificationSerializer,
    AchievementSerializer,
)
from .utils import calculate_profile_completion


class MyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/students/profile/  -- the logged-in student's own profile"""
    permission_classes = [IsStudent]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"full_name": self.request.user.username},
        )
        return profile

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return StudentProfileUpdateSerializer
        return StudentProfileSerializer


class ProfileCompletionView(APIView):
    """GET /api/students/profile/completion/"""
    permission_classes = [IsStudent]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user, defaults={"full_name": request.user.username}
        )
        return Response(calculate_profile_completion(profile))


class AcademicRecordViewSet(viewsets.ModelViewSet):
    """Full CRUD: /api/students/academic-records/"""
    serializer_class = AcademicRecordSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return AcademicRecord.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(student=profile)


class SkillViewSet(viewsets.ModelViewSet):
    """Full CRUD: /api/students/skills/"""
    serializer_class = SkillSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Skill.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(student=profile)


class ProjectViewSet(viewsets.ModelViewSet):
    """Full CRUD: /api/students/projects/"""
    serializer_class = ProjectSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Project.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(student=profile)


class CertificationViewSet(viewsets.ModelViewSet):
    """Full CRUD: /api/students/certifications/"""
    serializer_class = CertificationSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Certification.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(student=profile)


class AchievementViewSet(viewsets.ModelViewSet):
    """Full CRUD: /api/students/achievements/"""
    serializer_class = AchievementSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Achievement.objects.filter(student__user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        serializer.save(student=profile)


class StudentListView(generics.ListAPIView):
    """GET /api/students/  -- for placement officers/admins to browse & verify students"""
    serializer_class = StudentProfileSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = StudentProfile.objects.all().order_by("-created_at")
    filterset_fields = ["is_verified", "branch", "passing_year"]
    search_fields = ["full_name", "college", "enrollment_no"]


class VerifyStudentView(APIView):
    """POST /api/students/<id>/verify/  -- placement officer verifies a student profile"""
    permission_classes = [IsOfficerOrAdmin]

    def post(self, request, pk):
        try:
            profile = StudentProfile.objects.get(pk=pk)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)
        profile.is_verified = True
        profile.save()
        return Response({"detail": "Student verified successfully."})


class UpdateStudentStatusView(APIView):
    """PATCH /api/students/<id>/status/  body: {"is_active": true|false}
    Admin-only: activates/deactivates the student's underlying user account
    (a deactivated account can no longer log in)."""
    permission_classes = [IsOfficerOrAdmin]

    def patch(self, request, pk):
        try:
            profile = StudentProfile.objects.select_related("user").get(pk=pk)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get("is_active")
        if is_active is None:
            return Response({"is_active": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        profile.user.is_active = bool(is_active)
        profile.user.save(update_fields=["is_active"])
        return Response(
            {
                "detail": "Student status updated successfully.",
                "id": profile.id,
                "is_active": profile.user.is_active,
            }
        )


class DeleteStudentView(APIView):
    """DELETE /api/students/<id>/delete/
    Admin-only: permanently deletes the student's user account
    (cascades to the StudentProfile and all related records)."""
    permission_classes = [IsOfficerOrAdmin]

    def delete(self, request, pk):
        try:
            profile = StudentProfile.objects.select_related("user").get(pk=pk)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        profile.user.delete()  # cascades to StudentProfile via OneToOneField
        return Response(status=status.HTTP_204_NO_CONTENT)
