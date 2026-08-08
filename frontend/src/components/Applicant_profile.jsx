import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import BackButton from "./ui/BackButton";
import "../css/Applicant_profile.css";
import { FaEnvelope, FaMapMarkerAlt, FaGithub, FaLinkedin, FaFilePdf, FaUserTie, FaGraduationCap, FaAlignLeft, FaTools, FaChartLine, FaArrowLeft, FaUser } from "react-icons/fa";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Skeleton from "./ui/Skeleton";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Applicant_profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const access_token = localStorage.getItem("accessTokens");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const job_id = location.state?.job_id;

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/accounts/applicantprofile/${id}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, [id, access_token]);

  if (isLoading) {
    return (
      <div className="applicant-profile-page">
        <Skeleton type="card" style={{ height: "250px", marginBottom: "var(--spacing-5)" }} />
        <div className="ap-content-grid">
          <Skeleton type="card" style={{ height: "400px" }} />
          <Skeleton type="card" style={{ height: "300px" }} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="applicant-profile-page" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Profile Not Found</h2>
        <BackButton />
      </div>
    );
  }

  const skills = profile.skills?.split(",").map((skill) => skill.trim()).filter(s => s) || [];

  return (
    <div className="applicant-profile-page">
      <div className="ap-header">
        <BackButton />
        
        {job_id && (
          <Button variant="primary" onClick={() => navigate(`/compatibility/${job_id}/${id}`)}>
            <FaChartLine /> View Compatibility Score
          </Button>
        )}
      </div>

      <div className="ap-hero-card">
        <div className="ap-avatar-container">
          {profile.profile_picture ? (
            <img src={`${API_BASE}${profile.profile_picture}`} alt="Profile" />
          ) : (
            <FaUser />
          )}
        </div>

        <div className="ap-info-container">
          <h1 className="ap-name">{profile.username}</h1>
          <div className="ap-headline">{profile.headline || "No headline provided"}</div>

          <div className="ap-contact-grid">
            <div className="ap-contact-item">
              <FaEnvelope /> {profile.email}
            </div>
            {profile.location && (
              <div className="ap-contact-item">
                <FaMapMarkerAlt /> {profile.location}
              </div>
            )}
          </div>

          <div className="ap-action-buttons">
            {profile.resume && (
              <Button 
                variant="primary"
                onClick={() => window.open(`${API_BASE}${profile.resume}`, "_blank")}
              >
                <FaFilePdf /> View Resume
              </Button>
            )}
            
            {job_id && (
              <Button 
                variant="secondary"
                style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', color: 'white' }}
                onClick={() => navigate(`/tracker/${job_id}/${id}`)}
              >
                📝 Applicant Tracker
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="ap-content-grid">
        <div className="ap-main-col">
          <div className="ap-section-card">
            <div className="ap-section-header">
              <FaAlignLeft className="ap-section-icon" />
              <h2>About Candidate</h2>
            </div>
            <div className="ap-text-content">
              {profile.about || "This candidate hasn't provided an about section yet."}
            </div>
          </div>

          <div className="ap-section-card">
            <div className="ap-section-header">
              <FaTools className="ap-section-icon" />
              <h2>Skills</h2>
            </div>
            {skills.length > 0 ? (
              <div className="ap-skills-wrapper">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            ) : (
              <div className="ap-text-content">No skills listed.</div>
            )}
          </div>

          <div className="ap-section-card">
            <div className="ap-section-header">
              <FaGraduationCap className="ap-section-icon" />
              <h2>Education</h2>
            </div>
            {profile.degree || profile.institution ? (
              <div className="ap-education-block">
                <div className="ap-edu-degree">{profile.degree}</div>
                <div className="ap-edu-school">{profile.field_of_study && `${profile.field_of_study} at `}{profile.institution}</div>
                {(profile.start_year || profile.end_year) && (
                  <div className="ap-edu-years">{profile.start_year} - {profile.end_year}</div>
                )}
              </div>
            ) : (
              <div className="ap-text-content">No education details provided.</div>
            )}
          </div>
        </div>

        <div className="ap-side-col">
          <div className="ap-section-card">
            <div className="ap-section-header">
              <FaUserTie className="ap-section-icon" />
              <h2>Social Links</h2>
            </div>
            <div className="ap-links-list">
              {profile.git_hub ? (
                <a href={profile.git_hub.startsWith('http') ? profile.git_hub : `https://${profile.git_hub}`} target="_blank" rel="noreferrer" className="ap-link-item">
                  <FaGithub size={24} /> GitHub Profile
                </a>
              ) : (
                <div className="ap-link-item" style={{opacity: 0.5}}><FaGithub size={24} /> No GitHub link</div>
              )}

              {profile.linkedin ? (
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="ap-link-item">
                  <FaLinkedin size={24} /> LinkedIn Profile
                </a>
              ) : (
                <div className="ap-link-item" style={{opacity: 0.5}}><FaLinkedin size={24} /> No LinkedIn link</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applicant_profile;
