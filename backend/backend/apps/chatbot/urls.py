from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"knowledge", views.KnowledgeEntryViewSet, basename="chatbot-knowledge")

urlpatterns = [
    path("sessions/", views.ChatSessionListView.as_view(), name="chat-sessions"),
    path("send/", views.SendMessageView.as_view(), name="chat-send"),
] + router.urls
