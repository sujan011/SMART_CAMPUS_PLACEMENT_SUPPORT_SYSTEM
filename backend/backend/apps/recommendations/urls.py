from django.urls import path
from . import views

urlpatterns = [
    path("", views.RecommendationListView.as_view(), name="recommendation-list"),
    path("refresh/", views.RefreshRecommendationsView.as_view(), name="recommendation-refresh"),
]
