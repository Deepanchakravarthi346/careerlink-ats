import React, { useEffect, useState } from "react";
import "../css/Jobapply.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { FaCloudUploadAlt, FaFilePdf, FaSpinner, FaCheckCircle } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Jobapply = () => {
  const { id } = useParams();
  const [profiledetails, setProfiledetails] = useState({});
  const [jobdetails, setJobdetails] = useState({});
  const [resume, setResume] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  useEffect(() => {
    fetch(`${API_BASE}/accounts/jobdetails/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((res) => res.json())
      .then((data) => setJobdetails(data))
      .catch((error) => console.error(error));

    fetch(`${API_BASE}/accounts/profiledetails/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfiledetails(data))
      .catch((error) => console.error(error));
  }, [id, access_token]);

  function savejobdetails() {
    setIsLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("job", id);
    if (profiledetails.user) {
      formData.append("applicant", profiledetails.user);
    }
    
    if (resume) {
      formData.append("resume", resume);
    }

    fetch(`${API_BASE}/accounts/applyingjob/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}` },
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setIsSuccess(true);
        } else {
          setError(data.message || data.error || "Failed to apply. Please check your details.");
        }
      })
      .catch((error) => setError("Network error occurred."))
      .finally(() => setIsLoading(false));
  }

  if (isSuccess) {
    return (
      <div className="apply-page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <FaCheckCircle style={{ fontSize: '64px', color: 'var(--color-success)', marginBottom: '24px' }} />
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Application Submitted!</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
          Your application for <strong>{jobdetails.title}</strong> at <strong>{jobdetails.company}</strong> has been sent to the employer.
        </p>
        <Button variant="primary" onClick={() => navigate("/appliedjobs")}>View Applied Jobs</Button>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-header">
        <h1>Submit Application</h1>
        <p>Review your information before applying.</p>
      </div>
      
      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div className="apply-card">
        <section className="apply-section">
          <h2>Job Summary</h2>
          <div className="job-summary">
            <h3>{jobdetails.title || "Loading..."}</h3>
            <p>{jobdetails.company}</p>
            <p>{jobdetails.location} • {jobdetails.salary}</p>
          </div>
        </section>

        <section className="apply-section">
          <h2>Your Contact Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Input label="Full Name" value={profiledetails.username || ""} readOnly />
            <Input label="Email" value={profiledetails.email || ""} readOnly />
            <Input label="Phone" value={profiledetails.phone || ""} readOnly />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            To update your contact information, please visit your <Link to="/myprofile" style={{ color: 'var(--color-primary)' }}>Profile</Link>.
          </p>
        </section>

        <section className="apply-section">
          <h2>Resume</h2>
          <div className="resume-upload-box">
            <FaCloudUploadAlt style={{ fontSize: '48px', color: 'var(--color-border)', marginBottom: '16px' }} />
            <div style={{ marginBottom: '16px' }}>
              <strong>Upload a new resume</strong> or we will use your default profile resume.
            </div>
            
            <label>
              <Button variant="secondary" type="button" onClick={() => document.getElementById('resume-upload').click()}>
                Choose File
              </Button>
              <input
                id="resume-upload"
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </label>

            {resume && (
              <div className="resume-filename">
                <FaFilePdf style={{ verticalAlign: 'middle', marginRight: '4px' }}/> 
                {resume.name}
              </div>
            )}
            {!resume && profiledetails.resume && (
              <div className="resume-filename" style={{ color: 'var(--color-text-secondary)' }}>
                <FaFilePdf style={{ verticalAlign: 'middle', marginRight: '4px' }}/>
                Using default: {profiledetails.resume.split('/').pop()}
              </div>
            )}
          </div>
        </section>

        <div className="apply-actions">
          <Button variant="secondary" onClick={() => navigate(`/job/${id}`)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={savejobdetails} disabled={isLoading}>
            {isLoading ? <><FaSpinner className="spinner-icon" /> Submitting...</> : "Submit Application"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Jobapply;
