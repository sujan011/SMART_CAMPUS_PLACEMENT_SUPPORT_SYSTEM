from rest_framework import serializers
from apps.applications.serializers import ApplicationSerializer
from apps.students.serializers import StudentProfileSerializer
from apps.companies.serializers import CompanySerializer

from apps.applications.serializers import InterviewScheduleSerializer
from apps.jobs.serializers import JobListSerializer


class StatusSummarySerializer(serializers.Serializer):
    status = serializers.CharField()
    total = serializers.IntegerField()


class StudentDashboardSerializer(serializers.Serializer):
    profile_completion = serializers.IntegerField()
    resume_score = serializers.IntegerField()
    ats_score = serializers.FloatField()

    applications = serializers.IntegerField()
    saved_jobs = serializers.IntegerField()

    recommended_jobs = JobListSerializer(many=True)

    upcoming_interviews = InterviewScheduleSerializer(many=True)

    status_summary = StatusSummarySerializer(many=True)

    recent_applications = ApplicationSerializer(many=True)


class OfficerDashboardSerializer(serializers.Serializer):

    total_students = serializers.IntegerField()

    verified_students = serializers.IntegerField()

    total_companies = serializers.IntegerField()

    active_jobs = serializers.IntegerField()

    applications = serializers.IntegerField()

    selected_students = serializers.IntegerField()

    placement_rate = serializers.FloatField()

    recent_students = StudentProfileSerializer(many=True)

    recent_applications = ApplicationSerializer(many=True)

    recent_companies = CompanySerializer(many=True)