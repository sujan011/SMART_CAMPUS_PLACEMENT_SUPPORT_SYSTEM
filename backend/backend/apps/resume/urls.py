from django.urls import path
from . import views

urlpatterns = [
    path("", views.MyResumeView.as_view(), name="my-resume"),
    path("templates/", views.ResumeTemplateListView.as_view(), name="resume-templates"),
    path("preview/", views.ResumePreviewView.as_view(), name="resume-preview"),
    path("enhance-summary/", views.EnhanceSummaryView.as_view(), name="enhance-summary"),
    path("score/", views.ResumeScoreView.as_view(), name="resume-score"),
    path("download/", views.ResumeDownloadView.as_view(), name="resume-download"),
    path("ats/analyze/", views.ATSAnalyzeView.as_view(), name="ats-analyze"),
    path("ats/latest/", views.ATSLatestView.as_view(), name="ats-latest"),
]
