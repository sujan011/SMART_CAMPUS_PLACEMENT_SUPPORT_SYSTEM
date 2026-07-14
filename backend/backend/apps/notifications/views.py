from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/  -- bell icon dropdown, shown on every page"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_read", "notif_type"]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class UnreadCountView(APIView):
    """GET /api/notifications/unread-count/  -- for the red badge number"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread_count": count})


class MarkReadView(APIView):
    """POST /api/notifications/<id>/read/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        Notification.objects.filter(pk=pk, recipient=request.user).update(is_read=True)
        return Response({"detail": "Marked as read."})


class MarkAllReadView(APIView):
    """POST /api/notifications/mark-all-read/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})


from apps.users.permissions import IsOfficerOrAdmin
from apps.users.models import User

class BroadcastNotificationView(APIView):
    """POST /api/notifications/broadcast/
    body: {title, message, target_branch}
    Allows admin/officers to broadcast alerts to students.
    """
    permission_classes = [IsOfficerOrAdmin]

    def post(self, request):
        title = request.data.get("title")
        message = request.data.get("message")
        target_branch = request.data.get("target_branch", "All")

        if not title or not message:
            return Response({"detail": "Title and message are required."}, status=400)

        # Query matching students (role='student')
        if target_branch == "All":
            students = User.objects.filter(role=User.Role.STUDENT)
        else:
            students = User.objects.filter(role=User.Role.STUDENT, student_profile__branch__iexact=target_branch)

        notifications = [
            Notification(
                recipient=student,
                title=title,
                message=message,
                notif_type=Notification.Type.DRIVE_ANNOUNCEMENT,
            )
            for student in students
        ]

        if notifications:
            Notification.objects.bulk_create(notifications)

        return Response({"detail": f"Announcement broadcasted successfully to {len(notifications)} students."})

