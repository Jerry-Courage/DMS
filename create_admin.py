"""
Run this once to create the initial admin account:
  python create_admin.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from companies.models import UserProfile

username = 'admin'
password = 'admin123'
email = 'admin@dms.local'

if not User.objects.filter(username=username).exists():
    user = User.objects.create_superuser(username=username, email=email, password=password)
    UserProfile.objects.create(user=user, role='admin')
    print(f"Admin created: {username} / {password}")
else:
    print("Admin already exists.")
