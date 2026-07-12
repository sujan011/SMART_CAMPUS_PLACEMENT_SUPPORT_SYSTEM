from rest_framework import viewsets, permissions
from apps.users.permissions import IsOfficerOrAdmin
from .models import Company, EligibilityCriteria, PlacementDrive
from .serializers import CompanySerializer, EligibilityCriteriaSerializer, PlacementDriveSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    """
    Full CRUD: /api/companies/
    - Students: read-only (list/retrieve)
    - Placement officers/admins: full CRUD
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    search_fields = ["name", "industry"]
    filterset_fields = ["industry"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [IsOfficerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class EligibilityCriteriaViewSet(viewsets.ModelViewSet):
    """/api/companies/eligibility-criteria/"""
    queryset = EligibilityCriteria.objects.all()
    serializer_class = EligibilityCriteriaSerializer
    permission_classes = [IsOfficerOrAdmin]


class PlacementDriveViewSet(viewsets.ModelViewSet):
    """/api/companies/drives/"""
    queryset = PlacementDrive.objects.all().order_by("-drive_date")
    serializer_class = PlacementDriveSerializer
    filterset_fields = ["status", "company"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [IsOfficerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
