from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        ("job_seeker", "Job Seeker"),
        ("recruiter", "Recruiter"),
    )

    email = models.EmailField(unique=True)

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    phone = models.CharField(max_length=15, null=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class Job(models.Model):
    JOB_CHOICES = (("fulltime", "FullTime"), ("parttime", "PartTime"))
    title = models.CharField(max_length=100, null=False)
    description = models.TextField(null=False)
    key_responsibilities = models.TextField()
    preferred_qualifications = models.TextField(null=False)
    benefits = models.TextField(default="Not specified", null=False)
    experience = models.CharField(max_length=100, null=False)
    company = models.CharField(max_length=100, null=False)
    location = models.CharField(max_length=100, null=False)
    skills = models.TextField()
    salary = models.CharField(max_length=100, null=False)
    jop_type = models.CharField(max_length=50, choices=JOB_CHOICES, null=False)
    posted_on = models.DateField(auto_now_add=True)
    posted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.title


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to="profile_picture")
    headline = models.TextField(null=False)
    about = models.TextField(null=False)
    skills = models.TextField()
    git_hub = models.URLField()
    linkedin = models.CharField(max_length=50)
    location = models.CharField(max_length=200)
    resume = models.FileField(upload_to="resume/", null=False)
    degree = models.CharField(max_length=150, null=False)
    field_of_study = models.CharField(max_length=150)
    institution = models.CharField(max_length=150)
    start_year = models.CharField(max_length=50)
    end_year = models.CharField(max_length=50)


class Application(models.Model):
    STATUS_CHOICES = (
        ("Applied", "Applied"),
        ("Viewed", "Viewed"),
        ("ShortListed", "ShortListed"),
        ("Interview Scheduled", "Interview Scheduled"),
        ("Technical Round", "Technical Round"),
        ("HR Round", "HR Round"),
        ("Offer Sent", "Offer Sent"),
        ("Hired", "Hired"),
        ("Rejected", "Rejected"),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=False)
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    resume = models.FileField(upload_to="applications/", null=False)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Applied")
    applied_on = models.DateTimeField(auto_now_add=True)


class RecruiterNote(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    applicant = models.ForeignKey(User, related_name="applicant_notes", on_delete=models.CASCADE)
    recruiter = models.ForeignKey(User, related_name="recruiter_notes", on_delete=models.CASCADE)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class InterviewSchedule(models.Model):
    INTERVIEW_TYPES = (
        ("Phone Screen", "Phone Screen"),
        ("Technical", "Technical"),
        ("HR", "HR"),
        ("Final", "Final"),
        ("Other", "Other"),
    )
    STATUS_CHOICES = (
        ("Scheduled", "Scheduled"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    applicant = models.ForeignKey(User, related_name="applicant_interviews", on_delete=models.CASCADE)
    recruiter = models.ForeignKey(User, related_name="recruiter_interviews", on_delete=models.CASCADE)
    interview_type = models.CharField(max_length=50, choices=INTERVIEW_TYPES)
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    location = models.CharField(max_length=255, blank=True, null=True)
    meeting_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Scheduled")
    created_at = models.DateTimeField(auto_now_add=True)


class InterviewDetail(models.Model):
    """
    Enterprise extension of InterviewSchedule.
    Linked via OneToOneField so the existing InterviewSchedule model
    and all its queries remain completely untouched.
    """
    ROUND_CHOICES = (
        ("HR", "HR"),
        ("Technical", "Technical"),
        ("Managerial", "Managerial"),
        ("Final", "Final"),
    )
    MEETING_TYPE_CHOICES = (
        ("Google Meet", "Google Meet"),
        ("Zoom", "Zoom"),
        ("Microsoft Teams", "Microsoft Teams"),
        ("Phone", "Phone"),
        ("Office", "Office"),
    )
    TIMEZONE_CHOICES = (
        ("Asia/Kolkata", "IST (Asia/Kolkata)"),
        ("America/New_York", "EST (America/New_York)"),
        ("America/Chicago", "CST (America/Chicago)"),
        ("America/Denver", "MST (America/Denver)"),
        ("America/Los_Angeles", "PST (America/Los_Angeles)"),
        ("Europe/London", "GMT (Europe/London)"),
        ("Europe/Berlin", "CET (Europe/Berlin)"),
        ("Asia/Dubai", "GST (Asia/Dubai)"),
        ("Asia/Singapore", "SGT (Asia/Singapore)"),
        ("Asia/Tokyo", "JST (Asia/Tokyo)"),
        ("Australia/Sydney", "AEST (Australia/Sydney)"),
        ("UTC", "UTC"),
    )

    interview = models.OneToOneField(
        InterviewSchedule,
        on_delete=models.CASCADE,
        related_name="detail"
    )
    interview_round = models.CharField(max_length=50, choices=ROUND_CHOICES, default="Technical")
    time_zone = models.CharField(max_length=50, choices=TIMEZONE_CHOICES, default="Asia/Kolkata")
    meeting_type = models.CharField(max_length=50, choices=MEETING_TYPE_CHOICES, default="Google Meet")
    office_address = models.TextField(blank=True, default="")
    interviewer_name = models.CharField(max_length=150, blank=True, default="")
    recruiter_email = models.EmailField(blank=True, default="")
    additional_instructions = models.TextField(blank=True, default="")
    internal_notes = models.TextField(blank=True, default="")
    send_email = models.BooleanField(default=True)

    def __str__(self):
        return f"Detail for Interview #{self.interview_id}"


class ActivityLog(models.Model):
    """
    Isolated activity timeline for tracking all recruiter actions.
    Completely independent — no existing model references this.
    """
    ACTION_CHOICES = (
        ("Application Submitted", "Application Submitted"),
        ("Candidate Shortlisted", "Candidate Shortlisted"),
        ("Candidate Rejected", "Candidate Rejected"),
        ("Interview Scheduled", "Interview Scheduled"),
        ("Interview Updated", "Interview Updated"),
        ("Interview Cancelled", "Interview Cancelled"),
        ("Interview Completed", "Interview Completed"),
        ("Offer Sent", "Offer Sent"),
        ("Candidate Hired", "Candidate Hired"),
        ("Email Sent", "Email Sent"),
        ("Status Changed", "Status Changed"),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="activity_logs")
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applicant_activity_logs")
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recruiter_activity_logs", null=True, blank=True)
    action = models.CharField(max_length=100, choices=ACTION_CHOICES)
    details = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} — {self.applicant.username} ({self.created_at})"

