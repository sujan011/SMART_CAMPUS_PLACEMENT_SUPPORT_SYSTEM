from rest_framework import serializers
from .models import ChatSession, ChatMessage, ChatbotKnowledgeEntry


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "sender", "content", "created_at"]


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ["id", "title", "started_at", "messages"]


class SendMessageSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(required=False)
    message = serializers.CharField()


class ChatbotKnowledgeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatbotKnowledgeEntry
        fields = ["id", "topic", "question", "answer", "category", "is_active"]
