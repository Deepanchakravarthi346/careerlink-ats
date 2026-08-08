import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import "../css/Jobs_details.css";
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaClock, FaCalendarAlt, FaBuilding, FaArrowLeft, FaUsers, FaEdit } from "react-icons/fa";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Card from "./ui/Card";
import Skeleton from "./ui/Skeleton";
import { formatDate } from "../utils/formatDate";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Jobs_details = () => {
  const [job, setJob] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessTokens");

  useEffect(() => {
    fetch(`${API_BASE}/accounts/job/${id}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setIsApplied(data.applied_job);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="job-details-page">
        <Skeleton type="card" className="job-header-card" style={{ height: "200px" }} />
        <div className="job-content-wrapper">
          <Skeleton type="card" style={{ height: "400px" }} />
          <Skeleton type="card" style={{ height: "300px" }} />
        </div>
      </div>
    );
  }

  if (!job) return <div className="job-details-page">Job not found.</div>;

  return (
    <div className="job-details-page">
      <div style={{ marginBottom: '16px' }}>
        <BackButton />
      </div>

      <div className="job-header-card">
        <h1 className="job-header-title">{job.title}</h1>
        <div className="job-header-company">
          <FaBuilding /> {job.company}
        </div>
        <div className="job-meta-tags">
          <Badge variant={job.jop_type === 'fulltime' ? 'primary' : 'warning'}>
            {job.jop_type === 'fulltime' ? 'Full Time' : 'Part Time'}
          </Badge>
          <Badge variant="secondary">
            <FaClock style={{ marginRight: '4px' }}/> {job.experience}
          </Badge>
          <Badge variant="secondary">
            <FaMapMarkerAlt style={{ marginRight: '4px' }}/> {job.location}
          </Badge>
        </div>
      </div>

      <div className="job-content-wrapper">
        <div className="job-main-content">
          <section className="job-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </section>

          {job.key_responsibilities && (
            <section className="job-section">
              <h2>Key Responsibilities</h2>
              <ul>
                {job.key_responsibilities.split(/\r?\n/).filter(i => i.trim()).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {job.preferred_qualifications && (
            <section className="job-section">
              <h2>Preferred Qualifications</h2>
              <ul>
                {job.preferred_qualifications.split(/\r?\n/).filter(i => i.trim()).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {job.skills && (
            <section className="job-section">
              <h2>Required Skills</h2>
              <div className="skills-tags">
                {job.skills.split(",").filter(s => s.trim()).map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}

          {job.benefits && (
            <section className="job-section">
              <h2>Benefits</h2>
              <ul>
                {job.benefits.split(/\r?\n/).filter(i => i.trim()).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="job-sidebar">
          <Card className="sidebar-card">
            <div className="sidebar-meta-list">
              <div className="sidebar-meta-item">
                <FaMoneyBillWave className="sidebar-meta-icon" />
                <div className="sidebar-meta-text">
                  <h4>Salary Base</h4>
                  <p>{job.salary}</p>
                </div>
              </div>
              <div className="sidebar-meta-item">
                <FaMapMarkerAlt className="sidebar-meta-icon" />
                <div className="sidebar-meta-text">
                  <h4>Location</h4>
                  <p>{job.location}</p>
                </div>
              </div>
              <div className="sidebar-meta-item">
                <FaCalendarAlt className="sidebar-meta-icon" />
                <div className="sidebar-meta-text">
                  <h4>Posted On</h4>
                  <p>{formatDate(job.posted_on)}</p>
                </div>
              </div>
            </div>

            <Button
              variant={isApplied ? "success" : "primary"}
              disabled={isApplied}
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              onClick={() => !isApplied && navigate(`/jobapply/${id}`)}
            >
              {isApplied ? "✓ Applied Successfully" : "Apply for this Job"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Jobs_details;
