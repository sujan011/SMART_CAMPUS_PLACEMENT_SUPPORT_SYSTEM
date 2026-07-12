from django.http import FileResponse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from apps.students.models import StudentProfile
from .models import ResumeTemplate, Resume, ATSAnalysis
from .serializers import (
    ResumeTemplateSerializer, ResumeSerializer, EnhanceSummarySerializer,
    ATSAnalysisSerializer, ATSAnalyzeRequestSerializer,
)
from . import ai_service
from .text_extraction import extract_text_from_pdf
from .pdf_generator import generate_resume_pdf
from apps.users.permissions import IsStudent


class ResumeTemplateListView(generics.ListAPIView):
    """GET /api/resume/templates/"""
    queryset = ResumeTemplate.objects.filter(is_active=True)
    serializer_class = ResumeTemplateSerializer
    permission_classes = [IsStudent]


class MyResumeView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/resume/  -- personal info tab + template/color selection"""
    serializer_class = ResumeSerializer
    permission_classes = [IsStudent]

    def get_object(self):
        resume, _ = Resume.objects.get_or_create(student=self.request.user)
        return resume


class ResumePreviewView(APIView):
    """
    GET /api/resume/preview/
    Assembles the full resume payload for the live-preview panel:
    personal info + education + skills + projects + certifications, pulled
    from the student's profile, merged with resume-specific overrides.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        resume, _ = Resume.objects.get_or_create(student=request.user)
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user, defaults={"full_name": request.user.username}
        )

        return Response({
            "full_name": profile.full_name,
            "professional_title": resume.professional_title,
            "email": request.user.email,
            "phone": request.user.phone,
            "location": profile.address,
            "linkedin_url": profile.linkedin_url,
            "github_url": profile.github_url,
            "portfolio_url": profile.portfolio_url,
            "summary": resume.summary,
            "education": [
                {
                    "course": r.course, "institution": r.institution,
                    "start_year": r.start_year, "end_year": r.end_year,
                    "score": r.score, "score_type": r.score_type,
                }
                for r in profile.academic_records.all()
            ],
            "skills": [{"name": s.name} for s in profile.skills.all()],
            "projects": [
                {
                    "title": p.title, "description": p.description,
                    "tech_stack": p.tech_stack, "start_date": p.start_date, "end_date": p.end_date,
                }
                for p in profile.projects.all()
            ],
            "certifications": [
                {"title": c.title, "issuer": c.issuer, "issue_date": c.issue_date}
                for c in profile.certifications.all()
            ],
            "template_id": resume.template_id,
            "selected_color": resume.selected_color,
        })


class EnhanceSummaryView(APIView):
    """POST /api/resume/enhance-summary/  body: {summary}"""
    permission_classes = [IsStudent]

    def post(self, request):
        serializer = EnhanceSummarySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        student_context = {
            "branch": profile.branch,
            "skills": [s.name for s in profile.skills.all()[:8]],
            "projects": [p.title for p in profile.projects.all()[:3]],
        }
        enhanced = ai_service.enhance_summary(serializer.validated_data["summary"], student_context)
        return Response({"enhanced_summary": enhanced})


class ResumeScoreView(APIView):
    """
    GET /api/resume/score/
    Returns the resume-strength gauge + checklist shown in the sidebar
    ("Add more projects", "Include certifications", etc).
    """
    permission_classes = [IsStudent]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        resume, _ = Resume.objects.get_or_create(student=request.user)

        checklist = {
            "add_more_projects": profile.projects.count() >= 2,
            "include_certifications": profile.certifications.count() >= 1,
            "add_internship_experience": False,  # wire up once an Experience model/field exists
            "include_achievements": profile.achievements.count() >= 1,
            "add_more_skills": profile.skills.count() >= 5,
        }
        score = int((sum(checklist.values()) / len(checklist)) * 100)
        resume.resume_score = score
        resume.save(update_fields=["resume_score"])

        label = "Excellent" if score >= 80 else "Good" if score >= 60 else "Needs Work"
        return Response({"score": score, "label": label, "checklist": checklist})


class ResumeDownloadView(APIView):
    """GET /api/resume/download/ -- generates and returns a PDF"""
    permission_classes = [IsStudent]

    def get(self, request):
        preview_data = ResumePreviewView().get(request).data
        pdf_buffer = generate_resume_pdf(preview_data)
        return FileResponse(pdf_buffer, as_attachment=True, filename="resume.pdf", content_type="application/pdf")


class ATSAnalyzeView(APIView):
    """
    POST /api/resume/ats/analyze/
    multipart/form-data: resume_file, job_description (optional)
    """
    permission_classes = [IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ATSAnalyzeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume_file = serializer.validated_data["resume_file"]
        job_description = serializer.validated_data.get("job_description", "")

        resume_text = extract_text_from_pdf(resume_file)
        resume_file.seek(0)  # reset pointer before saving to model

        result = ai_service.analyze_resume_ats(resume_text, job_description)

        analysis = ATSAnalysis.objects.create(
            student=request.user,
            resume_file=resume_file,
            job_description=job_description,
            overall_score=result["overall_score"],
            content_score=result["content_score"],
            format_score=result["format_score"],
            keyword_score=result["keyword_score"],
            structure_score=result["structure_score"],
            matched_keywords=result["matched_keywords"],
            missing_keywords=result["missing_keywords"],
            section_feedback=result["section_feedback"],
            improvement_suggestions=result["improvement_suggestions"],
        )
        return Response(ATSAnalysisSerializer(analysis).data, status=status.HTTP_201_CREATED)


class ATSLatestView(generics.RetrieveAPIView):
    """GET /api/resume/ats/latest/ -- most recent analysis, for the ATS Checker dashboard"""
    serializer_class = ATSAnalysisSerializer
    permission_classes = [IsStudent]

    def get_object(self):
        return ATSAnalysis.objects.filter(student=self.request.user).first()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response({"detail": "No ATS analysis found yet. Upload a resume to analyze."}, status=404)
        return Response(self.get_serializer(instance).data)
