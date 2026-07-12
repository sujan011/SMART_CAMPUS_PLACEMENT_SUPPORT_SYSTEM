from django.contrib import admin
from .models import (
    PreparationCategory, Topic, StudentTopicProgress,
    StudentStreak, MockInterview, SkillFocusArea,
)

admin.site.register(PreparationCategory)
admin.site.register(Topic)
admin.site.register(StudentTopicProgress)
admin.site.register(StudentStreak)
admin.site.register(MockInterview)
admin.site.register(SkillFocusArea)
