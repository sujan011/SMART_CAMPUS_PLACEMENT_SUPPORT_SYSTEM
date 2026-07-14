import uuid
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import EmailVerificationToken, PasswordResetToken

def generate_verification_token(user):
    expires_at = timezone.now() + timedelta(hours=24)
    token = str(uuid.uuid4())
    # Delete old tokens for the user to keep database clean
    EmailVerificationToken.objects.filter(user=user).delete()
    return EmailVerificationToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )

def send_verification_email(user):
    token_obj = generate_verification_token(user)
    verification_link = f"http://127.0.0.1:8000/api/auth/verify-email/{token_obj.token}/"
    
    subject = "Verify your Smart Campus email address"
    message = (
        f"Hi {user.username},\n\n"
        f"Thank you for registering at Smart Campus Placement Support System.\n"
        f"Please verify your email by clicking the following link:\n"
        f"{verification_link}\n\n"
        f"This link will expire in 24 hours.\n\n"
        f"Best regards,\n"
        f"Smart Campus Placement Team"
    )
    
    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@smartcampus.edu"),
        recipient_list=[user.email],
        fail_silently=True
    )

def generate_password_reset_token(user):
    expires_at = timezone.now() + timedelta(hours=1)
    token = str(uuid.uuid4())
    # Delete old reset tokens for the user to keep database clean
    PasswordResetToken.objects.filter(user=user).delete()
    return PasswordResetToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )

def send_reset_email(user, token_str):
    reset_link = f"http://127.0.0.1:8000/api/auth/reset-password/?token={token_str}"
    
    subject = "Smart Campus Password Reset Request"
    message = (
        f"Hi {user.username},\n\n"
        f"We received a request to reset your password for your Smart Campus account.\n"
        f"You can reset your password using this token: {token_str}\n"
        f"Or by clicking this link: {reset_link}\n\n"
        f"This token will expire in 1 hour.\n\n"
        f"If you did not request a password reset, please ignore this email.\n\n"
        f"Best regards,\n"
        f"Smart Campus Placement Team"
    )
    
    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@smartcampus.edu"),
        recipient_list=[user.email],
        fail_silently=True
    )
