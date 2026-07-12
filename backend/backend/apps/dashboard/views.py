from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsStudent, IsOfficerOrAdmin
from .services import get_student_dashboard, get_officer_dashboard
from .serializers import StudentDashboardSerializer, OfficerDashboardSerializer

# Create your views here.

# class StudentDashboardView(APIView):
#     permission_classes = [
#         IsAuthenticated,
#         IsStudent,
#     ]

#     def get(self, request):
#         data = get_student_dashboard(request.user)
#         serializer = StudentDashboardSerializer(instance=data)
#         return Response(serializer.data)
    
class StudentDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsStudent,
    ]

    def get(self, request):

        data = get_student_dashboard(request.user)

        print("\n========== DASHBOARD DATA ==========")
        print(data)
        print("====================================\n")

        serializer = StudentDashboardSerializer(instance=data)

        return Response(serializer.data)

class OfficerDashboardView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsOfficerOrAdmin,
    ]

    def get(self, request):

        data = get_officer_dashboard()

        serializer = OfficerDashboardSerializer(data)

        return Response(serializer.data)