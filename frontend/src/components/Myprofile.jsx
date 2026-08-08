import React, { useEffect, useState } from "react";
import "../css/Myprofile.css";
import { useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import {
  FaUserEdit,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaFilePdf,
  FaGraduationCap,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaTools,
  FaLink,
  FaBriefcase,
  FaArrowLeft
} from "react-icons/fa";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Skeleton from "./ui/Skeleton";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

function MyProfile() {
  const [profileview, setProfileview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const access_token = localStorage.getItem("accessTokens");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/accounts/profileview/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfileview(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [access_token]);

  if (isLoading) {
    return (
      <div className="profile-page">
        <Skeleton type="card" style={{ height: "200px", marginBottom: "24px" }} />
        <div className="profile-grid">
          <Skeleton type="card" style={{ height: "400px" }} />
          <Skeleton type="card" style={{ height: "300px" }} />
        </div>
      </div>
    );
  }

  if (!profileview) return <div className="profile-page">Profile not found.</div>;

  const skillsArray = profileview.skills?.split(",").filter(s => s.trim()) || [];

  return (
    <div className="profile-page">
      <div style={{ marginBottom: '16px' }}>
        <BackButton />
      </div>
      <div className="profile-header-card">
        <div className="profile-header-main">
          <div className="profile-image-container">
            {profileview.profile_picture ? (
              <img src={`${API_BASE}${profileview.profile_picture}`} alt="Profile" />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontSize: '48px', color: 'var(--color-border)' }}>
                <FaUser />
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1>{profileview.username}</h1>
            <div className="profile-headline">{profileview.headline || "Add a professional headline"}</div>
            
            <div className="profile-meta">
              <span className="profile-meta-item"><FaMapMarkerAlt /> {profileview.location || "Location not set"}</span>
              <span className="profile-meta-item"><FaEnvelope /> {profileview.email || "Email not set"}</span>
              {profileview.phone && <span className="profile-meta-item"><FaPhone /> {profileview.phone}</span>}
            </div>
          </div>
        </div>

        <Button variant="secondary" className="profile-edit-btn" onClick={() => navigate("/updateprofile")}>
          <FaUserEdit /> Edit Profile
        </Button>
      </div>

      <div className="profile-grid">
        <div className="profile-main-col">
          <Card>
            <div className="profile-card-header">
              <FaUser className="profile-card-icon" />
              <h2>About</h2>
            </div>
            <p className="profile-about-text">
              {profileview.about || "No summary provided. Edit your profile to add an about section."}
            </p>
          </Card>

          <Card>
            <div className="profile-card-header">
              <FaTools className="profile-card-icon" />
              <h2>Skills</h2>
            </div>
            {skillsArray.length > 0 ? (
              <div className="profile-skills-list">
                {skillsArray.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill.trim()}</Badge>
                ))}
              </div>
            ) : (
              <p className="profile-about-text">No skills added yet.</p>
            )}
          </Card>

          <Card>
            <div className="profile-card-header">
              <FaGraduationCap className="profile-card-icon" />
              <h2>Education</h2>
            </div>
            {profileview.degree || profileview.institution ? (
              <div className="profile-education-item">
                <span className="profile-education-degree">{profileview.degree}</span>
                <span className="profile-education-school">{profileview.institution}</span>
                {(profileview.start_year || profileview.end_year) && (
                  <span className="profile-education-years">
                    {profileview.start_year} - {profileview.end_year}
                  </span>
                )}
              </div>
            ) : (
              <p className="profile-about-text">No education added yet.</p>
            )}
          </Card>
        </div>

        <div className="profile-side-col">
          <Card>
            <div className="profile-card-header">
              <FaLink className="profile-card-icon" />
              <h2>Social Links</h2>
            </div>
            <div className="profile-links-list">
              {profileview.git_hub ? (
                <a href={profileview.git_hub.startsWith('http') ? profileview.git_hub : `https://${profileview.git_hub}`} target="_blank" rel="noreferrer" className="profile-link-item">
                  <FaGithub size={20} /> GitHub Profile
                </a>
              ) : (
                <span className="profile-link-item" style={{opacity: 0.5}}><FaGithub size={20} /> Not provided</span>
              )}
              
              {profileview.linkedin ? (
                <a href={profileview.linkedin.startsWith('http') ? profileview.linkedin : `https://${profileview.linkedin}`} target="_blank" rel="noreferrer" className="profile-link-item">
                  <FaLinkedin size={20} /> LinkedIn Profile
                </a>
              ) : (
                <span className="profile-link-item" style={{opacity: 0.5}}><FaLinkedin size={20} /> Not provided</span>
              )}
            </div>
          </Card>

          <Card>
            <div className="profile-card-header">
              <FaFilePdf className="profile-card-icon" />
              <h2>Resume</h2>
            </div>
            {profileview.resume ? (
              <Button 
                variant="primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => window.open(`${API_BASE}${profileview.resume}`, "_blank")}
              >
                View Resume
              </Button>
            ) : (
              <p className="profile-about-text">No resume uploaded.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
