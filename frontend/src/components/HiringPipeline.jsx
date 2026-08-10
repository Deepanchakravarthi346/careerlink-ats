import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import "../css/HiringPipeline.css";
import { formatDate } from "../utils/formatDate";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const PIPELINE_STAGES = [
  "Applied",
  "Viewed",
  "ShortListed",
  "Interview Scheduled",
  "Technical Round",
  "HR Round",
  "Offer Sent",
  "Hired",
];

const HiringPipeline = () => {
  const [applicants, setApplicants] = useState([]);
  const [activeStage, setActiveStage] = useState("All");
  const { jobId } = useParams();
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  function fetchApplicants() {
    fetch(`${API_BASE}/accounts/applicants/${jobId}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setApplicants(data.results || (Array.isArray(data) ? data : [])))
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  function updateStage(applicantId, newStatus) {
    fetch(
      `${API_BASE}/accounts/pipeline/${jobId}/${applicantId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      },
    )
      .then((res) => res.json())
      .then(() => {
        fetchApplicants();
      })
      .catch((error) => console.error(error));
  }

  const stageCounts = {};
  PIPELINE_STAGES.forEach((stage) => {
    stageCounts[stage] = applicants.filter((a) => a.status === stage).length;
  });
  stageCounts["Rejected"] = applicants.filter(
    (a) => a.status === "Rejected",
  ).length;
  stageCounts["All"] = applicants.length;

  const filteredApplicants =
    activeStage === "All"
      ? applicants
      : applicants.filter((a) => a.status === activeStage);

  const getStageIndex = (status) => {
    return PIPELINE_STAGES.indexOf(status);
  };

  return (
    <div className="pipeline-page">
      <div style={{ marginBottom: "16px" }}>
        <BackButton />
      </div>
      <div className="pipeline-header">
        <div className="pipeline-header-content">
          <h1>Hiring Pipeline</h1>
          <p>
            Track candidates through every stage of the recruitment process
          </p>
        </div>
      </div>

      {/* Pipeline Stepper */}
      <div className="pipeline-stepper">
        <div
          className={`pipeline-stage-pill ${activeStage === "All" ? "pipeline-active" : ""}`}
          onClick={() => setActiveStage("All")}
        >
          <span className="pipeline-stage-name">All</span>
          <span className="pipeline-stage-count">{stageCounts["All"]}</span>
        </div>
        {PIPELINE_STAGES.map((stage, index) => (
          <div
            key={stage}
            className={`pipeline-stage-pill ${activeStage === stage ? "pipeline-active" : ""} ${stageCounts[stage] > 0 ? "pipeline-has-candidates" : ""}`}
            onClick={() => setActiveStage(stage)}
          >
            <span className="pipeline-stage-number">{index + 1}</span>
            <span className="pipeline-stage-name">{stage}</span>
            <span className="pipeline-stage-count">{stageCounts[stage]}</span>
          </div>
        ))}
        <div
          className={`pipeline-stage-pill pipeline-rejected-pill ${activeStage === "Rejected" ? "pipeline-active" : ""}`}
          onClick={() => setActiveStage("Rejected")}
        >
          <span className="pipeline-stage-name">Rejected</span>
          <span className="pipeline-stage-count">
            {stageCounts["Rejected"]}
          </span>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="pipeline-candidates">
        {filteredApplicants.length === 0 ? (
          <div className="pipeline-empty">
            <h2>No candidates in this stage</h2>
            <p>
              Candidates will appear here as they progress through the pipeline.
            </p>
          </div>
        ) : (
          filteredApplicants.map((user) => (
            <div className="pipeline-card" key={user.id}>
              <div className="pipeline-card-top">
                <div className="pipeline-card-info">
                  <div className="pipeline-avatar">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3>{user.username}</h3>
                    <p>{user.email}</p>
                    <small>
                      Applied:{" "}
                      {user.applied_on
                        ? formatDate(user.applied_on)
                        : " N/A"}
                    </small>
                  </div>
                </div>
                <div className="pipeline-card-actions">
                  <select
                    className="pipeline-stage-select"
                    value={user.status}
                    onChange={(e) =>
                      updateStage(user.applicant, e.target.value)
                    }
                  >
                    {PIPELINE_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>

              {/* Mini Pipeline Progress */}
              <div className="pipeline-mini">
                {PIPELINE_STAGES.map((stage, index) => (
                  <div
                    key={stage}
                    className={`pipeline-mini-step ${
                      user.status === "Rejected"
                        ? "pipeline-mini-rejected"
                        : getStageIndex(user.status) >= index
                          ? "pipeline-mini-done"
                          : ""
                    } ${user.status === stage ? "pipeline-mini-current" : ""}`}
                    title={stage}
                  >
                    <div className="pipeline-mini-dot"></div>
                    {index < PIPELINE_STAGES.length - 1 && (
                      <div className="pipeline-mini-line"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pipeline-card-bottom">
                <button
                  className="pipeline-btn"
                  onClick={() =>
                    navigate(`/applicantprofile/${user.applicant}`, {
                      state: { job_id: jobId },
                    })
                  }
                >
                  👤 Profile
                </button>
                <button
                  className="pipeline-btn"
                  onClick={() =>
                    navigate(`/compatibility/${jobId}/${user.applicant}`)
                  }
                >
                  📊 Compatibility
                </button>
                <button
                  className="pipeline-btn"
                  onClick={() => {
                    if (user.resume) {
                      window.open(
                        user.resume.startsWith("http") ? user.resume : `${API_BASE}${user.resume}`,
                        "_blank",
                      );
                    } else {
                      alert("Resume not uploaded.");
                    }
                  }}
                >
                  📄 Resume
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HiringPipeline;
