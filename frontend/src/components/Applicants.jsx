import React, { useEffect, useState } from "react";
import "../css/Applicant.css";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner, FaSearch, FaEnvelope, FaCalendarAlt, FaCheck, FaTimes, FaFileAlt, FaUser, FaChartLine, FaBalanceScale } from "react-icons/fa";
import Pagination from "./Pagination";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Skeleton from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import ErrorState from "./ui/ErrorState";
import BackButton from "./ui/BackButton";
import { formatDate } from "../utils/formatDate";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Applicants = () => {
  const [applicant, setApplicant] = useState([]);
  const [searchApplicants, setSearchApplicants] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOption, setSortOption] = useState("-applied_on");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  const fetchApplicants = async (page = 1, search = searchApplicants, status = statusFilter, sort = sortOption) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page,
        search: search,
        status: status,
        sort: sort
      });
      const res = await fetch(`${API_BASE}/accounts/applicants/${id}/?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!res.ok) throw new Error("Failed to load applicants.");

      const data = await res.json();
      setApplicant(data.results || []);
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.current_page || 1);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch applicants. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants(currentPage, searchApplicants, statusFilter, sortOption);
  }, [id, access_token, currentPage, statusFilter, sortOption]);

  const handleSearch = (val) => {
    setSearchApplicants(val);
    setCurrentPage(1);
    fetchApplicants(1, val, statusFilter, sortOption);
  };

  const updateStatus = async (ap_id, action) => {
    try {
      setActionLoading(ap_id);
      const res = await fetch(`${API_BASE}/accounts/${action}status/${id}/${ap_id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setApplicant(applicant.map(app => app.applicant === ap_id ? { ...app, status: data.status } : app));
      } else {
        alert(data.error || `Failed to ${action} applicant.`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

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
          <BackButton style={{ marginBottom: '16px' }} />
          <h1>Applicants</h1>
          <p>Manage candidates who applied for this job</p>
        </div>

        <div className="applicants-actions">
          <Button variant="secondary" onClick={() => navigate(`/compare/${id}`)}>
            <FaBalanceScale /> Compare
          </Button>

          <Button variant="primary" onClick={() => navigate(`/pipeline/${id}`)}>
            <FaChartLine /> Pipeline View
          </Button>

          <div className="count-card">
            <h2>{applicant?.length || 0}</h2>
            <span>On Page</span>
          </div>
        </div>
      </div>

      <div className="applicants-filters">
        <input
          type="text"
          placeholder="Search applicant name or email..."
          value={searchApplicants}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          style={{ padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          <option value="">All Statuses</option>
          <option value="Applied">Applied (Pending)</option>
          <option value="ShortListed">Shortlisted</option>
          <option value="Rejected">Rejected</option>
          <option value="Hired">Hired</option>
        </select>
        <select 
          value={sortOption} 
          onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
          style={{ padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          <option value="-applied_on">Newest First</option>
          <option value="applied_on">Oldest First</option>
        </select>
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
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchApplicants(currentPage, searchApplicants, statusFilter, sortOption)} />
      ) : applicant.length === 0 ? (
        <EmptyState 
          icon={<FaSearch size={48} />}
          title="No Applicants Yet"
          description="Nobody has applied for this job yet or matches your filters."
        />
      ) : (
        <div className="applicants-grid">
          {applicant.map((user) => (
            <div className="candidate-card" key={user.id}>
              <div className="candidate-top">
                <div className="candidate-info-wrapper">
                  <div className="candidate-avatar">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="candidate-details">
                    <h2>{user.username}</h2>
                    {user.headline && <div className="headline">{user.headline}</div>}
                    
                    <div className="candidate-meta">
                      <span className="candidate-meta-item"><FaEnvelope /> {user.email}</span>
                      <span className="candidate-meta-item">
                        <FaCalendarAlt /> Applied: {formatDate(user.applied_on)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {getStatusBadge(user.status)}
                  {user.compatibility_score && (
                    <Badge variant="warning">Match: {user.compatibility_score}%</Badge>
                  )}
                </div>
              </div>

              <div className="candidate-actions">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (user.resume) {
                      window.open(user.resume.startsWith("http") ? user.resume : `${API_BASE}${user.resume}`, "_blank");
                    } else {
                      alert("Resume not uploaded.");
                    }
                  }}
                >
                  <FaFileAlt /> Resume
                </Button>

                <Button 
                  variant="secondary"
                  onClick={() => navigate(`/applicantprofile/${user.applicant}`, { state: { job_id: id } })}
                >
                  <FaUser /> Profile
                </Button>

                <Button 
                  variant="success"
                  disabled={actionLoading === user.applicant}
                  onClick={() => updateStatus(user.applicant, "applicant")}
                >
                  {actionLoading === user.applicant ? <FaSpinner className="spinner-icon" /> : <><FaCheck /> Shortlist</>}
                </Button>

                <Button 
                  variant="danger"
                  disabled={actionLoading === user.applicant}
                  onClick={() => updateStatus(user.applicant, "reject")}
                >
                  {actionLoading === user.applicant ? <FaSpinner className="spinner-icon" /> : <><FaTimes /> Reject</>}
                </Button>

                <Button 
                  variant="primary"
                  style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                  onClick={() => navigate(`/tracker/${id}/${user.applicant}`)}
                >
                  📝 Tracker
                </Button>

                <Button 
                  variant="secondary"
                  onClick={() => navigate(`/compatibility/${id}/${user.applicant}`)}
                >
                  📊 Compatibility
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && applicant.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-5)' }}>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default Applicants;
