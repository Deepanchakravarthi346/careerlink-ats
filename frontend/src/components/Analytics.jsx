import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../css/Analytics.css";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ef4444", "#3b82f6"];

  useEffect(() => {
    fetch(`${API_BASE}/accounts/analytics/`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [access_token]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loader"></div>
        <h2>Loading Analytics Dashboard...</h2>
      </div>
    );
  }

  if (!data) return <div className="analytics-error">Failed to load analytics data.</div>;

  return (
    <div className="analytics-page">
      <div style={{ marginBottom: "24px" }}>
        <BackButton />
      </div>
      <div className="analytics-header">
        <div className="analytics-title">
          <h1>📊 Recruiter Analytics</h1>
          <p>Gain insights into your hiring pipeline and job performance</p>
        </div>
      </div>

      <div className="analytics-stat-row">
        <div className="analytics-stat-card">
          <h3>Total Applications</h3>
          <div className="stat-value">{data.total_applications}</div>
          <p>Across all jobs</p>
        </div>
        <div className="analytics-stat-card">
          <h3>Shortlist Rate</h3>
          <div className="stat-value text-blue">{data.shortlist_rate}%</div>
          <p>Of all applicants</p>
        </div>
        <div className="analytics-stat-card">
          <h3>Hire Rate</h3>
          <div className="stat-value text-green">{data.hire_rate}%</div>
          <p>Of all applicants</p>
        </div>
        <div className="analytics-stat-card">
          <h3>Reject Rate</h3>
          <div className="stat-value text-red">{data.reject_rate}%</div>
          <p>Of all applicants</p>
        </div>
        <div className="analytics-stat-card">
          <h3>Avg Apps/Job</h3>
          <div className="stat-value text-purple">{data.avg_apps_per_job}</div>
          <p>Applications per posting</p>
        </div>
      </div>

      <div className="analytics-charts-grid">
        {/* Trend Chart */}
        <div className="analytics-chart-card span-2">
          <h2>Monthly Hiring Trends</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data.monthly_trends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  name="Applications Received"
                />
                <Line type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={3} name="Jobs Posted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="analytics-chart-explanation">
            <h4>How to read this chart</h4>
            <ul>
              <li>Shows how application volume compares to job postings over time.</li>
              <li>Helps identify peak hiring seasons and application trends.</li>
            </ul>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="analytics-chart-card">
          <h2>Pipeline Distribution</h2>
          <div style={{ width: "100%", height: 300 }}>
            {data.pipeline_dist.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.pipeline_dist}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.pipeline_dist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No pipeline data available</div>
            )}
          </div>
          <div className="analytics-chart-explanation">
            <h4>How to read this chart</h4>
            <ul>
              <li>Shows the distribution of applicants by application status.</li>
              <li>Larger slices represent more applicants in that stage.</li>
              <li>Helps recruiters understand the overall hiring pipeline.</li>
            </ul>
          </div>
        </div>

        {/* Most Applied Jobs */}
        <div className="analytics-chart-card span-2">
          <h2>Top Performing Jobs</h2>
          <div style={{ width: "100%", height: 300 }}>
            {data.most_applied_jobs.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={data.most_applied_jobs} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="title" width={100} tick={{ fontSize: 10, wordWrap: 'break-word' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="applications" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Applications" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No jobs data available</div>
            )}
          </div>
          <div className="analytics-chart-explanation">
            <h4>How to read this chart</h4>
            <ul>
              <li>Compares applicant counts across categories.</li>
              <li>Taller bars indicate higher values.</li>
              <li>Useful for identifying hiring trends at a glance.</li>
            </ul>
          </div>
        </div>

        {/* Top Skills */}
        <div className="analytics-chart-card">
          <h2>Most In-Demand Skills</h2>
          <div className="skills-cloud">
            {data.top_skills.length > 0 ? (
              data.top_skills.map((skill, index) => (
                <div key={index} className="skill-tag" style={{ opacity: 1 - index * 0.1 }}>
                  {skill.name} <span className="skill-count">{skill.value}</span>
                </div>
              ))
            ) : (
              <div className="empty-chart">No skills data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
