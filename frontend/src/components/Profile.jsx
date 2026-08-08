import React, { useEffect, useState } from "react";
import "../css/Recruiter.css"; // Reuse form layout css
import { useNavigate } from "react-router-dom";
import { FaUser, FaSpinner, FaMapMarkerAlt, FaFileAlt, FaGraduationCap, FaLink } from "react-icons/fa";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Profile = () => {
  const [picture, setPicture] = useState(null);
  const [username, setUsername] = useState("");
  const [professionalHeadline, setProfessionalHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [aboutme, setAboutme] = useState("");
  const [skill, setSkill] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [degree, setDegree] = useState("");
  const [field_of_study, setField_of_study] = useState("");
  const [institution, setInstitution] = useState("");
  const [startyear, setStartyear] = useState("");
  const [endyear, setEndyear] = useState("");
  const [resume, setResume] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const access_token = localStorage.getItem("accessTokens");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/accounts/username/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsername(data))
      .catch((error) => console.error("Failed To Fetch Data"));
  }, [access_token]);

  function saveprofile(e) {
    e.preventDefault();
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!professionalHeadline.trim()) newErrors.professionalHeadline = "Professional Headline is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!aboutme.trim()) newErrors.aboutme = "About me is required.";
    if (!skill.trim()) newErrors.skill = "Skills are required.";
    if (!resume) newErrors.resume = "Resume is required.";

    if (!startyear) {
      newErrors.startyear = "Joining year is required.";
    }
    if (!endyear) {
      newErrors.endyear = "Passed-out year is required.";
    }

    if (startyear && endyear) {
      const start = Number(startyear);
      const end = Number(endyear);

      if (start < 1950 || start > currentYear || isNaN(start)) {
        newErrors.startyear = "Joining year must be a valid year.";
      }
      if (end < 1950 || end > currentYear + 10 || isNaN(end)) {
        newErrors.endyear = "Passed-out year must be a valid year.";
      }

      if (!newErrors.startyear && !newErrors.endyear && start >= end) {
        newErrors.endyear = "Joining year must be earlier than passed-out year.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsSaving(true);
    const formData = new FormData();
    formData.append("headline", professionalHeadline);
    formData.append("location", location);
    formData.append("about", aboutme);
    formData.append("skills", skill);
    formData.append("git_hub", github);
    formData.append("linkedin", linkedin);
    formData.append("degree", degree);
    formData.append("field_of_study", field_of_study);
    formData.append("institution", institution);
    formData.append("start_year", startyear);
    formData.append("end_year", endyear);
    if(resume) formData.append("resume", resume);
    if(picture) formData.append("profile_picture", picture);

    fetch(`${API_BASE}/accounts/profile/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save profile");
        return data;
      })
      .then((data) => {
        alert(data.message);
        navigate("/home");
      })
      .catch((error) => {
        console.error(error);
        alert(error.message || "Something went wrong. Please try again.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  return (
    <div className="postjob-container">
      <div className="page-header">
        <h1>Complete Your Profile</h1>
        <p>A complete profile helps recruiters discover you faster.</p>
      </div>

      <form className="job-form" onSubmit={saveprofile}>
        <div className="form-card">
          <h2><FaUser style={{color: 'var(--color-primary)'}}/> Basic Information</h2>
          
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'var(--color-primary)' }}>
              {picture ? '🖼️' : <FaUser />}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Profile Picture</label>
              <input type="file" accept="image/*" onChange={(e) => setPicture(e.target.files[0])} />
            </div>
          </div>

          <div className="grid">
            <Input label="Username" type="text" value={username} readOnly />
            <Input label="Professional Headline" type="text" value={professionalHeadline} onChange={(e) => setProfessionalHeadline(e.target.value)} placeholder="e.g. Senior Frontend Developer" required error={errors.professionalHeadline} />
            <Input label="Location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" required error={errors.location} />
          </div>
        </div>

        <div className="form-card">
          <h2><FaFileAlt style={{color: 'var(--color-primary)'}}/> About & Skills</h2>
          <Textarea label="About Me" rows="5" value={aboutme} onChange={(e) => setAboutme(e.target.value)} placeholder="Tell recruiters about your experience and career goals..." required error={errors.aboutme} />
          <Textarea label="Professional Skills (comma separated)" rows="3" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="React, Node.js, Python, Leadership..." required error={errors.skill} />
        </div>

        <div className="form-card">
          <h2><FaGraduationCap style={{color: 'var(--color-primary)'}}/> Education</h2>
          <div className="grid">
            <Input label="Degree" type="text" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="e.g. B.S. Computer Science" />
            <Input label="Institution" type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Stanford University" />
            <Input label="Field of Study" type="text" value={field_of_study} onChange={(e) => setField_of_study(e.target.value)} placeholder="e.g. Software Engineering" />
            <Input label="Start Year" type="number" value={startyear} onChange={(e) => setStartyear(e.target.value)} placeholder="YYYY" error={errors.startyear} />
            <Input label="End Year" type="number" value={endyear} onChange={(e) => setEndyear(e.target.value)} placeholder="YYYY" error={errors.endyear} />
          </div>
        </div>

        <div className="form-card">
          <h2><FaLink style={{color: 'var(--color-primary)'}}/> Social Links & Resume</h2>
          <div className="grid">
            <Input label="LinkedIn URL" type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
            <Input label="GitHub URL" type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" />
          </div>
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Resume (PDF/DOCX) *</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} required className={errors.resume ? 'ui-input-error' : ''} />
            {errors.resume && <span className="ui-input-error-msg" style={{display: 'block', marginTop: '4px'}}>{errors.resume}</span>}
          </div>
        </div>

        <div className="button-group">
          <Button variant="secondary" type="button" onClick={() => navigate("/home")}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? <><FaSpinner className="spinner-icon" /> Saving...</> : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
