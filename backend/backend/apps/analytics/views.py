from django.db.models import Avg, Max, Count, Q
from django.db.models.functions import TruncMonth, TruncYear
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.models import StudentProfile
from apps.companies.models import Company
from apps.applications.models import Application
from apps.jobs.models import Job
from apps.users.permissions import IsOfficerOrAdmin


class PlacementAnalyticsView(APIView):
    """
    GET /api/analytics/dashboard/
    Powers the Placement Analytics screen: totals, highest/average package,
    department-wise placements, company-wise hiring, monthly & yearly trends.
    """
    permission_classes = [IsOfficerOrAdmin]

    def get(self, request):
        placed_applications = Application.objects.filter(status=Application.Status.OFFER_RECEIVED)

        totals = {
            "total_companies": Company.objects.count(),
            "total_students": StudentProfile.objects.count(),
            "total_placements": placed_applications.count(),
            "highest_package": Job.objects.filter(
                applications__status=Application.Status.OFFER_RECEIVED
            ).aggregate(Max("salary_max"))["salary_max__max"] or 0,
            "average_package": Job.objects.filter(
                applications__status=Application.Status.OFFER_RECEIVED
            ).aggregate(Avg("salary_max"))["salary_max__avg"] or 0,
        }

        department_wise = list(
            placed_applications
            .values("student__student_profile__branch")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        department_wise = [
            {"department": d["student__student_profile__branch"] or "Unknown", "placements": d["count"]}
            for d in department_wise
        ]

        company_wise = list(
            placed_applications
            .values("job__company__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        company_wise = [
            {"company": c["job__company__name"], "hires": c["count"]}
            for c in company_wise
        ]

        monthly_trend = list(
            placed_applications
            .annotate(month=TruncMonth("updated_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        monthly_trend = [
            {"month": m["month"].strftime("%Y-%m") if m["month"] else None, "placements": m["count"]}
            for m in monthly_trend
        ]

        yearly_trend = list(
            placed_applications
            .annotate(year=TruncYear("updated_at"))
            .values("year")
            .annotate(count=Count("id"))
            .order_by("year")
        )
        yearly_trend = [
            {"year": y["year"].year if y["year"] else None, "placements": y["count"]}
            for y in yearly_trend
        ]

        return Response({
            "totals": totals,
            "department_wise_placements": department_wise,
            "company_wise_hiring": company_wise,
            "monthly_trend": monthly_trend,
            "yearly_trend": yearly_trend,
        })


class StudentReadinessScoreView(APIView):
    """
    GET /api/analytics/readiness-score/
    Per-student 'Placement Readiness Score' shown on the student dashboard --
    blends profile completion, resume score, and preparation progress.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.students.utils import calculate_profile_completion
        from apps.resume.models import Resume
        from apps.preparation.models import StudentTopicProgress, Topic

        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user, defaults={"full_name": request.user.username}
        )
        completion = calculate_profile_completion(profile)["overall_percent"]

        resume = Resume.objects.filter(student=request.user).first()
        resume_score = resume.resume_score if resume else 0

        total_topics = Topic.objects.count()
        completed_topics = StudentTopicProgress.objects.filter(
            student=request.user, status=StudentTopicProgress.Status.COMPLETED
        ).count()
        prep_score = int((completed_topics / total_topics) * 100) if total_topics else 0

        # Weighted blend: profile 30%, resume 30%, preparation 40%
        readiness = round(completion * 0.3 + resume_score * 0.3 + prep_score * 0.4)

        return Response({
            "readiness_score": readiness,
            "breakdown": {
                "profile_completion": completion,
                "resume_score": resume_score,
                "preparation_progress": prep_score,
            },
        })
