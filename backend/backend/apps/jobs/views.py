from django_filters import rest_framework as django_filters
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.permissions import (IsOfficerOrAdmin, IsStudent)
from .models import Job, SavedJob
from .serializers import JobListSerializer, JobDetailSerializer, JobWriteSerializer, SavedJobSerializer
from django.utils import timezone


class JobFilter(django_filters.FilterSet):
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    job_type = django_filters.CharFilter(field_name="job_type")
    min_salary = django_filters.NumberFilter(field_name="salary_min", lookup_expr="gte")
    company = django_filters.NumberFilter(field_name="company_id")

    class Meta:
        model = Job
        fields = ["location", "job_type", "min_salary", "company", "is_remote"]


class JobViewSet(viewsets.ModelViewSet):
    """
    /api/jobs/                 - list + search + filter (GET), create (POST, officer only)
    /api/jobs/<id>/             - retrieve (GET), update/delete (officer only)
    /api/jobs/<id>/save/        - POST to save/unsave a job
    /api/jobs/saved/            - GET student's saved jobs
    """
    
    filterset_class = JobFilter
    search_fields = ["title", "company__name", "required_skills"]
    ordering_fields = ["created_at", "application_deadline", "salary_min"]

    def get_queryset(self):

        queryset = Job.objects.filter(
            is_active=True,
            application_deadline__gt=timezone.now()
        ).select_related("company")

        user = self.request.user

        # Officers and admins can see every active job
        if user.role != "student":
            return queryset

        profile = getattr(user, "student_profile", None)

        if profile is None:
            return Job.objects.none()

        eligible_jobs = []

        for job in queryset:

            # Branch Check
            if job.eligible_branches:

                if profile.branch not in job.eligible_branches:
                    continue

            # CGPA Check
            if profile.cgpa < job.min_cgpa:
                continue

            eligible_jobs.append(job.id)

        return queryset.filter(id__in=eligible_jobs)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return JobDetailSerializer
        if self.action in ("create", "update", "partial_update"):
            return JobWriteSerializer
        return JobListSerializer

    def get_permissions(self):

        # Placement Officer / Admin only
        if self.action in (
            "create",
            "update",
            "partial_update",
            "destroy",
        ):
            return [IsOfficerOrAdmin()]

        # Student only
        if self.action in (
            "save",
            "saved",
        ):
            return [IsStudent()]

        # Everyone logged in can browse jobs
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        """POST /api/jobs/<id>/save/ -- toggles save/unsave"""
        job = self.get_object()
        saved_job, created = SavedJob.objects.get_or_create(student=request.user, job=job)
        if not created:
            saved_job.delete()
            return Response({"detail": "Job unsaved.", "is_saved": False})
        return Response({"detail": "Job saved.", "is_saved": True}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def saved(self, request):
        """GET /api/jobs/saved/"""
        saved = SavedJob.objects.filter(student=request.user).select_related("job", "job__company")
        serializer = SavedJobSerializer(saved, many=True, context={"request": request})
        return Response(serializer.data)
