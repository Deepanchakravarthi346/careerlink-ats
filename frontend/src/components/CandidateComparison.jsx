import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import "../css/CandidateComparison.css";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const CandidateComparison = () => {
  const [applicants, setApplicants] = useState([]);
  const [candidate1, setCandidate1] = useState("");
  const [candidate2, setCandidate2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const { jobId } = useParams();
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  useEffect(() => {
    fetch(`${API_BASE}/accounts/applicants/${jobId}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setApplicants(data.results || (Array.isArray(data) ? data : [])))
      .catch((error) => console.error(error));
  }, [jobId]);

  function compareNow() {
    if (!candidate1 || !candidate2) {
      alert("Please select both candidates to compare.");
      return;
    }
    if (candidate1 === candidate2) {
      alert("Please select two different candidates.");
      return;
    }
    setLoading(true);
    fetch(
      `${API_BASE}/accounts/compare/${jobId}/${candidate1}/${candidate2}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setComparison(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const getWinner = (val1, val2) => {
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0;
  };

  return (
    <div className="compare-page">
      <div style={{ marginBottom: "16px" }}>
        <BackButton />
      </div>
      <div className="compare-header">
        <div className="compare-header-content">
          <h1>Candidate Comparison</h1>
          <p>
            {comparison
              ? `${comparison.job_title} at ${comparison.job_company}`
              : "Select two candidates to compare side-by-side"}
          </p>
        </div>
      </div>

      {/* Selection Section */}
      <div className="compare-selection">
        <div className="compare-select-group">
          <label>Candidate 1</label>
          <select
            value={candidate1}
            onChange={(e) => setCandidate1(e.target.value)}
          >
            <option value="">-- Select Candidate --</option>
            {applicants.map((a) => (
              <option key={a.applicant} value={a.applicant}>
                {a.username} ({a.email})
              </option>
            ))}
          </select>
        </div>

        <div className="compare-vs">VS</div>

        <div className="compare-select-group">
          <label>Candidate 2</label>
          <select
            value={candidate2}
            onChange={(e) => setCandidate2(e.target.value)}
          >
            <option value="">-- Select Candidate --</option>
            {applicants.map((a) => (
              <option key={a.applicant} value={a.applicant}>
                {a.username} ({a.email})
              </option>
            ))}
          </select>
        </div>

        <button
          className="compare-action-btn"
          onClick={compareNow}
          disabled={loading}
        >
          {loading ? "Comparing..." : "🔍 Compare Now"}
        </button>
      </div>

      {applicants.length < 2 && (
        <div className="compare-empty">
          <h2>Not Enough Applicants</h2>
          <p>At least 2 applicants are needed to compare candidates.</p>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="compare-results">
          {/* Score Overview */}
          <div className="compare-scores">
            <div
              className={`compare-score-card ${
                getWinner(
                  comparison.candidate1.compatibility.score,
                  comparison.candidate2.compatibility.score,
                ) === 1
                  ? "compare-winner"
                  : ""
              }`}
            >
              <div
                className="compare-score-circle"
                style={{
                  background: `conic-gradient(${getScoreColor(comparison.candidate1.compatibility.score)} ${comparison.candidate1.compatibility.score * 3.6}deg, #e2e8f0 0deg)`,
                }}
              >
                <div className="compare-score-inner">
                  <span>{comparison.candidate1.compatibility.score}%</span>
                </div>
              </div>
              <h3>{comparison.candidate1.username}</h3>
              <p className="compare-score-headline">
                {comparison.candidate1.headline}
              </p>
              {getWinner(
                comparison.candidate1.compatibility.score,
                comparison.candidate2.compatibility.score,
              ) === 1 && (
                <span className="compare-badge">⭐ Better Match</span>
              )}
            </div>

            <div className="compare-vs-large">VS</div>

            <div
              className={`compare-score-card ${
                getWinner(
                  comparison.candidate1.compatibility.score,
                  comparison.candidate2.compatibility.score,
                ) === 2
                  ? "compare-winner"
                  : ""
              }`}
            >
              <div
                className="compare-score-circle"
                style={{
                  background: `conic-gradient(${getScoreColor(comparison.candidate2.compatibility.score)} ${comparison.candidate2.compatibility.score * 3.6}deg, #e2e8f0 0deg)`,
                }}
              >
                <div className="compare-score-inner">
                  <span>{comparison.candidate2.compatibility.score}%</span>
                </div>
              </div>
              <h3>{comparison.candidate2.username}</h3>
              <p className="compare-score-headline">
                {comparison.candidate2.headline}
              </p>
              {getWinner(
                comparison.candidate1.compatibility.score,
                comparison.candidate2.compatibility.score,
              ) === 2 && (
                <span className="compare-badge">⭐ Better Match</span>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-th-category">Category</th>
                  <th>{comparison.candidate1.username}</th>
                  <th>{comparison.candidate2.username}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="compare-category">📍 Location</td>
                  <td>{comparison.candidate1.location}</td>
                  <td>{comparison.candidate2.location}</td>
                </tr>

                <tr>
                  <td className="compare-category">🎓 Education</td>
                  <td>
                    <strong>{comparison.candidate1.degree}</strong>
                    <br />
                    {comparison.candidate1.field_of_study}
                    <br />
                    {comparison.candidate1.institution}
                    <br />
                    <small>
                      {comparison.candidate1.start_year} –{" "}
                      {comparison.candidate1.end_year}
                    </small>
                  </td>
                  <td>
                    <strong>{comparison.candidate2.degree}</strong>
                    <br />
                    {comparison.candidate2.field_of_study}
                    <br />
                    {comparison.candidate2.institution}
                    <br />
                    <small>
                      {comparison.candidate2.start_year} –{" "}
                      {comparison.candidate2.end_year}
                    </small>
                  </td>
                </tr>

                <tr>
                  <td className="compare-category">🛠️ Skills</td>
                  <td>
                    <div className="compare-chips">
                      {comparison.candidate1.skills.map((skill, i) => (
                        <span
                          key={i}
                          className={`compare-chip ${
                            comparison.candidate1.compatibility.matched_skills.includes(
                              skill.toLowerCase(),
                            )
                              ? "compare-chip-match"
                              : "compare-chip-extra"
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="compare-chips">
                      {comparison.candidate2.skills.map((skill, i) => (
                        <span
                          key={i}
                          className={`compare-chip ${
                            comparison.candidate2.compatibility.matched_skills.includes(
                              skill.toLowerCase(),
                            )
                              ? "compare-chip-match"
                              : "compare-chip-extra"
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="compare-category">✅ Matched Skills</td>
                  <td
                    className={
                      getWinner(
                        comparison.candidate1.compatibility.matched_skills
                          .length,
                        comparison.candidate2.compatibility.matched_skills
                          .length,
                      ) === 1
                        ? "compare-highlight"
                        : ""
                    }
                  >
                    <strong>
                      {
                        comparison.candidate1.compatibility.matched_skills
                          .length
                      }
                    </strong>{" "}
                    of{" "}
                    {comparison.candidate1.compatibility.matched_skills.length +
                      comparison.candidate1.compatibility.missing_skills.length}
                  </td>
                  <td
                    className={
                      getWinner(
                        comparison.candidate1.compatibility.matched_skills
                          .length,
                        comparison.candidate2.compatibility.matched_skills
                          .length,
                      ) === 2
                        ? "compare-highlight"
                        : ""
                    }
                  >
                    <strong>
                      {
                        comparison.candidate2.compatibility.matched_skills
                          .length
                      }
                    </strong>{" "}
                    of{" "}
                    {comparison.candidate2.compatibility.matched_skills.length +
                      comparison.candidate2.compatibility.missing_skills.length}
                  </td>
                </tr>

                <tr>
                  <td className="compare-category">❌ Missing Skills</td>
                  <td>
                    <div className="compare-chips">
                      {comparison.candidate1.compatibility.missing_skills
                        .length > 0 ? (
                        comparison.candidate1.compatibility.missing_skills.map(
                          (s, i) => (
                            <span
                              key={i}
                              className="compare-chip compare-chip-missing"
                            >
                              {s}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="compare-perfect">✅ None</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="compare-chips">
                      {comparison.candidate2.compatibility.missing_skills
                        .length > 0 ? (
                        comparison.candidate2.compatibility.missing_skills.map(
                          (s, i) => (
                            <span
                              key={i}
                              className="compare-chip compare-chip-missing"
                            >
                              {s}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="compare-perfect">✅ None</span>
                      )}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="compare-category">📄 Resume</td>
                  <td>
                    {comparison.candidate1.resume && (
                      <a
                        href={`${API_BASE}${comparison.candidate1.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="compare-resume-link"
                      >
                        📄 Download Resume
                      </a>
                    )}
                  </td>
                  <td>
                    {comparison.candidate2.resume && (
                      <a
                        href={`${API_BASE}${comparison.candidate2.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="compare-resume-link"
                      >
                        📄 Download Resume
                      </a>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="compare-category">🔗 Links</td>
                  <td>
                    <div className="compare-links">
                      {comparison.candidate1.git_hub && (
                        <a
                          href={comparison.candidate1.git_hub}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      )}
                      {comparison.candidate1.linkedin && (
                        <a
                          href={comparison.candidate1.linkedin}
                          target="_blank"
                          rel="noreferrer"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="compare-links">
                      {comparison.candidate2.git_hub && (
                        <a
                          href={comparison.candidate2.git_hub}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      )}
                      {comparison.candidate2.linkedin && (
                        <a
                          href={comparison.candidate2.linkedin}
                          target="_blank"
                          rel="noreferrer"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Comparison Cards */}
          <div className="compare-mobile-cards">
            {/* Candidate 1 */}
            <div className="compare-mobile-card">
              <div className="compare-mobile-card-header">
                <h3>{comparison.candidate1.username}</h3>
              </div>
              <div className="compare-mobile-section">
                <h4>📍 Location</h4>
                <p>{comparison.candidate1.location}</p>
              </div>
              <div className="compare-mobile-section">
                <h4>🎓 Education</h4>
                <p>
                  <strong>{comparison.candidate1.degree}</strong><br />
                  {comparison.candidate1.field_of_study}<br />
                  {comparison.candidate1.institution}<br />
                  <small>{comparison.candidate1.start_year} – {comparison.candidate1.end_year}</small>
                </p>
              </div>
              <div className="compare-mobile-section">
                <h4>🛠️ Skills</h4>
                <div className="compare-chips">
                  {comparison.candidate1.skills.map((skill, i) => (
                    <span
                      key={i}
                      className={`compare-chip ${
                        comparison.candidate1.compatibility.matched_skills.includes(skill.toLowerCase())
                          ? "compare-chip-match"
                          : "compare-chip-extra"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="compare-mobile-section">
                <h4>❌ Missing Skills</h4>
                <div className="compare-chips">
                  {comparison.candidate1.compatibility.missing_skills.length > 0 ? (
                    comparison.candidate1.compatibility.missing_skills.map((s, i) => (
                      <span key={i} className="compare-chip compare-chip-missing">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="compare-perfect">✅ None</span>
                  )}
                </div>
              </div>
              <div className="compare-mobile-section">
                <h4>🔗 Links & Resume</h4>
                <div className="compare-links">
                  {comparison.candidate1.resume && (
                    <a href={`${API_BASE}${comparison.candidate1.resume}`} target="_blank" rel="noreferrer" className="compare-resume-link">
                      📄 Resume
                    </a>
                  )}
                  {comparison.candidate1.git_hub && (
                    <a href={comparison.candidate1.git_hub} target="_blank" rel="noreferrer">GitHub</a>
                  )}
                  {comparison.candidate1.linkedin && (
                    <a href={comparison.candidate1.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                  )}
                </div>
              </div>
            </div>

            {/* Candidate 2 */}
            <div className="compare-mobile-card">
              <div className="compare-mobile-card-header">
                <h3>{comparison.candidate2.username}</h3>
              </div>
              <div className="compare-mobile-section">
                <h4>📍 Location</h4>
                <p>{comparison.candidate2.location}</p>
              </div>
              <div className="compare-mobile-section">
                <h4>🎓 Education</h4>
                <p>
                  <strong>{comparison.candidate2.degree}</strong><br />
                  {comparison.candidate2.field_of_study}<br />
                  {comparison.candidate2.institution}<br />
                  <small>{comparison.candidate2.start_year} – {comparison.candidate2.end_year}</small>
                </p>
              </div>
              <div className="compare-mobile-section">
                <h4>🛠️ Skills</h4>
                <div className="compare-chips">
                  {comparison.candidate2.skills.map((skill, i) => (
                    <span
                      key={i}
                      className={`compare-chip ${
                        comparison.candidate2.compatibility.matched_skills.includes(skill.toLowerCase())
                          ? "compare-chip-match"
                          : "compare-chip-extra"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="compare-mobile-section">
                <h4>❌ Missing Skills</h4>
                <div className="compare-chips">
                  {comparison.candidate2.compatibility.missing_skills.length > 0 ? (
                    comparison.candidate2.compatibility.missing_skills.map((s, i) => (
                      <span key={i} className="compare-chip compare-chip-missing">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="compare-perfect">✅ None</span>
                  )}
                </div>
              </div>
              <div className="compare-mobile-section">
                <h4>🔗 Links & Resume</h4>
                <div className="compare-links">
                  {comparison.candidate2.resume && (
                    <a href={`${API_BASE}${comparison.candidate2.resume}`} target="_blank" rel="noreferrer" className="compare-resume-link">
                      📄 Resume
                    </a>
                  )}
                  {comparison.candidate2.git_hub && (
                    <a href={comparison.candidate2.git_hub} target="_blank" rel="noreferrer">GitHub</a>
                  )}
                  {comparison.candidate2.linkedin && (
                    <a href={comparison.candidate2.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateComparison;
