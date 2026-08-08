import React, { useEffect, useState } from "react";
import "../css/Myjobs.css";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import Button from "./ui/Button";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Myjobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchjobs, setSearchjobs] = useState("");
  const access_token = localStorage.getItem("accessTokens");
  const [load, setLoad] = useState(true);
  const navigate = useNavigate();

  function getAllJobs() {
    fetch(`${API_BASE}/accounts/myjobs/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const jobsData = Array.isArray(data) ? data : data.results || [];
        setJobs(jobsData);
        setLoad(false);
      })
      .catch((error) => {
        console.error(error);
        setLoad(false);
      });
  }

  useEffect(() => {
    getAllJobs();
  }, []);

  function search_jobs(job) {
    setSearchjobs(job);
    if (job.trim() === "") {
      getAllJobs();
      return;
    }
    fetch(`${API_BASE}/accounts/searchpostedjobs/${job}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const jobsData = Array.isArray(data) ? data : data.results || [];
        setJobs(jobsData);
        setLoad(false);
      })
      .catch((error) => {
        console.error(error);
        setLoad(false);
      });
  }

  return (
    <div className="myjobs-container">
      <div className="myjobs-header">
        <div>
          <h1>My Jobs</h1>
          <p>Manage all your job postings</p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            navigate("/postjob");
          }}
        >
          + Post New Job
        </Button>
      </div>

      <div className="myjobs-filters">
        <input
          type="text"
          className="myjobs-search-input"
          placeholder="Search job title..."
          value={searchjobs}
          onChange={(e) => search_jobs(e.target.value)}
        />
      </div>

      {load ? (
        <h1>Loading...</h1>
      ) : jobs.length === 0 ? (
        <h1>No Jobs Found</h1>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div className="recruiter-job-card" key={job.id}>
              <div className="r-job-header">
                <h2 className="r-job-title">{job.title}</h2>
                <p className="r-job-company">{job.company}</p>
              </div>

              <div className="r-job-details">
                <span className="r-job-detail-item">📍 {job.location}</span>
                <span className="r-job-detail-item">💼 {job.jop_type}</span>
                <span className="r-job-detail-item">👨‍💻 {job.experience}</span>
                <span className="r-job-detail-item">💰 {job.salary}</span>
              </div>

              <div className="r-job-meta">
                <span>📅 Posted: {job.posted_on ? formatDate(job.posted_on) : 'N/A'}</span>
              </div>

              <div className="r-job-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigate(`/viewpostedjobbyid/${job.id}`);
                  }}
                >
                  View
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/editjob/${job.id}`);
                  }}
                >
                  Edit
                </Button>

                <Button variant="danger">Delete</Button>

                <Button
                  variant="primary"
                  onClick={() => {
                    navigate(`/applicant/${job.id}`);
                  }}
                >
                  Applicants
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Myjobs;
