from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Company, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.CharField(write_only=True, required=False, default='staff')
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'profile', 'is_active']

    def create(self, validated_data):
        role = validated_data.pop('role', 'staff')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        UserProfile.objects.create(user=user, role=role)
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role and hasattr(instance, 'profile'):
            instance.profile.role = role
            instance.profile.save()
        return instance


class CompanySerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)

    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class CompanyListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'sector', 'sector_display', 'company_name', 'file_number',
            'district', 'permit_number', 'permit_expiry_date',
            'type_of_application', 'created_at', 'created_by_name'
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
