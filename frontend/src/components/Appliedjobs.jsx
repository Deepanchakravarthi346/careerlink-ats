import { useEffect, useState } from "react";
import "../css/Appliedjobs.css";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaSearch, FaBuilding, FaBriefcase } from "react-icons/fa";
import Pagination from "./Pagination";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Skeleton from "./ui/Skeleton";
import ErrorState from "./ui/ErrorState";
import BackButton from "./ui/BackButton";
import { formatDate } from "../utils/formatDate";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const AppliedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchJobs, setSearchJobs] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOption, setSortOption] = useState("-applied_on");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("accessTokens");

  const fetchAppliedJobs = async (page = 1, search = searchJobs, status = statusFilter, sort = sortOption) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page,
        search: search,
        status: status,
        sort: sort
      });
      const res = await fetch(`${API_BASE}/accounts/appliedjobs/?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to load applied jobs.");
      
      const data = await res.json();
      setJobs(data.results || (Array.isArray(data) ? data : []));
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.current_page || 1);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err) {
      console.error(err);
      setError("Unable to load applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliedJobs(currentPage, searchJobs, statusFilter, sortOption);
  }, [currentPage, statusFilter, sortOption]);

  const handleSearch = (val) => {
    setSearchJobs(val);
    setCurrentPage(1);
    fetchAppliedJobs(1, val, statusFilter, sortOption);
  };

  const resetFilters = () => {
    setSearchJobs("");
    setStatusFilter("");
    setSortOption("-applied_on");
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Applied': return <Badge variant="secondary" className="ats-badge ats-badge-applied">Applied</Badge>;
      case 'ShortListed': 
      case 'Shortlisted': return <Badge variant="secondary" className="ats-badge ats-badge-shortlisted">Shortlisted</Badge>;
      case 'Interview Scheduled':
      case 'Technical Round':
      case 'HR Round':
      case 'Offer Sent': return <Badge variant="secondary" className="ats-badge ats-badge-interview">{status}</Badge>;
      case 'Rejected': return <Badge variant="danger" className="ats-badge ats-badge-rejected">Rejected</Badge>;
      case 'Hired': return <Badge variant="success" className="ats-badge ats-badge-hired">Hired</Badge>;
      default: return <Badge variant="secondary" className="ats-badge">{status}</Badge>;
    }
  };

  return (
    <div className="ats-page-container">
      {/* HEADER SECTION */}
      <div className="ats-page-header">
        <BackButton style={{ marginBottom: '16px' }} />
        <h1>Applied Jobs</h1>
        <p>Track every application in one place.</p>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="ats-filter-card">
        <div className="ats-filter-search">
          <FaSearch className="ats-filter-icon" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchJobs}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="ats-filter-divider"></div>
        <div className="ats-filter-dropdowns">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="ShortListed">Shortlisted</option>
            <option value="Interview Scheduled">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>
          <select value={sortOption} onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}>
            <option value="-applied_on">Newest First</option>
            <option value="applied_on">Oldest First</option>
          </select>
          <Button variant="outline" onClick={resetFilters} className="ats-btn-reset">Reset</Button>
        </div>
      </div>

      {/* APPLICATIONS LIST */}
      {isLoading ? (
        <div className="ats-applications-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="ats-app-card ats-skeleton-card">
              <Skeleton type="card" style={{ height: "200px", border: "none", boxShadow: "none" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAppliedJobs(currentPage, searchJobs, statusFilter, sortOption)} />
      ) : jobs.length === 0 ? (
        <div className="ats-empty-state">
          <div className="ats-empty-icon-wrapper">
            <FaBriefcase />
          </div>
          <h3>No applications yet</h3>
          <p>You haven't submitted any job applications that match this criteria.</p>
          <Button variant="primary" onClick={() => navigate("/home")} className="ats-btn-browse">Browse Jobs</Button>
        </div>
      ) : (
        <div className="ats-applications-list">
          {jobs.map((job) => (
            <div className="ats-app-card" key={job.id}>
              
              <div className="ats-card-logo">
                <FaBuilding />
              </div>

              <div className="ats-card-center">
                <h2 className="ats-company-name">{job.company}</h2>
                <h3 className="ats-job-role">{job.title}</h3>
                
                <div className="ats-meta-grid">
                  <div className="ats-meta-item">
                    <FaMapMarkerAlt className="ats-meta-icon" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  <div className="ats-meta-item">
                    <FaMoneyBillWave className="ats-meta-icon" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="ats-meta-item">
                    <FaBriefcase className="ats-meta-icon" />
                    <span>{job.experience}</span>
                  </div>
                  <div className="ats-meta-item">
                    <FaCalendarAlt className="ats-meta-icon" />
                    <span>Applied: {formatDate(job.applied_on)}</span>
                  </div>
                </div>
              </div>

              <div className="ats-card-right">
                <div className="ats-status-container">
                  {getStatusBadge(job.status)}
                </div>
                <Button variant="secondary" onClick={() => navigate(`/job/${job.job}`)} className="ats-btn-details">
                  View Details
                </Button>
              </div>

            </div>
          ))}
        </div>
      )}
      
      {!isLoading && jobs.length > 0 && (
        <div className="ats-pagination-wrapper">
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

export default AppliedJobs;
