from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"drives", views.PlacementDriveViewSet, basename="drive")
router.register(r"eligibility-criteria", views.EligibilityCriteriaViewSet, basename="eligibility-criteria")
router.register(r"", views.CompanyViewSet, basename="company")

urlpatterns = router.urls
