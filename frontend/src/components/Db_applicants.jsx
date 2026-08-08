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

const Db_applicants = () => {
  const access_token = localStorage.getItem("accessTokens");
  const [applicants, setApplicant] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = window.location;

  useEffect(() => {
    setIsLoading(true);
    
    // Extract query parameters if any (e.g., ?status=Applied)
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    
    let url = `${API_BASE}/accounts/dashboardapplicant/`;
    if (statusParam) {
      url += `?status=${statusParam}`;
    }

    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setApplicant(data.results || (Array.isArray(data) ? data : []));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, [access_token]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Applied': return <Badge variant="secondary">Applied</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'ShortListed': 
      case 'Shortlisted': return <Badge variant="primary">Shortlisted</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      case 'Hired': return <Badge variant="success">Hired</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="applicants-container">
      <div className="applicants-header">
        <div>
          <BackButton style={{ marginBottom: '10px' }} />
          <h1>Total Applicants</h1>
          <p>All candidates who applied for your jobs.</p>
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
          title="No Applicants Yet"
          description="You don't have any applicants across your posted jobs yet."
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
                  {getStatusBadge(item.status)}
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

export default Db_applicants;
