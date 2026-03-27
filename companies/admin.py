from django.contrib import admin
from .models import Company, UserProfile

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'sector', 'district', 'permit_number', 'created_at']
    list_filter = ['sector', 'district']
    search_fields = ['company_name', 'file_number', 'permit_number']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role']
