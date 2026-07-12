from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.users.permissions import (IsOfficerOrAdmin, IsStudent,)
from .eligibility import check_student_eligibility

from .models import Application, ApplicationStatusHistory
from .serializers import (
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationStatusUpdateSerializer,
)





class ApplicationViewSet(viewsets.ModelViewSet):
    """
    /api/applications/                 - GET: student sees own applications; officer sees all
                                          POST: student applies to a job
    /api/applications/<id>/            - GET/DELETE (withdraw)
    /api/applications/<id>/status/     - PATCH: officer updates status (one-click apply -> tracked here)
    """
    filterset_fields = ["status", "job"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Application.objects.filter(student=user).select_related("job", "job__company")
        # officers/admins see everything, optionally filtered by ?job=<id>
        return (Application.objects
            .select_related(
                "job", "job__company", "student",)
            .prefetch_related("status_history",)
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_permissions(self):

        # Student only
        if self.action in (
            "create",
            "destroy",
        ):
            return [IsStudent()]

        # Placement Officer / Admin only
        if self.action == "status":
            return [IsOfficerOrAdmin()]

        # Everyone logged in can view according to queryset
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):

        student = self.request.user
        job = serializer.validated_data["job"]

        # ----------------------------
        # Already Applied?
        # ----------------------------

        if Application.objects.filter(
            student=student,
            job=job
        ).exists():

            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                "detail": "You have already applied for this job."
            })

        # ----------------------------
        # Eligibility Check
        # ----------------------------

        result = check_student_eligibility(
            student,
            job
        )

        if not result["eligible"]:

            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                "eligible": False,
                "reasons": result["reasons"]
            })

        # ----------------------------
        # Create Application
        # ----------------------------

        application = serializer.save(
            student=student
        )

        ApplicationStatusHistory.objects.create(
            application=application,
            status=Application.Status.APPLIED,
            changed_by=student,
        )

    def destroy(self, request, *args, **kwargs):

        application = self.get_object()

        if application.status not in (
            Application.Status.APPLIED,
            Application.Status.UNDER_REVIEW,
        ):
            return Response(
                {
                    "detail": "Application cannot be withdrawn at this stage."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], permission_classes=[IsOfficerOrAdmin])
    def status(self, request, pk=None):
        """PATCH /api/applications/<id>/status/  body: {status, note}"""
        application = self.get_object()
        serializer = ApplicationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.status = serializer.validated_data["status"]
        application.save()

        ApplicationStatusHistory.objects.create(
            application=application,
            status=application.status,
            changed_by=request.user,
            note=serializer.validated_data.get("note", ""),
        )
        return Response(ApplicationSerializer(application, context={"request": request}).data)

    @action(detail=True, methods=["post"], permission_classes=[IsOfficerOrAdmin], url_path="schedule-interview")
    def schedule_interview(self, request, pk=None):
        """POST /api/applications/<id>/schedule-interview/
        body: {scheduled_at, duration_minutes, mode, meeting_link, venue, interviewer_notes}
        """
        application = self.get_object()
        from .models import InterviewSchedule
        from .serializers import InterviewScheduleSerializer
        
        # Check if interview already exists
        interview = getattr(application, "interview", None)
        if interview:
            serializer = InterviewScheduleSerializer(interview, data=request.data, partial=True)
        else:
            serializer = InterviewScheduleSerializer(data=request.data)
            
        serializer.is_valid(raise_exception=True)
        interview = serializer.save(application=application)
        
        # Move application status to shortlisted
        application.status = Application.Status.SHORTLISTED
        application.save()
        
        ApplicationStatusHistory.objects.create(
            application=application,
            status=application.status,
            changed_by=request.user,
            note="Interview Scheduled",
        )
        
        return Response(ApplicationSerializer(application, context={"request": request}).data)
