import React, { useEffect, useState } from "react";
import "../css/Applicant.css";
import { useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import { FaEnvelope, FaCalendarAlt, FaFileAlt, FaUser, FaBriefcase, FaUsers } from "react-icons/fa";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Skeleton from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import { formatDate } from "../utils/formatDate";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Db_total_shortlist = () => {
  const access_token = localStorage.getItem("accessTokens");
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/accounts/dashboardshortlist/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setApplicants(data.results || (Array.isArray(data) ? data : []));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, [access_token]);

  return (
    <div className="applicants-container">
      <div className="applicants-header">
        <div>
          <BackButton style={{ marginBottom: '10px' }} />
          <h1>Shortlisted Applicants</h1>
          <p>Review candidates that have been shortlisted.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="applicants-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="candidate-card">
              <div style={{ display: 'flex', gap: '20px' }}>
                <Skeleton type="card" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton type="title" />
                  <Skeleton type="text" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <EmptyState 
          icon={<FaUsers size={48} />}
          title="No Shortlisted Applicants"
          description="You haven't shortlisted any candidates yet."
        />
      ) : (
        <div className="applicants-grid">
          {applicants.map((item) => (
            <div className="candidate-card" key={item.id}>
              <div className="candidate-top">
                <div className="candidate-info-wrapper">
                  <div className="candidate-avatar">
                    {item.username?.charAt(0).toUpperCase()}
                  </div>

                  <div className="candidate-details">
                    <h2>{item.username}</h2>
                    <div className="headline"><FaBriefcase /> {item.job} at {item.company}</div>
                    
                    <div className="candidate-meta">
                      <span className="candidate-meta-item"><FaEnvelope /> {item.email}</span>
                      <span className="candidate-meta-item">
                        <FaCalendarAlt /> Applied: {formatDate(item.applied_on)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <Badge variant="success">Shortlisted</Badge>
                </div>
              </div>

              <div className="candidate-actions">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (item.resume) {
                      let resumeUrl = item.resume;
                      if (resumeUrl.startsWith("http//")) {
                        resumeUrl = resumeUrl.replace("http//", "http://");
                      }
                      if (!resumeUrl.startsWith("http")) {
                        resumeUrl = `${API_BASE}${resumeUrl.startsWith('/') ? '' : '/'}${resumeUrl}`;
                      }
                      window.open(resumeUrl, "_blank");
                    } else {
                      alert("Resume not uploaded.");
                    }
                  }}
                >
                  <FaFileAlt /> Resume
                </Button>

                <Button 
                  variant="secondary"
                  onClick={() => navigate(`/applicantprofile/${item.applicant}`)}
                >
                  <FaUser /> View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Db_total_shortlist;
