from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from .pagination import StandardResultsSetPagination
from .email_service import (
    send_shortlisted_email,
    send_rejected_email,
    send_status_change_email,
    send_interview_scheduled_email,
    send_interview_rescheduled_email,
    send_interview_cancelled_email,
)
import logging

email_logger = logging.getLogger(__name__)


class Register(APIView):
    def post(self, request):
        user_data_register = Register_serializer(data=request.data)
        if user_data_register.is_valid():
            user_data_register.save()
            return Response(
                {"message": "Data Created Successfully"}, status=HTTP_201_CREATED
            )
        else:
            return Response(user_data_register.errors, status=HTTP_400_BAD_REQUEST)


class Login(APIView):
    def post(self, request):
        user_data = login_serializer(data=request.data)
        if user_data.is_valid():
            return Response(user_data.validated_data, status=HTTP_200_OK)
        else:
            return Response({"error": user_data.errors}, status=HTTP_401_UNAUTHORIZED)


class Display_jobs(APIView):
    def get(self, request):
        jobs_details = Job.objects.all().select_related("posted_by")

        search = request.GET.get("search", "").strip()
        job_type = request.GET.get("job_type", "").strip()
        location = request.GET.get("location", "").strip()
        sort = request.GET.get("sort", "-posted_on")  # Default sort by newest

        if search:
            jobs_details = jobs_details.filter(
                Q(title__icontains=search) | Q(company__icontains=search)
            )
        if job_type:
            jobs_details = jobs_details.filter(jop_type__iexact=job_type)
        if location:
            jobs_details = jobs_details.filter(location__icontains=location)

        try:
            jobs_details = jobs_details.order_by(sort)
        except Exception:
            jobs_details = jobs_details.order_by("-posted_on")

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(jobs_details, request, view=self)
        if page is not None:
            serializer = Jobs_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = Jobs_serializer(jobs_details, many=True)
        return Response(serializer.data)


