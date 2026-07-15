import uuid
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.utils import timezone
from .models import EmailVerificationToken, PasswordResetToken


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_frontend_url() -> str:
    """Return the configured frontend base URL, stripping any trailing slash."""
    return getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")


# ---------------------------------------------------------------------------
# Email Verification
# ---------------------------------------------------------------------------

def generate_verification_token(user) -> EmailVerificationToken:
    """Create (or replace) a 24-hour email verification token for *user*."""
    expires_at = timezone.now() + timedelta(hours=24)
    token = str(uuid.uuid4())
    # Remove any existing tokens to keep the DB clean
    EmailVerificationToken.objects.filter(user=user).delete()
    return EmailVerificationToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at,
    )


def send_verification_email(user) -> None:
    """
    Generate a verification token and email the user a link to the *frontend*
    verify-email page.  The frontend page should then call:
        GET /api/auth/verify-email/<token>/
    """
    token_obj = generate_verification_token(user)
    frontend_url = _get_frontend_url()
    # Link points at the React page, not the raw DRF endpoint
    verification_link = f"{frontend_url}/verify-email/{token_obj.token}"

    subject = "Verify your Smart Campus email address"
    text_body = (
        f"Hi {user.username},\n\n"
        f"Thank you for registering at Smart Campus Placement Support System.\n"
        f"Please verify your email by clicking the link below:\n\n"
        f"  {verification_link}\n\n"
        f"This link will expire in 24 hours.\n\n"
        f"If you did not create an account, you can safely ignore this email.\n\n"
        f"Best regards,\n"
        f"Smart Campus Placement Team"
    )
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;
                border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
      <h2 style="color:#1e40af;margin-top:0;">Verify your email address</h2>
      <p style="color:#374151;">Hi <strong>{user.username}</strong>,</p>
      <p style="color:#374151;">
        Thank you for registering at <strong>Smart Campus Placement Support System</strong>.
        Click the button below to verify your email address.
      </p>
      <a href="{verification_link}"
         style="display:inline-block;margin:16px 0;padding:12px 28px;
                background:#2563eb;color:#fff;text-decoration:none;
                border-radius:8px;font-weight:600;">
        Verify Email Address
      </a>
      <p style="color:#6b7280;font-size:13px;">
        Or copy and paste this link into your browser:<br/>
        <a href="{verification_link}" style="color:#2563eb;">{verification_link}</a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        This link expires in <strong>24 hours</strong>.
        If you did not create an account, please ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Smart Campus Placement Team
      </p>
    </div>
    """

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@smartcampus.edu"),
        to=[user.email],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=True)


# ---------------------------------------------------------------------------
# Password Reset
# ---------------------------------------------------------------------------

def generate_password_reset_token(user) -> PasswordResetToken:
    """Create (or replace) a 1-hour password reset token for *user*."""
    expires_at = timezone.now() + timedelta(hours=1)
    token = str(uuid.uuid4())
    # Remove any existing reset tokens for the user
    PasswordResetToken.objects.filter(user=user).delete()
    return PasswordResetToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at,
    )


def send_reset_email(user, token_str: str) -> None:
    """
    Email the user a link to the *frontend* reset-password page.
    The frontend page should collect the new password and then call:
        POST /api/auth/reset-password/  { token, new_password }
    """
    frontend_url = _get_frontend_url()
    # Link points at the React page, not the raw DRF endpoint
    reset_link = f"{frontend_url}/reset-password?token={token_str}"

    subject = "Smart Campus — Password Reset Request"
    text_body = (
        f"Hi {user.username},\n\n"
        f"We received a request to reset the password for your Smart Campus account.\n\n"
        f"Click the link below to choose a new password:\n\n"
        f"  {reset_link}\n\n"
        f"This link will expire in 1 hour.\n\n"
        f"If you did not request a password reset, please ignore this email — "
        f"your password will remain unchanged.\n\n"
        f"Best regards,\n"
        f"Smart Campus Placement Team"
    )
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;
                border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
      <h2 style="color:#1e40af;margin-top:0;">Reset your password</h2>
      <p style="color:#374151;">Hi <strong>{user.username}</strong>,</p>
      <p style="color:#374151;">
        We received a request to reset the password for your
        <strong>Smart Campus</strong> account. Click the button below to set a new password.
      </p>
      <a href="{reset_link}"
         style="display:inline-block;margin:16px 0;padding:12px 28px;
                background:#dc2626;color:#fff;text-decoration:none;
                border-radius:8px;font-weight:600;">
        Reset Password
      </a>
      <p style="color:#6b7280;font-size:13px;">
        Or copy and paste this link into your browser:<br/>
        <a href="{reset_link}" style="color:#2563eb;">{reset_link}</a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        This link expires in <strong>1 hour</strong>.
        If you did not request this, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Smart Campus Placement Team
      </p>
    </div>
    """

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@smartcampus.edu"),
        to=[user.email],
    )
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=True)
