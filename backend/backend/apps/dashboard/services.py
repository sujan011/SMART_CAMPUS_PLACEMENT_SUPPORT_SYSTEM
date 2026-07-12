from apps.applications.models import Application, InterviewSchedule
from apps.jobs.models import SavedJob, Job
from apps.resume.models import Resume, ATSAnalysis
from apps.students.utils import calculate_profile_completion
from django.db.models import Count
from apps.students.models import StudentProfile
from apps.companies.models import Company
from apps.jobs.serializers import JobListSerializer
from apps.applications.serializers import InterviewScheduleSerializer


def get_student_dashboard(user):
    """
    Returns all data required for the Student Dashboard.
    """

    profile = getattr(user, "student_profile", None)

    profile_completion = 0

    profile_completion = 0

    if profile:
        completion = calculate_profile_completion(profile)

        if isinstance(completion, dict):
            profile_completion = completion.get("overall_percent", 0)
        else:
            profile_completion = completion

    resume = Resume.objects.filter(student=user).first()
    resume_score = resume.resume_score if resume else 0

    ats = ATSAnalysis.objects.filter(student=user).order_by("-created_at").first()
    ats_score = ats.overall_score if ats else 0

    applications = Application.objects.filter(student=user)
    saved_jobs = SavedJob.objects.filter(student=user)

    status_summary = (
        applications.values("status")
        .annotate(total=Count("id"))
    )

    recommended_jobs = Job.objects.filter(
        is_active=True
    ).select_related("company")[:5]

    upcoming_interviews = InterviewSchedule.objects.filter(
        application__student=user
    ).select_related(
        "application",
        "application__job",
        "application__job__company",
    ).order_by("scheduled_at")[:5]

    return {
        "profile_completion": profile_completion,
        "resume_score": resume_score,
        "ats_score": ats_score,

        "applications": applications.count(),
        "saved_jobs": saved_jobs.count(),

        "recommended_jobs": JobListSerializer(
            recommended_jobs,
            many=True,
        ).data,

        "upcoming_interviews": InterviewScheduleSerializer(
            upcoming_interviews,
            many=True,
        ).data,

        "status_summary": list(status_summary),

        "recent_applications": applications.order_by("-applied_at")[:5],
    }


def get_officer_dashboard():
    """
    Returns all data required for the Placement Officer Dashboard.
    """

    total_students = StudentProfile.objects.count()

    verified_students = StudentProfile.objects.filter(
        is_verified=True
    ).count()

    total_companies = Company.objects.count()

    active_jobs = Job.objects.filter(
        is_active=True
    ).count()

    total_applications = Application.objects.count()

    selected_students = Application.objects.filter(
        status=Application.Status.SELECTED
    ).count()

    placement_rate = 0

    if total_students:
        placement_rate = round(
            (selected_students / total_students) * 100,
            2
        )

    return {
        "total_students": total_students,
        "verified_students": verified_students,
        "total_companies": total_companies,
        "active_jobs": active_jobs,
        "applications": total_applications,
        "selected_students": selected_students,
        "placement_rate": placement_rate,

        "recent_students": StudentProfile.objects.order_by("-created_at")[:5],

        "recent_applications": Application.objects.select_related(
            "student",
            "job",
            "job__company",
        ).order_by("-applied_at")[:5],

        "recent_companies": Company.objects.order_by("-created_at")[:5],
    }