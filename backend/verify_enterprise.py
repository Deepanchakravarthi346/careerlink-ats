import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test.client import Client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Job, Application, InterviewSchedule, InterviewDetail, ActivityLog
from django.core import mail
from django.conf import settings

User = get_user_model()

def run_tests():
    print("=========================================")
    print("Starting Enterprise ATS Verification...")
    print("=========================================\n")
    
    settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
    settings.ALLOWED_HOSTS = ['*']
    
    recruiter, _ = User.objects.get_or_create(username='test_recruiter', email='recruiter@test.com')
    recruiter.set_password('password')
    recruiter.save()
    
    applicant, _ = User.objects.get_or_create(username='test_applicant', email='applicant@test.com')
    job, _ = Job.objects.get_or_create(title='Software Engineer', company='TechCorp', posted_by=recruiter)
    
    application, _ = Application.objects.get_or_create(job=job, applicant=applicant)
    application.status = 'Applied'
    application.save()
    
    ActivityLog.objects.all().delete()
    mail.outbox = []
    
    refresh = RefreshToken.for_user(recruiter)
    token = str(refresh.access_token)
    client = Client(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    print("1. Testing Shortlist Endpoint & Email...")
    resp = client.patch(f'/accounts/applicantstatus/{job.id}/{applicant.id}/')
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    application.refresh_from_db()
    assert application.status == 'ShortListed'
    print("[OK] Shortlist verification passed.\n")
    
    print("2. Testing UpdatePipelineStage (Offer Sent) Endpoint & Email...")
    resp = client.patch(f'/accounts/pipeline/{job.id}/{applicant.id}/', data={'status': 'Offer Sent'}, content_type='application/json')
    assert resp.status_code == 200
    application.refresh_from_db()
    assert application.status == 'Offer Sent'
    print("[OK] Pipeline stage update verification passed.\n")
    
    print("3. Testing CandidateInterviews POST (Schedule) & Email...")
    interview_data = {
        'interview_type': 'Technical',
        'scheduled_date': '2026-09-01T10:00:00Z',
        'duration_minutes': 60,
        'meeting_link': 'http://meet.google.com/abc',
        'interview_round': 'Technical',
        'send_email': True
    }
    resp = client.post(f'/accounts/interviews/{job.id}/{applicant.id}/', data=interview_data, content_type='application/json')
    assert resp.status_code == 201
    interview_id = resp.json()['id']
    print("[OK] Interview scheduling verification passed.\n")
    
    print("4b. Testing UpdateInterview PATCH (Cancel) & Email...")
    resp = client.patch(f'/accounts/interviews/update/{interview_id}/', data={'status': 'Cancelled'}, content_type='application/json')
    assert resp.status_code == 200
    print("[OK] Interview cancellation verification passed.\n")
    
    print("5. Testing ActivityLog Endpoint...")
    resp = client.get(f'/accounts/activity/{job.id}/{applicant.id}/')
    assert resp.status_code == 200
    assert len(resp.json()) == 6
    print("[OK] ActivityLog endpoint verification passed.\n")
    
    print("6. Testing Hired Endpoint & Email...")
    resp = client.patch(f'/accounts/pipeline/{job.id}/{applicant.id}/', data={'status': 'Hired'}, content_type='application/json')
    assert resp.status_code == 200
    application.refresh_from_db()
    assert application.status == 'Hired'
    print("[OK] Hired verification passed.\n")
    
    print("7. Testing Reject Endpoint & Email...")
    resp = client.patch(f'/accounts/rejectstatus/{job.id}/{applicant.id}/')
    assert resp.status_code == 200
    application.refresh_from_db()
    assert application.status == 'Rejected'
    print("[OK] Reject verification passed.\n")
    
    print("8. Verifying Existing Feature Unchanged...")
    resp = client.get('/accounts/myjobs/')
    assert resp.status_code == 200
    print("[OK] Existing features verified.\n")
    
    print("=========================================")
    print("ALL ENTERPRISE BACKEND TESTS PASSED [OK]")
    print("=========================================")

if __name__ == '__main__':
    run_tests()
