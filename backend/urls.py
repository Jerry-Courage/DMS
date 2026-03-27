from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('companies.urls')),
]

# Serve React SPA for all other routes (production)
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^(?!api/|admin/|static/).*$',
                TemplateView.as_view(template_name='index.html'),
                name='frontend'),
    ]
