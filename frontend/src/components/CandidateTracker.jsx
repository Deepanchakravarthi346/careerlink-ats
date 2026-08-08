import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "./ui/BackButton";
import "../css/CandidateTracker.css";
import { formatDate } from "../utils/formatDate";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const CandidateTracker = () => {
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [applicantInfo, setApplicantInfo] = useState(null);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [interviewForm, setInterviewForm] = useState({
    interview_type: "Phone Screen",
    scheduled_date: "",
    duration_minutes: 30,
    location: "",
    meeting_link: "",
    notes: "",
    interview_round: "Technical",
    time_zone: "Asia/Kolkata",
    meeting_type: "Google Meet",
    office_address: "",
    interviewer_name: "",
    additional_instructions: "",
    internal_notes: "",
    send_email: true,
  });

  const { jobId, applicantId } = useParams();
  const navigate = useNavigate();
  const access_token = localStorage.getItem("accessTokens");

  useEffect(() => {
    fetchNotes();
    fetchInterviews();
    fetchApplicantInfo();
    fetchActivityLogs();
  }, [jobId, applicantId]);

  function fetchActivityLogs() {
    fetch(
      `${API_BASE}/accounts/activity/${jobId}/${applicantId}/`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => setActivityLogs(data || []))
      .catch((err) => console.error(err));
  }

  function fetchApplicantInfo() {
    fetch(`${API_BASE}/accounts/applicantprofile/${applicantId}/`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((res) => res.json())
      .then((data) => setApplicantInfo(data))
      .catch((err) => console.error(err));
  }

  function fetchNotes() {
    fetch(
      `${API_BASE}/accounts/notes/${jobId}/${applicantId}/`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => setNotes(data.results || (Array.isArray(data) ? data : [])))
      .catch((err) => console.error(err));
  }

  function fetchInterviews() {
    fetch(
      `${API_BASE}/accounts/interviews/${jobId}/${applicantId}/`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => setInterviews(data.results || (Array.isArray(data) ? data : [])))
      .catch((err) => console.error(err));
  }

  function addNote() {
    if (!newNote.trim()) return;
    fetch(
      `${API_BASE}/accounts/notes/${jobId}/${applicantId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ note: newNote }),
      },
    )
      .then((res) => res.json())
      .then(() => {
        setNewNote("");
        fetchNotes();
      })
      .catch((err) => console.error(err));
  }

  function deleteNote(noteId) {
    if (!window.confirm("Delete this note?")) return;
    fetch(`${API_BASE}/accounts/notes/delete/${noteId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then(() => fetchNotes())
      .catch((err) => console.error(err));
  }

  function scheduleInterview() {
    if (!interviewForm.scheduled_date) {
      alert("Please select a date and time.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to schedule this ${interviewForm.interview_round} interview?`)) {
      return;
    }

    fetch(
      `${API_BASE}/accounts/interviews/${jobId}/${applicantId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(interviewForm),
      },
    )
      .then((res) => res.json())
      .then(() => {
        setShowInterviewForm(false);
        setInterviewForm({
          interview_type: "Phone Screen",
          scheduled_date: "",
          duration_minutes: 30,
          location: "",
          meeting_link: "",
          notes: "",
          interview_round: "Technical",
          time_zone: "Asia/Kolkata",
          meeting_type: "Google Meet",
          office_address: "",
          interviewer_name: "",
          additional_instructions: "",
          internal_notes: "",
          send_email: true,
        });
        fetchInterviews();
        fetchActivityLogs();
        
        let msg = "✅ Interview successfully scheduled.\n✅ Activity log updated.";
        if (interviewForm.send_email) msg += "\n✉️ Automated email invitation sent to candidate.";
        alert(msg);
      })
      .catch((err) => console.error(err));
  }

  function updateInterviewStatus(interviewId, status) {
    if (!window.confirm(`Are you sure you want to mark this interview as ${status}?`)) {
      return;
    }
    fetch(
      `${API_BASE}/accounts/interviews/update/${interviewId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ status }),
      },
    )
      .then((res) => res.json())
      .then(() => {
        fetchInterviews();
        fetchActivityLogs();
        if (status === "Cancelled") {
            alert("❌ Interview Cancelled.\n✅ Activity log updated.\n✉️ Automated cancellation email sent to candidate.");
        }
      })
      .catch((err) => console.error(err));
  }

  function deleteInterview(interviewId) {
    if (!window.confirm("Delete this interview?")) return;
    fetch(
      `${API_BASE}/accounts/interviews/update/${interviewId}/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${access_token}` },
      },
    )
      .then(() => fetchInterviews())
      .catch((err) => console.error(err));
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "#3b82f6";
      case "Completed":
        return "#10b981";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="tracker-page">
      <div style={{ marginBottom: "16px" }}>
        <BackButton />
      </div>
      <div className="tracker-header">
        <div className="tracker-header-content">
          <h1>Candidate Tracker</h1>
          <p>
            {applicantInfo
              ? `${applicantInfo.username} — ${applicantInfo.headline}`
              : "Loading..."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tracker-tabs">
        <button
          className={`tracker-tab ${activeTab === "notes" ? "tracker-tab-active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          📝 Notes ({notes.length})
        </button>
        <button
          className={`tracker-tab ${activeTab === "interviews" ? "tracker-tab-active" : ""}`}
          onClick={() => setActiveTab("interviews")}
        >
          📅 Interviews ({interviews.length})
        </button>
        <button
          className={`tracker-tab ${activeTab === "activity" ? "tracker-tab-active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          📋 Activity Timeline
        </button>
      </div>

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="tracker-section">
          <div className="tracker-add-form">
            <textarea
              className="tracker-textarea"
              placeholder="Add a note about this candidate..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <button className="tracker-add-btn" onClick={addNote}>
              ➕ Add Note
            </button>
          </div>

          <div className="tracker-list">
            {notes.length === 0 ? (
              <div className="tracker-empty">
                <h3>No notes yet</h3>
                <p>Add your first note about this candidate above.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div className="tracker-note-card" key={note.id}>
                  <p className="tracker-note-text">{note.note}</p>
                  <div className="tracker-note-footer">
                    <div className="tracker-note-meta">
                      <span>👤 {note.recruiter_name}</span>
                      <span>
                        📅{" "}
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <button
                      className="tracker-delete-btn"
                      onClick={() => deleteNote(note.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === "interviews" && (
        <div className="tracker-section">
          <button
            className="tracker-schedule-toggle"
            onClick={() => setShowInterviewForm(!showInterviewForm)}
          >
            {showInterviewForm
              ? "✖ Cancel"
              : "📅 Schedule New Interview"}
          </button>

          {showInterviewForm && (
            <div className="tracker-interview-form">
              <div className="tracker-form-grid">
                
                <div className="tracker-section-title">Interview Details</div>

                <div className="tracker-form-group">
                  <label>Interview Type</label>
                  <select
                    value={interviewForm.interview_type}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        interview_type: e.target.value,
                      })
                    }
                  >
                    <option value="Phone Screen">Phone Screen</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Final">Final</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="tracker-form-group">
                  <label>Interview Round</label>
                  <select
                    value={interviewForm.interview_round}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        interview_round: e.target.value,
                      })
                    }
                  >
                    <option value="HR">HR</option>
                    <option value="Technical">Technical</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <div className="tracker-form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewForm.scheduled_date}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        scheduled_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="tracker-form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={interviewForm.duration_minutes}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        duration_minutes: parseInt(e.target.value) || 30,
                      })
                    }
                    min="15"
                    max="180"
                  />
                </div>
                
                <div className="tracker-section-title">Meeting Details</div>
                
                <div className="tracker-form-group">
                  <label>Meeting Type</label>
                  <select
                    value={interviewForm.meeting_type}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        meeting_type: e.target.value,
                      })
                    }
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Phone">Phone</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
                
                <div className="tracker-form-group">
                  <label>Time Zone</label>
                  <select
                    value={interviewForm.time_zone}
                    disabled
                    style={{ backgroundColor: "#f8fafc", cursor: "not-allowed" }}
                  >
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                  </select>
                </div>

                <div className="tracker-form-group">
                  <label>Interviewer Name</label>
                  <input
                    type="text"
                    placeholder="E.g. John Doe"
                    value={interviewForm.interviewer_name}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        interviewer_name: e.target.value,
                      })
                    }
                  />
                </div>

                {interviewForm.meeting_type === "Office" ? (
                  <div className="tracker-form-group">
                    <label>Office Address</label>
                    <input
                      type="text"
                      placeholder="Company office address"
                      value={interviewForm.office_address}
                      onChange={(e) =>
                        setInterviewForm({
                          ...interviewForm,
                          office_address: e.target.value,
                        })
                      }
                    />
                  </div>
                ) : (
                  interviewForm.meeting_type !== "Phone" && (
                    <div className="tracker-form-group">
                      <label>Meeting Link</label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={interviewForm.meeting_link}
                        onChange={(e) =>
                          setInterviewForm({
                            ...interviewForm,
                            meeting_link: e.target.value,
                          })
                        }
                      />
                    </div>
                  )
                )}

                <div className="tracker-section-title">Instructions & Notifications</div>

                <div className="tracker-form-group tracker-form-full">
                  <label>Additional Instructions for Candidate</label>
                  <textarea
                    placeholder="What should the candidate prepare? Dress code?"
                    value={interviewForm.additional_instructions}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        additional_instructions: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div className="tracker-form-group tracker-form-full">
                  <label>Internal Notes (Private)</label>
                  <textarea
                    placeholder="Notes for the recruiter/interviewer..."
                    value={interviewForm.internal_notes}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        internal_notes: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                
                <div className="tracker-checkbox-group tracker-form-full">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={interviewForm.send_email} 
                      onChange={(e) => setInterviewForm({...interviewForm, send_email: e.target.checked})} 
                      style={{ width: '18px', height: '18px' }} 
                    />
                    <span>☑ Notify candidate by email</span>
                  </label>
                </div>
                
              </div>

              <button
                className="tracker-add-btn"
                onClick={scheduleInterview}
              >
                📅 Schedule Interview
              </button>
            </div>
          )}

          <div className="tracker-list">
            {interviews.length === 0 ? (
              <div className="tracker-empty">
                <h3>No interviews scheduled</h3>
                <p>Schedule the first interview for this candidate.</p>
              </div>
            ) : (
              interviews.map((interview) => (
                <div className="tracker-interview-card" key={interview.id}>
                  <div className="tracker-interview-top">
                    <div className="tracker-interview-info">
                      <span className="tracker-type-badge">
                        {interview.interview_type}
                      </span>
                      <span
                        className="tracker-status-badge"
                        style={{
                          background: `${getStatusColor(interview.status)}20`,
                          color: getStatusColor(interview.status),
                          borderColor: getStatusColor(interview.status),
                        }}
                      >
                        {interview.status}
                      </span>
                    </div>
                  </div>

                  <div className="tracker-interview-details">
                    <p>
                      📅{" "}
                      <span className="interview-datetime">
                        {formatDate(interview.scheduled_date)} at {new Date(interview.scheduled_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </p>
                    <p>⏱️ {interview.duration_minutes} minutes</p>
                    {interview.location && <p>📍 {interview.location}</p>}
                    {interview.meeting_link && (
                      <p>
                        🔗{" "}
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Join Meeting
                        </a>
                      </p>
                    )}
                    {interview.notes && (
                      <p className="tracker-interview-notes">
                        📝 {interview.notes}
                      </p>
                    )}
                    <small>Scheduled by: {interview.recruiter_name}</small>
                  </div>

                  <div className="tracker-interview-actions">
                    {interview.status === "Scheduled" && (
                      <>
                        <button
                          className="tracker-complete-btn"
                          onClick={() =>
                            updateInterviewStatus(interview.id, "Completed")
                          }
                        >
                          ✅ Mark Complete
                        </button>
                        <button
                          className="tracker-cancel-btn"
                          onClick={() =>
                            updateInterviewStatus(interview.id, "Cancelled")
                          }
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    <button
                      className="tracker-delete-btn"
                      onClick={() => deleteInterview(interview.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Activity Timeline Tab */}
      {activeTab === "activity" && (
        <div className="tracker-section tracker-timeline-container">
          {activityLogs.length === 0 ? (
            <div className="tracker-empty">
               <h3>No activity yet</h3>
               <p>Candidate actions will appear here automatically.</p>
            </div>
          ) : (
            <div className="tracker-timeline">
              {activityLogs.map((log) => {
                let icon = "📌";
                if (log.action.includes("Shortlisted")) icon = "✨";
                if (log.action.includes("Rejected")) icon = "🚫";
                if (log.action.includes("Scheduled")) icon = "📅";
                if (log.action.includes("Updated")) icon = "✏️";
                if (log.action.includes("Cancelled")) icon = "❌";
                if (log.action.includes("Completed")) icon = "✅";
                if (log.action.includes("Offer Sent")) icon = "🎉";
                if (log.action.includes("Hired")) icon = "🚀";
                if (log.action.includes("Email Sent")) icon = "✉️";

                return (
                  <div className="tracker-timeline-item" key={log.id}>
                     <div className="tracker-timeline-dot">{icon}</div>
                     <div className="tracker-timeline-content">
                        <h4>{log.action}</h4>
                        <p>{log.details}</p>
                        <small>{formatDate(log.created_at)} — by {log.recruiter_name || 'System'}</small>
                     </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateTracker;
