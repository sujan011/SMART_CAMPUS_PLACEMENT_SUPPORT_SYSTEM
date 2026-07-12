from django.contrib import admin
from .models import Application, ApplicationStatusHistory, InterviewSchedule

admin.site.register(Application)
admin.site.register(ApplicationStatusHistory)
admin.site.register(InterviewSchedule)
