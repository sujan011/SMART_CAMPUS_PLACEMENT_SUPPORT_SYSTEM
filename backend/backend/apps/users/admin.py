from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "is_email_verified", "is_active", "created_at")
    list_filter = ("role", "is_active", "is_email_verified")
    search_fields = ("email", "username")
    ordering = ("-created_at",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Role & Verification", {"fields": ("role", "is_email_verified", "phone")}),
    )


admin.site.register(User, UserAdmin)
