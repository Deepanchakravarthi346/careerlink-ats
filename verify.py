import requests
import json
import uuid
import time
import os

BASE_URL = "http://127.0.0.1:8000"
test_id = str(uuid.uuid4())[:8]

def print_result(step, success, response, msg=""):
    mark = "PASS" if success else "FAIL"
    print(f"[{mark}] {step} {msg}")
    if not success:
        print(f"FAILED. STOPPING. Response: {response.text}")
        exit(1)

print(f"--- STARTING FULL API VERIFICATION (Run ID: {test_id}) ---")

# 1. Register Job Seeker
seeker = {"username": f"seeker_{test_id}", "email": f"seeker_{test_id}@test.com", "password": "TestPassword123", "role": "job_seeker", "phone": "1234567890"}
r = requests.post(f"{BASE_URL}/accounts/register/", data=seeker)
print_result("Register Job Seeker", r.status_code == 201, r)

# 2. Register Recruiter
recruiter = {"username": f"rec_{test_id}", "email": f"rec_{test_id}@test.com", "password": "TestPassword123", "role": "recruiter", "phone": "0987654321"}
r = requests.post(f"{BASE_URL}/accounts/register/", data=recruiter)
print_result("Register Recruiter", r.status_code == 201, r)

# 3. Login Job Seeker
r = requests.post(f"{BASE_URL}/accounts/login/", data={"username": seeker["username"], "password": seeker["password"]})
print_result("Login Job Seeker", r.status_code == 200, r)
seeker_tokens = r.json()
seeker_access = seeker_tokens.get("access")
seeker_refresh = seeker_tokens.get("refresh")

# 4. JWT Refresh
r = requests.post(f"{BASE_URL}/accounts/refresh/", data={"refresh": seeker_refresh})
print_result("JWT Refresh Endpoint", r.status_code == 200, r)
seeker_access = r.json().get("access")

# 5. Login Recruiter
r = requests.post(f"{BASE_URL}/accounts/login/", data={"username": recruiter["username"], "password": recruiter["password"]})
print_result("Login Recruiter", r.status_code == 200, r)
recruiter_access = r.json().get("access")

seeker_headers = {"Authorization": f"Bearer {seeker_access}"}
recruiter_headers = {"Authorization": f"Bearer {recruiter_access}"}

# 6. Create Profile (Seeker)
with open("dummy.pdf", "w") as f:
    f.write("dummy pdf content")
with open("dummy.gif", "wb") as f:
    f.write(b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;')

profile_data = {
    "headline": "Tester", "location": "Test City", "about": "I am a tester",
    "skills": "Python, React", "git_hub": "http://github.com",
    "linkedin": "http://linkedin.com", "degree": "B.Sc",
    "field_of_study": "CS", "institution": "Test Univ",
    "start_year": 2020, "end_year": 2024
}
with open("dummy.pdf", "rb") as resume_f, open("dummy.gif", "rb") as pic_f:
    files = {"resume": resume_f, "profile_picture": pic_f}
    r = requests.post(f"{BASE_URL}/accounts/profile/", headers=seeker_headers, data=profile_data, files=files)
print_result("Create Profile (Seeker)", r.status_code == 201, r)

os.remove("dummy.pdf")
os.remove("dummy.gif")

# 7. Post Job (Recruiter)
job_data = {
    "title": "Senior Software Engineer", "description": "Great job", "key_responsibilities": "Code",
    "preferred_qualifications": "Degree", "benefits": "Healthcare",
    "experience": "5 years", "company": "Tech Corp", "location": "Remote",
    "skills": "Python, React", "salary": "$100k", "jop_type": "fulltime"
}
r = requests.post(f"{BASE_URL}/accounts/postjobs/", headers=recruiter_headers, json=job_data)
print_result("Post Job", r.status_code == 201, r)

# 8. View Posted Jobs / Search / Pagination (Recruiter)
r = requests.get(f"{BASE_URL}/accounts/myjobs/?search=Senior&sort=-posted_on", headers=recruiter_headers)
print_result("View Posted Jobs (Pagination + Search)", r.status_code == 200 and "results" in r.json(), r)
my_jobs_res = r.json()["results"]
print_result("Job actually returned in search", len(my_jobs_res) > 0, r)
job_id = my_jobs_res[0]["id"]

# 9. Search Jobs / Pagination (Seeker)
r = requests.get(f"{BASE_URL}/accounts/home/?search=Senior&sort=-posted_on")
print_result("Search Jobs (Home - Pagination)", r.status_code == 200 and "results" in r.json(), r)
home_jobs_res = r.json()["results"]
print_result("Job actually found on home page", any(j["id"] == job_id for j in home_jobs_res), r)

# 10. Apply Job (Seeker)
r_user = requests.get(f"{BASE_URL}/accounts/profiledetails/", headers=seeker_headers)
seeker_id = r_user.json().get("user")

with open("dummy_resume.pdf", "w") as f:
    f.write("resume")
with open("dummy_resume.pdf", "rb") as res_file:
    r = requests.post(f"{BASE_URL}/accounts/applyingjob/", headers=seeker_headers, data={"job": job_id, "applicant": seeker_id}, files={"resume": res_file})
print_result("Apply Job", r.status_code == 201, r)
os.remove("dummy_resume.pdf")

# 11. Applied Jobs / Pagination (Seeker)
r = requests.get(f"{BASE_URL}/accounts/appliedjobs/?status=Applied", headers=seeker_headers)
print_result("Applied Jobs (Pagination + Status Filter)", r.status_code == 200 and "results" in r.json(), r)
applied_jobs_res = r.json()["results"]
print_result("Job verified in applied list", len(applied_jobs_res) > 0, r)

# 12. View Applicants / Pagination (Recruiter)
r = requests.get(f"{BASE_URL}/accounts/applicants/{job_id}/?status=Applied", headers=recruiter_headers)
print_result("View Applicants (Pagination + Filter)", r.status_code == 200 and "results" in r.json(), r)
applicants_res = r.json()["results"]
print_result("Applicant verified in recruiter list", len(applicants_res) > 0, r)
applicant_user_id = applicants_res[0]["applicant"]["id"] if "applicant" in applicants_res[0] and type(applicants_res[0]["applicant"]) == dict else applicants_res[0]["applicant"]

# 13. Shortlist Candidate (Recruiter)
r = requests.patch(f"{BASE_URL}/accounts/applicantstatus/{job_id}/{applicant_user_id}/", headers=recruiter_headers)
print_result("Shortlist Candidate", r.status_code == 200, r)

# 14. Reject Candidate (Recruiter)
r = requests.patch(f"{BASE_URL}/accounts/rejectstatus/{job_id}/{applicant_user_id}/", headers=recruiter_headers)
print_result("Reject Candidate", r.status_code == 200, r)

# 15. Delete Job (Recruiter)
r = requests.delete(f"{BASE_URL}/accounts/deletejob/{job_id}/", headers=recruiter_headers)
print_result("Delete Job", r.status_code == 200, r)

# 16. Dashboard Stats (Recruiter)
r = requests.get(f"{BASE_URL}/accounts/dashboard/", headers=recruiter_headers)
print_result("Dashboard Statistics", r.status_code == 200 and "total_jobs" in r.json(), r)

print("\n--- ALL TESTS PASSED! ---")
