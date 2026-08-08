import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import "../css/CandidateCompatibility.css";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const CandidateCompatibility = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { jobId, applicantId } = useParams();
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  useEffect(() => {
    fetch(
      `${API_BASE}/accounts/compatibility/${jobId}/${applicantId}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((result) => {
        const actualData = result.results ? (Array.isArray(result.results) ? result.results[0] : result.results) : (Array.isArray(result) ? result[0] : result);
        setData(actualData);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [jobId, applicantId]);

  if (loading) {
    return (
      <div className="compat-loading">
        <div className="compat-spinner"></div>
        <p>Analyzing candidate compatibility...</p>
      </div>
    );
  }

  if (!data || data.detail) {
    return (
      <div className="compat-error">
        <h2>Unable to load compatibility data</h2>
        <BackButton />
      </div>
    );
  }

  const matchedSkills = data.matched_skills || [];
  const missingSkills = data.missing_skills || [];
  const candidateStrengths = data.candidate_strengths || [];
  const overallScore = data.overall_score || 0;
  const totalMatched = data.total_matched || 0;
  const totalRequired = data.total_required || 0;

  const scoreColor =
    overallScore >= 80
      ? "#10b981"
      : overallScore >= 60
        ? "#f59e0b"
        : overallScore >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <div className="compat-page">
      <div style={{ marginBottom: "24px" }}>
        <BackButton />
      </div>
      <div className="compat-header">
        <div className="compat-header-content">
          <h1>Candidate Compatibility Report</h1>
          <p>
            <span className="compat-highlight">{data.applicant_name || "Candidate"}</span> for{" "}
            <span className="compat-highlight">{data.job_title || "Job"}</span> at{" "}
            <span className="compat-highlight">{data.job_company || "Company"}</span>
          </p>
        </div>
      </div>

      <div className="compat-body">
        {/* Score Section */}
        <div className="compat-score-section">
          <div className="compat-score-card">
            <div
              className="compat-circle"
              style={{
                background: `conic-gradient(${scoreColor} ${overallScore * 3.6}deg, #e2e8f0 0deg)`,
              }}
            >
              <div className="compat-circle-inner">
                <span className="compat-score-number">
                  {overallScore}%
                </span>
                <span className="compat-score-label">Match Score</span>
              </div>
            </div>
            <div className="compat-score-details">
              <div className="compat-score-stat">
                <span className="compat-stat-value">
                  {totalMatched}
                </span>
                <span className="compat-stat-label">Skills Matched</span>
              </div>
              <div className="compat-score-divider"></div>
              <div className="compat-score-stat">
                <span className="compat-stat-value">
                  {totalRequired}
                </span>
                <span className="compat-stat-label">Skills Required</span>
              </div>
              <div className="compat-score-divider"></div>
              <div className="compat-score-stat">
                <span className="compat-stat-value">
                  {candidateStrengths.length}
                </span>
                <span className="compat-stat-label">Extra Skills</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="compat-progress-section">
          <div className="compat-progress-header">
            <span>Skill Match Progress</span>
            <span>
              {totalMatched} / {totalRequired}
            </span>
          </div>
          <div className="compat-progress-bar">
            <div
              className="compat-progress-fill"
              style={{
                width: `${overallScore}%`,
                backgroundColor: scoreColor,
              }}
            ></div>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="compat-skills-grid">
          <div className="compat-skill-card compat-matched">
            <div className="compat-skill-header">
              <span className="compat-skill-icon">✅</span>
              <h3>Matched Skills</h3>
              <span className="compat-skill-count">
                {matchedSkills.length}
              </span>
            </div>
            <div className="compat-skill-chips">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((skill, index) => (
                  <span
                    className="compat-chip compat-chip-matched"
                    key={index}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="compat-no-skills">No matched skills</p>
              )}
            </div>
          </div>

          <div className="compat-skill-card compat-missing">
            <div className="compat-skill-header">
              <span className="compat-skill-icon">❌</span>
              <h3>Missing Skills</h3>
              <span className="compat-skill-count">
                {missingSkills.length}
              </span>
            </div>
            <div className="compat-skill-chips">
              {missingSkills.length > 0 ? (
                missingSkills.map((skill, index) => (
                  <span
                    className="compat-chip compat-chip-missing"
                    key={index}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="compat-no-skills">
                  No missing skills — Perfect match!
                </p>
              )}
            </div>
          </div>

          <div className="compat-skill-card compat-strengths">
            <div className="compat-skill-header">
              <span className="compat-skill-icon">💪</span>
              <h3>Candidate Strengths</h3>
              <span className="compat-skill-count">
                {candidateStrengths.length}
              </span>
            </div>
            <div className="compat-skill-chips">
              {candidateStrengths.length > 0 ? (
                candidateStrengths.map((skill, index) => (
                  <span
                    className="compat-chip compat-chip-strength"
                    key={index}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="compat-no-skills">
                  No additional skills beyond requirements
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="compat-recommendation">
          <div className="compat-rec-icon">💡</div>
          <div className="compat-rec-content">
            <h3>Recruiter Recommendation</h3>
            <p>{data.recommendation || "Review candidate skills to make a decision."}</p>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="compat-candidate-info">
          <h3>Candidate Details</h3>
          <div className="compat-info-grid">
            <div className="compat-info-item">
              <span className="compat-info-label">Name</span>
              <span className="compat-info-value">
                {data.applicant_name || "N/A"}
              </span>
            </div>
            <div className="compat-info-item">
              <span className="compat-info-label">Headline</span>
              <span className="compat-info-value">
                {data.applicant_headline || "N/A"}
              </span>
            </div>
            <div className="compat-info-item">
              <span className="compat-info-label">Location</span>
              <span className="compat-info-value">
                {data.applicant_location || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCompatibility;
