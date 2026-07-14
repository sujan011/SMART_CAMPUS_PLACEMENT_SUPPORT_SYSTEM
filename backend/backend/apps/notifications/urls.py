from django.urls import path
from . import views

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", views.UnreadCountView.as_view(), name="notification-unread-count"),
    path("broadcast/", views.BroadcastNotificationView.as_view(), name="notification-broadcast"),
    path("<int:pk>/read/", views.MarkReadView.as_view(), name="notification-mark-read"),
    path("mark-all-read/", views.MarkAllReadView.as_view(), name="notification-mark-all-read"),
]
