from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('staff', 'Staff')]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Company(models.Model):
    SECTOR_CHOICES = [
        ('health', 'Health'),
        ('agriculture', 'Agriculture'),
        ('mining', 'Mining'),
        ('agrochemicals', 'Agrochemicals'),
        ('infrastructure', 'Infrastructure'),
        ('hospitality', 'Hospitality'),
        ('telemast', 'Telemast'),
        ('energy', 'Energy'),
    ]

    # Core fields
    sector = models.CharField(max_length=20, choices=SECTOR_CHOICES)
    phone_number = models.CharField(max_length=30, blank=True)
    file_number = models.CharField(max_length=100, blank=True)
    company_name = models.CharField(max_length=255)
    type_of_undertaking = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    district = models.CharField(max_length=100, blank=True)
    type_of_application = models.CharField(max_length=255, blank=True)
    date_of_invoice = models.DateField(null=True, blank=True)
    invoice_number = models.CharField(max_length=100, blank=True)
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    date_of_submission = models.DateField(null=True, blank=True)
    date_received_from_rg = models.DateField(null=True, blank=True)
    date_of_permit_issued = models.DateField(null=True, blank=True)
    permit_number = models.CharField(max_length=100, blank=True)
    permit_expiry_date = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True)

    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_companies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Companies'

    def __str__(self):
        return f"{self.company_name} ({self.sector})"
