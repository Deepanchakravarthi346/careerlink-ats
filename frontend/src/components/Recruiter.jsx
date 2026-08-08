import React, { useState } from "react";
import "../css/Recruiter.css";
import { FaSpinner, FaBriefcase, FaAlignLeft, FaListUl, FaStar, FaTools, FaGift } from "react-icons/fa";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";
import BackButton from "./ui/BackButton";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Recruiter = () => {
  const [jobtitle, setJobtitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [jobtype, setJobType] = useState("fulltime");
  const [jobdescription, setJobdescription] = useState("");
  const [keyresponsibilities, setKeyresponsibilities] = useState("");
  const [preferredqualifications, setPreferredqualifications] = useState("");
  const [requiredskills, setRequiredskills] = useState("");
  const [benifits, setBenifits] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const access_token = localStorage.getItem("accessTokens");

  const postjobs = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const jobs_details = {
      title: jobtitle.trim(),
      description: jobdescription.trim(),
      key_responsibilities: keyresponsibilities.trim(),
      preferred_qualifications: preferredqualifications.trim(),
      benefits: benifits.trim(),
      experience: experience.trim(),
      company: company.trim(),
      location: location.trim(),
      skills: requiredskills.trim(),
      salary: salary.trim(),
      jop_type: jobtype,
    };

    try {
      const response = await fetch(`${API_BASE}/accounts/postjobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(jobs_details),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Job posted successfully!");
        setJobtitle("");
        setCompany("");
        setLocation("");
        setExperience("");
        setSalary("");
        setJobdescription("");
        setKeyresponsibilities("");
        setPreferredqualifications("");
        setRequiredskills("");
        setBenifits("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        let errorMessage = "Failed to post job. Please check your inputs.";
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          } else if (data.message) {
            errorMessage = data.message;
          }
        }
        setError(errorMessage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setJobtitle("");
    setCompany("");
    setLocation("");
    setExperience("");
    setSalary("");
    setJobdescription("");
    setKeyresponsibilities("");
    setPreferredqualifications("");
    setRequiredskills("");
    setBenifits("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="postjob-container">
      <div className="page-header">
        <BackButton style={{ marginBottom: '16px' }} />
        <h1>Post a New Job</h1>
        <p>Create a professional job listing to attract candidates.</p>
      </div>

      {error && <div className="alert-message alert-error">{error}</div>}
      {success && <div className="alert-message alert-success">{success}</div>}

      <form className="job-form" onSubmit={postjobs}>
        <div className="form-card">
          <h2><FaBriefcase style={{color: 'var(--color-primary)'}}/> Basic Information</h2>

          <div className="grid">
            <Input
              label="Job Title *"
              type="text"
              value={jobtitle}
              onChange={(e) => setJobtitle(e.target.value)}
              required
              disabled={isLoading}
              placeholder="e.g. Senior Software Engineer"
            />
            <Input
              label="Company *"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              disabled={isLoading}
              placeholder="e.g. Acme Corp"
            />
            <Input
              label="Location *"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              disabled={isLoading}
              placeholder="e.g. New York, NY (or Remote)"
            />
            <Input
              label="Experience *"
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              disabled={isLoading}
              placeholder="e.g. 3-5 Years"
            />
            <Input
              label="Salary *"
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
              disabled={isLoading}
              placeholder="e.g. $100k - $120k"
            />
            <Select
              label="Employment Type *"
              value={jobtype}
              onChange={(e) => setJobType(e.target.value)}
              disabled={isLoading}
              options={[
                { label: 'Full Time', value: 'fulltime' },
                { label: 'Part Time', value: 'parttime' }
              ]}
            />
          </div>
        </div>

        <div className="form-card">
          <h2><FaAlignLeft style={{color: 'var(--color-primary)'}}/> Job Description *</h2>
          <Textarea
            rows="6"
            value={jobdescription}
            onChange={(e) => setJobdescription(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Provide a detailed description of the role..."
          />
        </div>

        <div className="form-card">
          <h2><FaListUl style={{color: 'var(--color-primary)'}}/> Key Responsibilities *</h2>
          <Textarea
            rows="5"
            value={keyresponsibilities}
            onChange={(e) => setKeyresponsibilities(e.target.value)}
            required
            disabled={isLoading}
            placeholder="List the key responsibilities (each on a new line)..."
          />
        </div>

        <div className="form-card">
          <h2><FaStar style={{color: 'var(--color-primary)'}}/> Preferred Qualifications *</h2>
          <Textarea
            rows="5"
            value={preferredqualifications}
            onChange={(e) => setPreferredqualifications(e.target.value)}
            required
            disabled={isLoading}
            placeholder="List preferred qualifications (each on a new line)..."
          />
        </div>

        <div className="form-card">
          <h2><FaTools style={{color: 'var(--color-primary)'}}/> Required Skills *</h2>
          <Textarea
            rows="3"
            value={requiredskills}
            onChange={(e) => setRequiredskills(e.target.value)}
            required
            disabled={isLoading}
            placeholder="e.g. Python, Django, React, SQL (comma separated)"
          />
        </div>

        <div className="form-card">
          <h2><FaGift style={{color: 'var(--color-primary)'}}/> Benefits</h2>
          <Textarea
            rows="4"
            value={benifits}
            onChange={(e) => setBenifits(e.target.value)}
            disabled={isLoading}
            placeholder="Health insurance, 401k, remote work options..."
          />
        </div>

        <div className="button-group">
          <Button variant="secondary" type="button" onClick={handleCancel} disabled={isLoading}>
            Clear Form
          </Button>
          
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? <><FaSpinner className="spinner-icon" /> Publishing...</> : "Publish Job"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Recruiter;
