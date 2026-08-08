import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import { FaSpinner, FaBriefcase, FaChartBar, FaFileAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import StatisticCard from "./ui/StatisticCard";
import Skeleton from "./ui/Skeleton";
import ErrorState from "./ui/ErrorState";
import BackButton from "./ui/BackButton";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Dashboard = () => {
  const [dash, setDash] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/accounts/dashboard/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!response.ok) throw new Error("Failed to load dashboard data");

      const data = await response.json();
      setDash(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [access_token]);

  if (isLoading) {
    return (
      <div className="rd-dashboard">
        <div className="rd-header">
          <Skeleton type="title" style={{ width: '300px' }} />
          <Skeleton type="text" style={{ width: '200px' }} />
        </div>
        <div className="rd-stats-grid">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} type="card" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rd-dashboard">
        <ErrorState message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  return (
    <div className="rd-dashboard">
      <div className="rd-header">
        <BackButton style={{ marginBottom: '16px' }} />
        <h1>Recruiter Dashboard</h1>
        <p>Monitor your hiring activities, applicants, and job performance.</p>
      </div>

      <div className="rd-stats-grid">
        <div onClick={() => navigate("/dashboardtotaljobs")} className="rd-stat-card-custom">
          <StatisticCard 
            title="Total Jobs" 
            value={dash?.total_jobs || 0} 
            icon={<FaBriefcase size={24} />} 
          />
        </div>

        <div onClick={() => navigate("/dashboardapplicants")} className="rd-stat-card-custom">
          <StatisticCard 
            title="Applications" 
            value={dash?.total_applications || 0} 
            icon={<FaFileAlt size={24} />} 
          />
        </div>

        <div onClick={() => navigate("/dashboardapplicants?status=Applied")} className="rd-stat-card-custom">
          <StatisticCard 
            title="Pending" 
            value={dash?.total_pending || 0} 
            icon={<FaHourglassHalf size={24} color="#D97706" />} 
            className="stat-warning"
          />
        </div>

        <div onClick={() => navigate("/dashboardtotalshortlist")} className="rd-stat-card-custom">
          <StatisticCard 
            title="Shortlisted" 
            value={dash?.total_shortlist || 0} 
            icon={<FaCheckCircle size={24} color="#166534" />} 
            className="stat-success"
          />
        </div>

        <div onClick={() => navigate("/dashboardtotalreject")} className="rd-stat-card-custom">
          <StatisticCard 
            title="Rejected" 
            value={dash?.total_rejected || 0} 
            icon={<FaTimesCircle size={24} color="#991B1B" />} 
            className="stat-danger"
          />
        </div>

        <div onClick={() => navigate("/analytics")} className="rd-stat-card-custom">
          <StatisticCard 
            title="Analytics" 
            value="View" 
            icon={<FaChartBar size={24} color="#1E40AF" />} 
            style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}
          />
        </div>
      </div>

      <div className="rd-bottom-card">
        <div className="rd-bottom-icon">
          <FaHourglassHalf />
        </div>
        <div>
          <h3>Pending Applications</h3>
          <h1>{dash?.total_pending || 0}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Review these applications to keep your hiring pipeline moving.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
