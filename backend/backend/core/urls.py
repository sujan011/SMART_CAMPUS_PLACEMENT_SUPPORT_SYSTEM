from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.users.urls")),
    path("api/students/", include("apps.students.urls")),
    path("api/companies/", include("apps.companies.urls")),
    path("api/jobs/", include("apps.jobs.urls")),
    path("api/applications/", include("apps.applications.urls")),
    path("api/recommendations/", include("apps.recommendations.urls")),
    path("api/preparation/", include("apps.preparation.urls")),
    path("api/resume/", include("apps.resume.urls")),
    path("api/chatbot/", include("apps.chatbot.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
