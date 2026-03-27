from django.db.models import Count, Q
from django.db.models.functions import TruncMonth, TruncDate
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Company, UserProfile
from .serializers import CompanySerializer, CompanyListSerializer, UserSerializer
from .permissions import IsAdmin


class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        return CompanySerializer

    def get_queryset(self):
        qs = Company.objects.select_related('created_by')
        params = self.request.query_params

        # Search
        search = params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(company_name__icontains=search) |
                Q(file_number__icontains=search) |
                Q(permit_number__icontains=search) |
                Q(district__icontains=search) |
                Q(location__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(type_of_undertaking__icontains=search)
            )

        # Filters
        sector = params.get('sector')
        if sector:
            qs = qs.filter(sector=sector)

        district = params.get('district')
        if district:
            qs = qs.filter(district__icontains=district)

        type_of_application = params.get('type_of_application')
        if type_of_application:
            qs = qs.filter(type_of_application__icontains=type_of_application)

        # Date range filters
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        # Permit expiry filter
        permit_expired = params.get('permit_expired')
        if permit_expired == 'true':
            from django.utils import timezone
            qs = qs.filter(permit_expiry_date__lt=timezone.now().date())
        elif permit_expired == 'false':
            from django.utils import timezone
            qs = qs.filter(permit_expiry_date__gte=timezone.now().date())

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_companies = Company.objects.count()

        # Companies per sector
        sector_counts = list(
            Company.objects.values('sector')
            .annotate(count=Count('id'))
            .order_by('sector')
        )

        # Add display names
        sector_display = dict(Company.SECTOR_CHOICES)
        for item in sector_counts:
            item['label'] = sector_display.get(item['sector'], item['sector'])

        # Monthly registrations (last 12 months)
        from django.utils import timezone
        from datetime import timedelta
        twelve_months_ago = timezone.now() - timedelta(days=365)
        monthly_data = list(
            Company.objects.filter(created_at__gte=twelve_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Recent companies (last 10)
        recent_companies = CompanyListSerializer(
            Company.objects.order_by('-created_at')[:10],
            many=True
        ).data

        return Response({
            'total_companies': total_companies,
            'sector_counts': sector_counts,
            'monthly_registrations': [
                {'month': item['month'].strftime('%b %Y'), 'count': item['count']}
                for item in monthly_data
            ],
            'recent_companies': recent_companies,
        })


# Admin-only user management
class UserListCreateView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.select_related('profile').all()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.select_related('profile').all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Return current user info"""
    user = request.user
    role = user.profile.role if hasattr(user, 'profile') else 'staff'
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': role,
    })
