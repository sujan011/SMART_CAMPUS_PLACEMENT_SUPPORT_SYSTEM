from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdmin
from .models import ChatSession, ChatMessage, ChatbotKnowledgeEntry
from .serializers import (
    ChatSessionSerializer, SendMessageSerializer, ChatbotKnowledgeEntrySerializer,
)
from . import ai_service


class ChatSessionListView(generics.ListAPIView):
    """GET /api/chatbot/sessions/  -- chat history list for the widget"""
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(student=self.request.user).order_by("-started_at")


class SendMessageView(APIView):
    """
    POST /api/chatbot/send/
    body: {session_id?: int, message: str}
    Creates a session if session_id is omitted, appends the user message,
    calls the AI, appends and returns the bot reply.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        session_id = serializer.validated_data.get("session_id")

        if session_id:
            session = ChatSession.objects.filter(id=session_id, student=request.user).first()
            if not session:
                return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = ChatSession.objects.create(student=request.user, title=message[:60])

        ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.USER, content=message)

        history = list(session.messages.values("sender", "content"))
        bot_reply_text = ai_service.get_bot_reply(request.user, message, history)

        bot_message = ChatMessage.objects.create(
            session=session, sender=ChatMessage.Sender.BOT, content=bot_reply_text
        )

        return Response({
            "session_id": session.id,
            "reply": bot_message.content,
            "created_at": bot_message.created_at,
        })


class KnowledgeEntryViewSet(viewsets.ModelViewSet):
    """/api/chatbot/knowledge/  -- admin-only chatbot knowledge management"""
    queryset = ChatbotKnowledgeEntry.objects.all()
    serializer_class = ChatbotKnowledgeEntrySerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["category", "is_active"]
