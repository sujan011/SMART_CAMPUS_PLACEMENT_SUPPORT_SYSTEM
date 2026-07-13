from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from apps.students.models import StudentProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    college = serializers.CharField(write_only=True)
    branch = serializers.CharField(write_only=True)
    enrollment_no = serializers.CharField(write_only=True)
    current_year = serializers.CharField(write_only=True, required=False, allow_blank=True)
    passing_year = serializers.IntegerField(required=False)
    cgpa = serializers.DecimalField(
        max_digits=4,
        decimal_places=2,
        required=False,
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2", "role", "phone","full_name", "college", "branch", "enrollment_no", "current_year", "passing_year", "cgpa",]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):

        password = validated_data.pop("password")
        validated_data.pop("password2")

        full_name = validated_data.pop("full_name")
        college = validated_data.pop("college")
        branch = validated_data.pop("branch")
        enrollment_no = validated_data.pop("enrollment_no")

        current_year = validated_data.pop("current_year", "")
        passing_year = validated_data.pop("passing_year", None)
        cgpa = validated_data.pop("cgpa", None)

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        StudentProfile.objects.create(
            user=user,
            full_name=full_name,
            college=college,
            branch=branch,
            enrollment_no=enrollment_no,
            current_year=current_year,
            passing_year=passing_year,
            cgpa=cgpa,
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs["email"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        attrs["user"] = user
        return attrs

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "phone", "is_email_verified", "created_at"]
        read_only_fields = ["id", "role", "is_email_verified", "created_at"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
