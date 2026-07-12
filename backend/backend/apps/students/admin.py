from django.contrib import admin
from .models import StudentProfile, AcademicRecord, Skill, Project, Certification, Achievement

admin.site.register(StudentProfile)
admin.site.register(AcademicRecord)
admin.site.register(Skill)
admin.site.register(Project)
admin.site.register(Certification)
admin.site.register(Achievement)
