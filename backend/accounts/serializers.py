from rest_framework.serializers import ModelSerializer, CharField
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import *


class Register_serializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password", "role", "phone"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, valid_data):
        password = valid_data.pop("password")
        user = User(**valid_data)
        user.set_password(password)
        user.save()
        return user


class login_serializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({"username": self.user.username, "role": self.user.role})
        return data


class Jobs_serializer(ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class Profile_serializer(ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}


class Profile_view_serializer(ModelSerializer):
    username = CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = Profile
        fields = "__all__"


class Profile_update_serializer(ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"


class Job_show_serializer(ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class Job_save_serializer(ModelSerializer):
    resume = serializers.FileField(required=False)

    class Meta:
        model = Application
        fields = ["job", "applicant", "resume"]


class See_appliedjobs_serializer(ModelSerializer):
    location = CharField(source="job.location", read_only=True)
    salary = CharField(source="job.salary", read_only=True)
    company = CharField(source="job.company", read_only=True)
    title = CharField(source="job.title", read_only=True)
    experience = CharField(source="job.experience", read_only=True)
    applied_on = serializers.DateTimeField(format="%d %b %Y")

    class Meta:
        model = Application
        fields = "__all__"


class Keyword_based_job_location_serializer(ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class Job_suggestion_serializer(ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id",
            "title",
        ]


class Location_suggestion_serializer(ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id",
            "location",
        ]


class Post_job_serializer(ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "title",
            "description",
            "key_responsibilities",
            "preferred_qualifications",
            "benefits",
            "experience",
            "company",
            "location",
            "skills",
            "salary",
            "jop_type",
        ]


class My_job_selializer(ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class Applicant_details_selializer(ModelSerializer):
    username = CharField(source="applicant.username", read_only=True)
    email = CharField(source="applicant.email", read_only=True)

    class Meta:
        model = Application
        fields = "__all__"


class Applicant_profile_serializer(ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = "__all__"


class Applicant_status_selializer(ModelSerializer):
    class Meta:
        model = Application
        fields = "__all__"


class Search_posted_jobs_selializer(ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class Display_posted_job_id_serializer(ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class View_applicant_from_dashboard_serializer(ModelSerializer):
    username = CharField(source="applicant.username", read_only=True)
    email = CharField(source="applicant.email", read_only=True)
    job = CharField(source="job.title", read_only=True)
    company = CharField(source="job.company", read_only=True)

    class Meta:
        model = Application
        fields = "__all__"

# class View_total_rejects_serializer(ModelSerializer):
#     username = CharField(source="applicant.username", read_only=True)
#     email = CharField(source="applicant.email", read_only=True)
#     job = CharField(source="job.title", read_only=True)
#     company = CharField(source="job.company", read_only=True)

#     class Meta:
#         model = Application
#         fields = "__all__"

class RecruiterNoteSerializer(ModelSerializer):
    recruiter_name = CharField(source="recruiter.username", read_only=True)

    class Meta:
        model = RecruiterNote
        fields = "__all__"
        read_only_fields = ["job", "applicant", "recruiter"]


class InterviewScheduleSerializer(ModelSerializer):
    recruiter_name = CharField(source="recruiter.username", read_only=True)

    class Meta:
        model = InterviewSchedule
        fields = "__all__"
        read_only_fields = ["job", "applicant", "recruiter"]


class InterviewDetailSerializer(ModelSerializer):
    class Meta:
        model = InterviewDetail
        fields = "__all__"
        read_only_fields = ["interview"]


class ActivityLogSerializer(ModelSerializer):
    recruiter_name = CharField(source="recruiter.username", read_only=True)

    class Meta:
        model = ActivityLog
        fields = "__all__"
        read_only_fields = ["job", "applicant", "recruiter"]

