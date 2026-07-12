from rest_framework import serializers
from apps.jobs.serializers import JobListSerializer
from .models import Application, ApplicationStatusHistory, InterviewSchedule
from apps.students.models import StudentProfile

class InterviewScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewSchedule
        fields = ["id", "scheduled_at", "duration_minutes", "mode", "meeting_link", "venue", "interviewer_notes"]


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusHistory
        fields = ["id", "status", "note", "changed_at"]


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    interview = InterviewScheduleSerializer(read_only=True)
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)
    student_name = serializers.CharField(source="student.student_profile.full_name", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "job", "student_name", "resume_file", "status", "cover_note",
            "interview", "status_history", "applied_at", "updated_at",
        ]
        read_only_fields = ["status", "applied_at", "updated_at"]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """POST /api/applications/  -- student applies to a job"""
    class Meta:
        model = Application
        fields = ["job", "resume_file", "cover_note"]


    def validate_job(self, job):

        request = self.context["request"]
        user = request.user

        try:
            profile = user.student_profile
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError(
                "Complete your profile before applying."
            )

        # Job active
        if not job.is_active:
            raise serializers.ValidationError(
                "This job is no longer accepting applications."
            )

        # CGPA
        if (
            profile.cgpa is not None
            and profile.cgpa < job.min_cgpa
        ):
            raise serializers.ValidationError(
                f"Minimum CGPA required is {job.min_cgpa}."
            )

        # Branch
        if (
            job.eligible_branches
            and profile.branch not in job.eligible_branches
        ):
            raise serializers.ValidationError(
                "Your branch is not eligible."
            )

        # Deadline
        from django.utils import timezone

        if job.application_deadline < timezone.now():
            raise serializers.ValidationError(
                "Application deadline has passed."
            )

        return job
    
    def validate(self, attrs):

        request = self.context["request"]

        job = attrs["job"]

        if Application.objects.filter(
            student=request.user,
            job=job
        ).exists():

            raise serializers.ValidationError(
                "You have already applied for this job."
            )

        return attrs


class ApplicationStatusUpdateSerializer(serializers.Serializer):
    """PATCH /api/applications/<id>/status/  -- officer updates status"""
    status = serializers.ChoiceField(choices=Application.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)