class Display_job_id(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        job_details_id = get_object_or_404(
            Job.objects.select_related("posted_by"), id=id
        )
        applied_job = Application.objects.filter(
            applicant=request.user, job_id=id
        ).exists()
        serializer = Jobs_serializer(job_details_id).data
        serializer["applied_job"] = applied_job
        return Response(serializer, status=HTTP_200_OK)


class Info(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_info = request.user.username
        return Response(user_info)


class Profile_api(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile_data = Profile_serializer(data=request.data)
        if profile_data.is_valid():
            profile_data.save(user=request.user)
            return Response(
                {"message": "Data Created Successfully"}, status=HTTP_201_CREATED
            )
        else:
            return Response(profile_data.errors, status=HTTP_400_BAD_REQUEST)


class Profile_checker(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile_exists = Profile.objects.filter(user=request.user).exists()
        return Response({"profile_exists": profile_exists})


class Profile_view(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        profile_data = Profile.objects.filter(user=request.user).first()

        if not profile_data:
            return Response({"detail": "Profile not found."}, status=404)

        profile_serializer = Profile_serializer(profile_data).data
        return Response(profile_serializer)


class Update_profile(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        data_profile, created = Profile.objects.get_or_create(user=request.user)
        update_data = Profile_update_serializer(
            data_profile,
            data=request.data,
            partial=True,
        )
        if update_data.is_valid():
            update_data.save()
            return Response({"message": "ProfileUpdated"}, status=HTTP_200_OK)
        else:
            return Response(update_data.errors, status=HTTP_400_BAD_REQUEST)


class Job_details(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        applied_job = Application.objects.filter(
            applicant=request.user, job_id=id
        ).exists()
        job_data = get_object_or_404(Job.objects.select_related("posted_by"), id=id)
        job_data_serilizer = Job_show_serializer(job_data).data
        return Response(job_data_serilizer, status=HTTP_200_OK)


class Save_job_details(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        already_apply = Application.objects.filter(
            applicant=request.user, job_id=request.data.get("job")
        ).exists()
        job_details_data = Job_save_serializer(data=request.data)
        if already_apply:
            return Response(
                {"message": "You have already applied for this job."},
                status=HTTP_400_BAD_REQUEST,
            )
        if job_details_data.is_valid():
            resume = request.FILES.get("resume")
            if resume:
                job_details_data.save(resume=resume)
            else:
                profile = get_object_or_404(Profile, user=request.user)
                job_details_data.save(resume=profile.resume)
            return Response(
                {"message": "Application Submited Sucessfully"}, status=HTTP_201_CREATED
            )
        else:
            return Response(job_details_data.errors, status=HTTP_400_BAD_REQUEST)


class See_applied_jobs(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applied_jobs = Application.objects.filter(
            applicant=request.user
        ).select_related("job", "job__posted_by")

        search = request.GET.get("search", "").strip()
        sort = request.GET.get("sort", "-applied_on")
        status = request.GET.get("status", "").strip()

        if search:
            applied_jobs = applied_jobs.filter(job__title__icontains=search)
        if status:
            applied_jobs = applied_jobs.filter(status__iexact=status)

        try:
            applied_jobs = applied_jobs.order_by(sort)
        except Exception:
            applied_jobs = applied_jobs.order_by("-applied_on")

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(applied_jobs, request, view=self)
        if page is not None:
            serializer = See_appliedjobs_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = See_appliedjobs_serializer(applied_jobs, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class Keyword_based_job_location(APIView):
    def get(self, request, keyword, location):
        keyword_based = Job.objects.filter(
            title__icontains=keyword, location__icontains=location
        )
        serializer = Keyword_based_job_location_serializer(keyword_based, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class Job_suggestion(APIView):
    def get(
        self,
        request,
        keyword,
    ):
        keyword_based = Job.objects.filter(
            title__icontains=keyword,
        )[:5]
        serializer = Job_suggestion_serializer(keyword_based, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class Location_suggestion(APIView):
    def get(self, request, location):
        keyword_based = Job.objects.filter(
            location__icontains=location,
        )[:5]
        serializer = Location_suggestion_serializer(keyword_based, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class Post_job(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        save_jobs = Post_job_serializer(data=request.data)
        if save_jobs.is_valid():
            save_jobs.save(posted_by=request.user)
            return Response(
                {"message": "Job Posted Succesfully"}, status=HTTP_201_CREATED
            )
        else:
            print(save_jobs.errors)
            return Response(save_jobs.errors, status=HTTP_400_BAD_REQUEST)


class My_jobs_view(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        my_jobs = Job.objects.filter(posted_by=request.user)

        search = request.GET.get("search", "").strip()
        sort = request.GET.get("sort", "-posted_on")

        if search:
            my_jobs = my_jobs.filter(
                Q(title__icontains=search) | Q(company__icontains=search)
            )

        try:
            my_jobs = my_jobs.order_by(sort)
        except Exception:
            my_jobs = my_jobs.order_by("-posted_on")

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(my_jobs, request, view=self)
        if page is not None:
            serializer = My_job_selializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = My_job_selializer(my_jobs, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class Applicant_details(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        applicant = Application.objects.filter(
            job_id=id, job__posted_by=request.user
        ).select_related("applicant", "applicant__profile")

        search = request.GET.get("search", "").strip()
        sort = request.GET.get("sort", "-applied_on")
        status = request.GET.get("status", "").strip()

        if search:
            applicant = applicant.filter(
                Q(applicant__username__icontains=search)
                | Q(applicant__email__icontains=search)
            )
        if status:
            applicant = applicant.filter(status__iexact=status)

        try:
            applicant = applicant.order_by(sort)
        except Exception:
            applicant = applicant.order_by("-applied_on")

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(applicant, request, view=self)
        if page is not None:
            serializer = Applicant_details_selializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = Applicant_details_selializer(applicant, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class Applicant_profile(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        applicant_profile = get_object_or_404(Profile, user_id=id)
        serializer = Applicant_profile_serializer(applicant_profile).data
        return Response(serializer, status=HTTP_200_OK)


class Applicant_status(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id, ap_id):
        applicant_job_status = get_object_or_404(
            Application, job_id=id, applicant_id=ap_id, job__posted_by=request.user
        )
        applicant_job_status.status = "ShortListed"
        applicant_job_status.save()
        # Enterprise: Email notification + Activity log
        try:
            send_shortlisted_email(
                applicant_job_status.applicant.username,
                applicant_job_status.applicant.email,
                applicant_job_status.job.title,
                applicant_job_status.job.company,
            )
            ActivityLog.objects.create(
                job=applicant_job_status.job,
                applicant=applicant_job_status.applicant,
                recruiter=request.user,
                action="Candidate Shortlisted",
                details=f"Shortlisted for {applicant_job_status.job.title}",
            )
        except Exception as e:
            email_logger.error(f"Email/log error in Applicant_status: {e}")
        serializer = Applicant_status_selializer(applicant_job_status)
        return Response(serializer.data, status=HTTP_200_OK)


class Reject_status(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id, ap_id):
        applicant_job_status = get_object_or_404(
            Application, job_id=id, applicant_id=ap_id, job__posted_by=request.user
        )
        applicant_job_status.status = "Rejected"
        applicant_job_status.save()
        # Enterprise: Email notification + Activity log
        try:
            send_rejected_email(
                applicant_job_status.applicant.username,
                applicant_job_status.applicant.email,
                applicant_job_status.job.title,
                applicant_job_status.job.company,
            )
            ActivityLog.objects.create(
                job=applicant_job_status.job,
                applicant=applicant_job_status.applicant,
                recruiter=request.user,
                action="Candidate Rejected",
                details=f"Rejected for {applicant_job_status.job.title}",
            )
        except Exception as e:
            email_logger.error(f"Email/log error in Reject_status: {e}")
        serializer = Applicant_status_selializer(applicant_job_status)
        return Response(serializer.data, status=HTTP_200_OK)


class Search_posted_jobs(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job):
        search_job = Job.objects.filter(title__icontains=job, posted_by_id=request.user)
        serializer = Search_posted_jobs_selializer(search_job, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class Display_posted_job_id(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        job = get_object_or_404(Job, id=id, posted_by=request.user)
        serializer = Display_posted_job_id_serializer(job).data
        return Response(serializer, status=HTTP_200_OK)


class Display_edit_posted_job(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        job = get_object_or_404(Job, id=id, posted_by=request.user)
        serializer = Display_posted_job_id_serializer(job).data
        return Response(serializer, status=HTTP_200_OK)


class Edit_posted_job(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        job = get_object_or_404(Job, id=id, posted_by=request.user)
        serializer = Display_posted_job_id_serializer(
            job, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response("Job updated successfully", status=HTTP_200_OK)
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class Delete_job(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        job = get_object_or_404(Job, id=id, posted_by=request.user)
        job.delete()
        return Response({"message": "Job deleted successfully"}, status=HTTP_200_OK)


class Recuiter_dashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recuiter = Job.objects.filter(posted_by=request.user).count()

        total_applications = Application.objects.filter(
            job__posted_by=request.user
        ).count()
        total_shortlist = Application.objects.filter(
            job__posted_by=request.user, status="ShortListed"
        ).count()
        total_rejected = Application.objects.filter(
            job__posted_by=request.user, status="Rejected"
        ).count()
        total_pending = Application.objects.filter(
            job__posted_by=request.user, status="Applied"
        ).count()

        return Response(
            {
                "total_jobs": recuiter,
                "total_applications": total_applications,
                "total_shortlist": total_shortlist,
                "total_rejected": total_rejected,
                "total_pending": total_pending,
            },
            status=HTTP_200_OK,
        )


class View_applicant_from_dashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.GET.get("status", None)
        if status_filter:
            applicants = Application.objects.filter(
                job__posted_by=request.user, status=status_filter
            ).select_related("job", "applicant", "applicant__profile")
        else:
            applicants = Application.objects.filter(
                job__posted_by=request.user
            ).select_related("job", "applicant", "applicant__profile")

        serializer = View_applicant_from_dashboard_serializer(
            applicants, many=True, context={"request": request}
        )
        return Response(serializer.data, status=HTTP_200_OK)


class View_total_jobs(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(posted_by=request.user)
        serializer = Display_posted_job_id_serializer(jobs, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class View_total_rejects(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reject = Application.objects.filter(
            job__posted_by=request.user, status="Rejected"
        ).select_related("job", "applicant", "applicant__profile")
        serializer = View_applicant_from_dashboard_serializer(
            reject, many=True, context={"request": request}
        )
        return Response(serializer.data, status=HTTP_200_OK)


class View_total_shortlist(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reject = Application.objects.filter(
            job__posted_by=request.user, status="ShortListed"
        ).select_related("job", "applicant", "applicant__profile")
        serializer = View_applicant_from_dashboard_serializer(
            reject, many=True, context={"request": request}
        )
        return Response(serializer.data, status=HTTP_200_OK)


class CandidateCompatibility(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id, applicant_id):
        job = get_object_or_404(Job, id=job_id)
        profile = get_object_or_404(Profile, user_id=applicant_id)

        job_skills = [s.strip().lower() for s in job.skills.split(",") if s.strip()]
        candidate_skills = [
            s.strip().lower() for s in profile.skills.split(",") if s.strip()
        ]

        job_skills_set = set(job_skills)
        candidate_skills_set = set(candidate_skills)

        matched = list(job_skills_set & candidate_skills_set)
        missing = list(job_skills_set - candidate_skills_set)
        strengths = list(candidate_skills_set - job_skills_set)

        if len(job_skills_set) > 0:
            score = round((len(matched) / len(job_skills_set)) * 100)
        else:
            score = 0

        if score >= 80:
            recommendation = "Strong Match — Highly recommended for this role."
        elif score >= 60:
            recommendation = (
                "Good Match — Meets most requirements with minor skill gaps."
            )
        elif score >= 40:
            recommendation = (
                "Moderate Match — Consider for interview with skill development plan."
            )
        else:
            recommendation = (
                "Low Match — Significant skill gaps. May need extensive training."
            )

        return Response(
            {
                "applicant_name": profile.user.username,
                "applicant_headline": profile.headline,
                "applicant_location": profile.location,
                "job_title": job.title,
                "job_company": job.company,
                "overall_score": score,
                "matched_skills": matched,
                "missing_skills": missing,
                "candidate_strengths": strengths,
                "total_required": len(job_skills_set),
                "total_matched": len(matched),
                "recommendation": recommendation,
            },
            status=HTTP_200_OK,
        )


class CandidateComparison(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id, applicant1_id, applicant2_id):
        job = get_object_or_404(Job, id=job_id)
        profile1 = get_object_or_404(Profile, user_id=applicant1_id)
        profile2 = get_object_or_404(Profile, user_id=applicant2_id)

        job_skills = [s.strip().lower() for s in job.skills.split(",") if s.strip()]
        job_skills_set = set(job_skills)

        def compute_compatibility(profile):
            candidate_skills = [
                s.strip().lower() for s in profile.skills.split(",") if s.strip()
            ]
            candidate_skills_set = set(candidate_skills)
            matched = list(job_skills_set & candidate_skills_set)
            missing = list(job_skills_set - candidate_skills_set)
            strengths = list(candidate_skills_set - job_skills_set)
            score = (
                round((len(matched) / len(job_skills_set)) * 100)
                if job_skills_set
                else 0
            )
            return {
                "score": score,
                "matched_skills": matched,
                "missing_skills": missing,
                "strengths": strengths,
            }

        def get_profile_data(profile):
            compat = compute_compatibility(profile)
            return {
                "user_id": profile.user.id,
                "username": profile.user.username,
                "email": profile.user.email,
                "headline": profile.headline,
                "location": profile.location,
                "about": profile.about,
                "skills": [s.strip() for s in profile.skills.split(",") if s.strip()],
                "degree": profile.degree,
                "field_of_study": profile.field_of_study,
                "institution": profile.institution,
                "start_year": profile.start_year,
                "end_year": profile.end_year,
                "resume": profile.resume.url if profile.resume else None,
                "profile_picture": (
                    profile.profile_picture.url if profile.profile_picture else None
                ),
                "git_hub": profile.git_hub,
                "linkedin": profile.linkedin,
                "compatibility": compat,
            }

        return Response(
            {
                "job_title": job.title,
                "job_company": job.company,
                "candidate1": get_profile_data(profile1),
                "candidate2": get_profile_data(profile2),
            },
            status=HTTP_200_OK,
        )


class UpdatePipelineStage(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, job_id, applicant_id):
        application = get_object_or_404(
            Application, job_id=job_id, applicant_id=applicant_id
        )
        new_status = request.data.get("status")
        valid_statuses = [choice[0] for choice in Application.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Valid options: {valid_statuses}"},
                status=HTTP_400_BAD_REQUEST,
            )
        application.status = new_status
        application.save()
        # Enterprise: Email notification + Activity log
        try:
            send_status_change_email(
                application.applicant.username,
                application.applicant.email,
                application.job.title,
                application.job.company,
                new_status,
            )
            ActivityLog.objects.create(
                job=application.job,
                applicant=application.applicant,
                recruiter=request.user,
                action="Status Changed",
                details=f"Status changed to {new_status}",
            )
        except Exception as e:
            email_logger.error(f"Email/log error in UpdatePipelineStage: {e}")
        serializer = Applicant_status_selializer(application)
        return Response(serializer.data, status=HTTP_200_OK)


class CandidateNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id, applicant_id):
        notes = RecruiterNote.objects.filter(
            job_id=job_id, applicant_id=applicant_id
        ).order_by("-created_at")
        serializer = RecruiterNoteSerializer(notes, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request, job_id, applicant_id):
        job = get_object_or_404(Job, id=job_id)
        applicant = get_object_or_404(User, id=applicant_id)
        note_text = request.data.get("note")

        if not note_text:
            return Response(
                {"error": "Note text is required"}, status=HTTP_400_BAD_REQUEST
            )

        note = RecruiterNote.objects.create(
            job=job, applicant=applicant, recruiter=request.user, note=note_text
        )
        serializer = RecruiterNoteSerializer(note)
        return Response(serializer.data, status=HTTP_201_CREATED)


class DeleteNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, note_id):
        note = get_object_or_404(RecruiterNote, id=note_id)
        if note.recruiter != request.user:
            return Response(
                {"error": "You can only delete your own notes"},
                status=HTTP_403_FORBIDDEN,
            )
        note.delete()
        return Response(status=HTTP_204_NO_CONTENT)


class CandidateInterviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id, applicant_id):
        interviews = InterviewSchedule.objects.filter(
            job_id=job_id, applicant_id=applicant_id
        ).order_by("scheduled_date")
        serializer = InterviewScheduleSerializer(interviews, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request, job_id, applicant_id):
        job = get_object_or_404(Job, id=job_id)
        applicant = get_object_or_404(User, id=applicant_id)

        serializer = InterviewScheduleSerializer(data=request.data)
        if serializer.is_valid():
            interview = serializer.save(
                recruiter=request.user, job=job, applicant=applicant
            )

            # Enterprise: Create InterviewDetail, send email, log activity
            try:
                detail_data = {
                    "interview_round": request.data.get("interview_round", "Technical"),
                    "time_zone": request.data.get("time_zone", "Asia/Kolkata"),
                    "meeting_type": request.data.get("meeting_type", "Google Meet"),
                    "office_address": request.data.get("office_address", ""),
                    "interviewer_name": request.data.get("interviewer_name", ""),
                    "recruiter_email": request.data.get("recruiter_email", ""),
                    "additional_instructions": request.data.get(
                        "additional_instructions", ""
                    ),
                    "internal_notes": request.data.get("internal_notes", ""),
                    "send_email": request.data.get("send_email", True),
                }
                InterviewDetail.objects.create(interview=interview, **detail_data)

                # Activity log
                ActivityLog.objects.create(
                    job=job,
                    applicant=applicant,
                    recruiter=request.user,
                    action="Interview Scheduled",
                    details=f"{detail_data['interview_round']} round scheduled",
                )

                # Send email if checkbox is enabled
                if detail_data["send_email"]:
                    scheduled_dt = interview.scheduled_date
                    email_data = {
                        **detail_data,
                        "interview_date": (
                            scheduled_dt.strftime("%d/%m/%Y") if scheduled_dt else ""
                        ),
                        "interview_time": (
                            scheduled_dt.strftime("%I:%M %p") if scheduled_dt else ""
                        ),
                        "meeting_link": interview.meeting_link or "",
                        "duration_minutes": interview.duration_minutes,
                    }
                    send_interview_scheduled_email(
                        applicant.username,
                        applicant.email,
                        job.title,
                        job.company,
                        email_data,
                    )
                    ActivityLog.objects.create(
                        job=job,
                        applicant=applicant,
                        recruiter=request.user,
                        action="Email Sent",
                        details="Interview invitation email sent",
                    )
            except Exception as e:
                email_logger.error(
                    f"Enterprise extension error in CandidateInterviewsView: {e}"
                )

            return Response(serializer.data, status=HTTP_201_CREATED)

        print("InterviewScheduleSerializer errors:", serializer.errors)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class UpdateInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, interview_id):
        interview = get_object_or_404(InterviewSchedule, id=interview_id)
        new_status = request.data.get("status")
        if new_status not in [choice[0] for choice in InterviewSchedule.STATUS_CHOICES]:
            return Response({"error": "Invalid status"}, status=HTTP_400_BAD_REQUEST)

        old_status = interview.status
        interview.status = new_status
        interview.save()

        # Enterprise: Email notification + Activity log
        try:
            detail = getattr(interview, "detail", None)
            if new_status == "Cancelled" and old_status != "Cancelled":
                recruiter_note = detail.internal_notes if detail else ""
                send_interview_cancelled_email(
                    interview.applicant.username,
                    interview.applicant.email,
                    interview.job.title,
                    interview.job.company,
                    recruiter_note,
                )
                ActivityLog.objects.create(
                    job=interview.job,
                    applicant=interview.applicant,
                    recruiter=request.user,
                    action="Interview Cancelled",
                    details=f"{interview.interview_type} interview cancelled",
                )
                ActivityLog.objects.create(
                    job=interview.job,
                    applicant=interview.applicant,
                    recruiter=request.user,
                    action="Email Sent",
                    details="Interview cancellation email sent",
                )
            elif new_status == "Completed" and old_status != "Completed":
                ActivityLog.objects.create(
                    job=interview.job,
                    applicant=interview.applicant,
                    recruiter=request.user,
                    action="Interview Completed",
                    details=f"{interview.interview_type} interview completed",
                )
        except Exception as e:
            email_logger.error(
                f"Enterprise extension error in UpdateInterviewView: {e}"
            )

        serializer = InterviewScheduleSerializer(interview)
        return Response(serializer.data, status=HTTP_200_OK)

    def delete(self, request, interview_id):
        interview = get_object_or_404(InterviewSchedule, id=interview_id)
        interview.delete()
        return Response(status=HTTP_204_NO_CONTENT)


class RecruiterAnalytics(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        six_months_ago = datetime.today() - timedelta(days=180)

        # 1. Jobs posted per month
        jobs = Job.objects.filter(posted_by=request.user, posted_on__gte=six_months_ago)
        jobs_per_month = (
            jobs.annotate(month=TruncMonth("posted_on"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        # 2. Applications per month
        apps = Application.objects.filter(
            job__posted_by=request.user, applied_on__gte=six_months_ago
        )
        apps_per_month = (
            apps.annotate(month=TruncMonth("applied_on"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        # Format month names for frontend (e.g. 'Jan')
        months_dict = {}
        for i in range(5, -1, -1):
            m = (datetime.today() - timedelta(days=i * 30)).strftime("%b")
            months_dict[m] = {"month": m, "jobs": 0, "applications": 0}

        for item in jobs_per_month:
            m_name = item["month"].strftime("%b")
            if m_name in months_dict:
                months_dict[m_name]["jobs"] = item["count"]

        for item in apps_per_month:
            m_name = item["month"].strftime("%b")
            if m_name in months_dict:
                months_dict[m_name]["applications"] = item["count"]

        monthly_trends = list(months_dict.values())

        # 3. Overall Stats
        total_apps = Application.objects.filter(job__posted_by=request.user).count()
        if total_apps > 0:
            shortlist_rate = round(
                (
                    Application.objects.filter(
                        job__posted_by=request.user, status="ShortListed"
                    ).count()
                    / total_apps
                )
                * 100
            )
            reject_rate = round(
                (
                    Application.objects.filter(
                        job__posted_by=request.user, status="Rejected"
                    ).count()
                    / total_apps
                )
                * 100
            )
            hire_rate = round(
                (
                    Application.objects.filter(
                        job__posted_by=request.user, status="Hired"
                    ).count()
                    / total_apps
                )
                * 100
            )
        else:
            shortlist_rate = reject_rate = hire_rate = 0

        total_jobs = Job.objects.filter(posted_by=request.user).count()
        avg_apps_per_job = round(total_apps / total_jobs) if total_jobs > 0 else 0

        # 4. Most Applied Jobs
        top_jobs = (
            Job.objects.filter(posted_by=request.user)
            .annotate(app_count=Count("application"))
            .order_by("-app_count")[:5]
        )
        most_applied_jobs = [
            {"title": job.title, "applications": job.app_count} for job in top_jobs
        ]

        # 5. Top Skills
        all_skills = []
        for job in Job.objects.filter(posted_by=request.user):
            all_skills.extend([s.strip().lower() for s in job.skills.split(",")])

        skill_counts = {}
        for skill in all_skills:
            if skill:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
        top_skills = sorted(
            [{"name": k, "value": v} for k, v in skill_counts.items()],
            key=lambda x: x["value"],
            reverse=True,
        )[:6]

        # 6. Pipeline distribution
        status_counts = (
            Application.objects.filter(job__posted_by=request.user)
            .values("status")
            .annotate(count=Count("id"))
        )
        pipeline_dist = [
            {"name": item["status"], "value": item["count"]} for item in status_counts
        ]

        return Response(
            {
                "monthly_trends": monthly_trends,
                "total_applications": total_apps,
                "shortlist_rate": shortlist_rate,
                "reject_rate": reject_rate,
                "hire_rate": hire_rate,
                "avg_apps_per_job": avg_apps_per_job,
                "most_applied_jobs": most_applied_jobs,
                "top_skills": top_skills,
                "pipeline_dist": pipeline_dist,
            },
            status=HTTP_200_OK,
        )


class ActivityLogView(APIView):
    """
    GET: Fetch activity timeline for a specific candidate on a specific job.
    Completely isolated — does not affect any existing view.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, job_id, applicant_id):
        activities = ActivityLog.objects.filter(
            job_id=job_id, applicant_id=applicant_id
        ).order_by("-created_at")
        serializer = ActivityLogSerializer(activities, many=True)
        return Response(serializer.data, status=HTTP_200_OK)
