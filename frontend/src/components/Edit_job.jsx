import React, { useEffect, useState } from "react";
import "../css/Recruiter.css"; // Reuse the same CSS as Post Job for consistency
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "./ui/BackButton";
import { FaSpinner, FaBriefcase, FaAlignLeft, FaListUl, FaStar, FaTools, FaGift } from "react-icons/fa";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Edit_job = () => {
  const access_token = localStorage.getItem("accessTokens");
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    experience: "",
    jop_type: "fulltime",
    description: "",
    key_responsibilities: "",
    preferred_qualifications: "",
    skills: "",
    benefits: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/accounts/displayeditjob/${id}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load job details.");
        return res.json();
      })
      .then((data) => {
        setFormData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Error loading job details.");
        setIsLoading(false);
      });
  }, [id, access_token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    fetch(`${API_BASE}/accounts/editjob/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update job.");
        return res.json();
      })
      .then((data) => {
        setSuccess("Job updated successfully!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((error) => {
        console.error(error);
        setError("Update failed. Please check your inputs.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (isLoading) {
    return (
      <div className="postjob-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <FaSpinner className="spinner-icon" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="postjob-container">
      <div className="page-header">
        <h1>Edit Job Posting</h1>
        <p>Update the details of your job listing.</p>
      </div>

      {error && <div className="alert-message alert-error">{error}</div>}
      {success && <div className="alert-message alert-success">{success}</div>}

      <form className="job-form" onSubmit={handleSubmit}>
        <div className="form-card">
          <h2><FaBriefcase style={{color: 'var(--color-primary)'}}/> Basic Information</h2>

          <div className="grid">
            <Input
              label="Job Title *"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isSaving}
            />
            <Input
              label="Company *"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              disabled={isSaving}
            />
            <Input
              label="Location *"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={isSaving}
            />
            <Input
              label="Experience *"
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              disabled={isSaving}
            />
            <Input
              label="Salary *"
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              disabled={isSaving}
            />
            <Select
              label="Employment Type *"
              name="jop_type"
              value={formData.jop_type}
              onChange={handleChange}
              disabled={isSaving}
              options={[
                { label: 'Full Time', value: 'fulltime' },
                { label: 'Part Time', value: 'parttime' },
                { label: 'Internship', value: 'internship' },
                { label: 'Remote', value: 'remote' }
              ]}
            />
          </div>
        </div>

        <div className="form-card">
          <h2><FaAlignLeft style={{color: 'var(--color-primary)'}}/> Job Description *</h2>
          <Textarea
            rows="6"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-card">
          <h2><FaListUl style={{color: 'var(--color-primary)'}}/> Key Responsibilities *</h2>
          <Textarea
            rows="5"
            name="key_responsibilities"
            value={formData.key_responsibilities}
            onChange={handleChange}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-card">
          <h2><FaStar style={{color: 'var(--color-primary)'}}/> Preferred Qualifications *</h2>
          <Textarea
            rows="5"
            name="preferred_qualifications"
            value={formData.preferred_qualifications}
            onChange={handleChange}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-card">
          <h2><FaTools style={{color: 'var(--color-primary)'}}/> Required Skills *</h2>
          <Textarea
            rows="3"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-card">
          <h2><FaGift style={{color: 'var(--color-primary)'}}/> Benefits</h2>
          <Textarea
            rows="4"
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="button-group">
          <BackButton type="button" disabled={isSaving}>Cancel</BackButton>
          
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? <><FaSpinner className="spinner-icon" /> Updating...</> : "Update Job"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Edit_job;
