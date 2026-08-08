import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test.client import Client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Profile

User = get_user_model()

# Create a test user WITH a profile
user_with, _ = User.objects.get_or_create(username='has_profile', email='has@test.com')
Profile.objects.get_or_create(user=user_with)

# Create a test user WITHOUT a profile
user_without, _ = User.objects.get_or_create(username='no_profile', email='no@test.com')

client = Client()

# Test WITH profile
refresh1 = RefreshToken.for_user(user_with)
resp1 = client.get('/accounts/profileview/', HTTP_AUTHORIZATION=f'Bearer {str(refresh1.access_token)}')
print(f"WITH profile: {resp1.status_code}")

# Test WITHOUT profile
refresh2 = RefreshToken.for_user(user_without)
resp2 = client.get('/accounts/profileview/', HTTP_AUTHORIZATION=f'Bearer {str(refresh2.access_token)}')
print(f"WITHOUT profile: {resp2.status_code}")

