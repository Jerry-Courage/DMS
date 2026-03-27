from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, DashboardView, UserListCreateView, UserDetailView, me_view
from .ai_views import AISearchView, AIInsightsView, AIAnomaliesView, AIReportView, PermitAlertsView

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('users/', UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('auth/me/', me_view, name='me'),
    # AI endpoints
    path('ai/search/', AISearchView.as_view(), name='ai-search'),
    path('ai/insights/', AIInsightsView.as_view(), name='ai-insights'),
    path('ai/anomalies/', AIAnomaliesView.as_view(), name='ai-anomalies'),
    path('ai/report/', AIReportView.as_view(), name='ai-report'),
    path('ai/permit-alerts/', PermitAlertsView.as_view(), name='permit-alerts'),
]
