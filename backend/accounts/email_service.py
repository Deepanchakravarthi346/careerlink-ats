"""
CareerConnect ATS - Enterprise Email Service
=============================================
Modular, reusable email utility functions.
Views only call these functions - no email logic in views.py.

Designed to work with Django Console backend (development) and
can be switched to SMTP/SendGrid by changing settings.py only.
"""

import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_email(subject, template_name, context, recipient_email):
    """
    Internal helper - renders an HTML template and sends the email.
    All public functions delegate to this.
    
    Returns True on success, False on failure (never raises).
    """
    try:
        if not recipient_email:
            logger.warning(f"Email skipped - no recipient email for template '{template_name}'")
            return False

        html_message = render_to_string(f"emails/{template_name}", context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Email sent: '{subject}' -> {recipient_email}")
        return True

    except Exception as e:
        logger.error(f"Email failed: '{subject}' -> {recipient_email} | Error: {e}")
        return False


# ============================================================
# STATUS CHANGE EMAILS
# ============================================================

def send_shortlisted_email(candidate_name, candidate_email, job_title, company_name):
    """Send email when a candidate is shortlisted."""
    return _send_email(
        subject=f"Great News! You've Been Shortlisted - {job_title} at {company_name}",
        template_name="shortlisted.html",
        context={
            "candidate_name": candidate_name,
            "job_title": job_title,
            "company_name": company_name,
        },
        recipient_email=candidate_email,
    )


def send_rejected_email(candidate_name, candidate_email, job_title, company_name):
    """Send email when a candidate is rejected."""
    return _send_email(
        subject=f"Update on Your Application - {job_title} at {company_name}",
        template_name="rejected.html",
        context={
            "candidate_name": candidate_name,
            "job_title": job_title,
            "company_name": company_name,
        },
        recipient_email=candidate_email,
    )


def send_offer_email(candidate_name, candidate_email, job_title, company_name):
    """Send email when an offer is extended."""
    return _send_email(
        subject=f"Offer Letter - {job_title} at {company_name}",
        template_name="offer_sent.html",
        context={
            "candidate_name": candidate_name,
            "job_title": job_title,
            "company_name": company_name,
        },
        recipient_email=candidate_email,
    )


def send_hired_email(candidate_name, candidate_email, job_title, company_name):
    """Send email when a candidate is hired."""
    return _send_email(
        subject=f"Welcome Aboard! - {job_title} at {company_name}",
        template_name="hired.html",
        context={
            "candidate_name": candidate_name,
            "job_title": job_title,
            "company_name": company_name,
        },
        recipient_email=candidate_email,
    )


def send_status_change_email(candidate_name, candidate_email, job_title, company_name, new_status):
    """
    Generic status change email.
    Routes to the appropriate specific function based on the new status.
    Returns True on success, False on failure or unrecognized status.
    """
    status_handlers = {
        "ShortListed": send_shortlisted_email,
        "Rejected": send_rejected_email,
        "Offer Sent": send_offer_email,
        "Hired": send_hired_email,
    }

    handler = status_handlers.get(new_status)
    if handler:
        return handler(candidate_name, candidate_email, job_title, company_name)

    # For statuses without dedicated emails (Applied, Viewed, etc.)
    logger.info(f"No email template for status '{new_status}' - skipping email.")
    return False


# ============================================================
# INTERVIEW EMAILS
# ============================================================

def send_interview_scheduled_email(candidate_name, candidate_email, job_title, company_name, interview_data):
    """
    Send email when an interview is scheduled.
    interview_data is a dict containing all interview detail fields.
    """
    context = {
        "candidate_name": candidate_name,
        "job_title": job_title,
        "company_name": company_name,
        "interview_round": interview_data.get("interview_round", ""),
        "interview_date": interview_data.get("interview_date", ""),
        "interview_time": interview_data.get("interview_time", ""),
        "time_zone": interview_data.get("time_zone", ""),
        "meeting_type": interview_data.get("meeting_type", ""),
        "meeting_link": interview_data.get("meeting_link", ""),
        "office_address": interview_data.get("office_address", ""),
        "interviewer_name": interview_data.get("interviewer_name", ""),
        "recruiter_email": interview_data.get("recruiter_email", ""),
        "additional_instructions": interview_data.get("additional_instructions", ""),
        "duration_minutes": interview_data.get("duration_minutes", 30),
    }
    return _send_email(
        subject=f"Interview Invitation - {job_title} at {company_name}",
        template_name="interview_invitation.html",
        context=context,
        recipient_email=candidate_email,
    )


def send_interview_rescheduled_email(candidate_name, candidate_email, job_title, company_name, interview_data):
    """Send email when an interview is rescheduled."""
    context = {
        "candidate_name": candidate_name,
        "job_title": job_title,
        "company_name": company_name,
        "interview_round": interview_data.get("interview_round", ""),
        "interview_date": interview_data.get("interview_date", ""),
        "interview_time": interview_data.get("interview_time", ""),
        "time_zone": interview_data.get("time_zone", ""),
        "meeting_type": interview_data.get("meeting_type", ""),
        "meeting_link": interview_data.get("meeting_link", ""),
        "office_address": interview_data.get("office_address", ""),
        "interviewer_name": interview_data.get("interviewer_name", ""),
        "recruiter_email": interview_data.get("recruiter_email", ""),
        "additional_instructions": interview_data.get("additional_instructions", ""),
        "duration_minutes": interview_data.get("duration_minutes", 30),
    }
    return _send_email(
        subject=f"Interview Rescheduled - {job_title} at {company_name}",
        template_name="interview_rescheduled.html",
        context=context,
        recipient_email=candidate_email,
    )


def send_interview_cancelled_email(candidate_name, candidate_email, job_title, company_name, recruiter_note=""):
    """Send email when an interview is cancelled."""
    return _send_email(
        subject=f"Interview Update - {job_title} at {company_name}",
        template_name="interview_cancelled.html",
        context={
            "candidate_name": candidate_name,
            "job_title": job_title,
            "company_name": company_name,
            "recruiter_note": recruiter_note,
        },
        recipient_email=candidate_email,
    )
