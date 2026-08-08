import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import "../css/Myjobs.css"; // Reuse the same CSS as Myjobs
import { FaMapMarkerAlt, FaBriefcase, FaUserTie, FaMoneyBillWave, FaEye, FaEdit, FaUsers, FaArrowLeft } from "react-icons/fa";
import Button from "./ui/Button";
import Skeleton from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import { formatDate } from "../utils/formatDate";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Db_totaljobs = () => {
  const access_token = localStorage.getItem("accessTokens");
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/accounts/dashboarjobtotal/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.results || (Array.isArray(data) ? data : []));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, [access_token]);

  return (
    <div className="myjobs-container">
      <div className="myjobs-header">
        <div>
          <BackButton style={{ marginBottom: '10px' }} />
          <h1>Total Posted Jobs</h1>
          <p>All jobs you have ever posted.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="jobs-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="recruiter-job-card">
              <Skeleton type="title" />
              <Skeleton type="text" count={2} />
              <div style={{ marginTop: '20px' }}><Skeleton type="card" style={{height: '40px'}} /></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState 
          icon={<FaBriefcase size={48} />}
          title="No jobs found"
          description="You haven't posted any jobs yet."
          action={<Button onClick={() => navigate("/postjob")}>Post a Job</Button>}
        />
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div className="recruiter-job-card" key={job.id}>
              <div className="r-job-header">
                <h2 className="r-job-title">{job.title}</h2>
                <p className="r-job-company">{job.company}</p>
              </div>

              <div className="r-job-details">
                <span className="r-job-detail-item"><FaMapMarkerAlt /> {job.location}</span>
                <span className="r-job-detail-item"><FaBriefcase /> {job.jop_type}</span>
                <span className="r-job-detail-item"><FaUserTie /> {job.experience}</span>
                <span className="r-job-detail-item"><FaMoneyBillWave /> {job.salary}</span>
              </div>

              <div className="r-job-meta">
                <span>Posted {formatDate(job.posted_on)}</span>
              </div>

              <div className="r-job-actions">
                <Button variant="secondary" onClick={() => navigate(`/viewpostedjobbyid/${job.id}`)}>
                  <FaEye /> View
                </Button>

                <Button variant="secondary" onClick={() => navigate(`/editjob/${job.id}`)}>
                  <FaEdit /> Edit
                </Button>

                <Button variant="primary" onClick={() => navigate(`/applicant/${job.id}`)}>
                  <FaUsers /> Applicants
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Db_totaljobs;
