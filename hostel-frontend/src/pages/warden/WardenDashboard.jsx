import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../apiConfig";

export default function WardenDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // State data
  const [complaints, setComplaints] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [students, setStudents] = useState([]);

  // Modal states
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // New Notice form
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("General");
  const [noticeUrgent, setNoticeUrgent] = useState(false);

  // Status feedback
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchComplaints();
    fetchGatePasses();
    fetchNotices();
    fetchStudents();
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.COMPLAINTS);
      if (res.ok) setComplaints(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGatePasses = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.GATEPASSES);
      if (res.ok) setGatePasses(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.NOTICES);
      if (res.ok) setNotices(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.STUDENTS);
      if (res.ok) setStudents(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve Complaint
  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await fetch(`${API_ENDPOINTS.COMPLAINTS}/${selectedComplaint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RESOLVED",
          resolutionNotes: resolutionNotes || "Resolved by Warden & Maintenance staff.",
        }),
      });

      if (res.ok) {
        setActionMsg(`Complaint #${selectedComplaint.id} marked as RESOLVED.`);
        setSelectedComplaint(null);
        setResolutionNotes("");
        fetchComplaints();
      }
    } catch {
      setActionMsg("Failed to resolve complaint.");
    }
  };

  // Gate Pass Status Update (Approve / Reject)
  const handleUpdateGatePass = async (id, newStatus) => {
    try {
      const remarks = prompt(
        `Add remarks for ${newStatus} (optional):`,
        newStatus === "APPROVED" ? "Approved by Warden. Carry ID Card." : "Rejected due to attendance/rules."
      );

      const res = await fetch(`${API_ENDPOINTS.GATEPASSES}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          remarks: remarks || "",
        }),
      });

      if (res.ok) {
        setActionMsg(`Gate pass #${id} has been ${newStatus}.`);
        fetchGatePasses();
      }
    } catch {
      setActionMsg("Failed to update gate pass status.");
    }
  };

  // Post Notice
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_ENDPOINTS.NOTICES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          category: noticeCategory,
          urgent: noticeUrgent,
          postedBy: user?.name || "Chief Warden",
        }),
      });

      if (res.ok) {
        setActionMsg("Notice published to all students.");
        setNoticeTitle("");
        setNoticeContent("");
        setNoticeUrgent(false);
        setShowNoticeModal(false);
        fetchNotices();
      }
    } catch {
      setActionMsg("Failed to post notice.");
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.NOTICES}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMsg("Notice removed.");
        fetchNotices();
      }
    } catch {
      setActionMsg("Failed to delete notice.");
    }
  };

  // Toggle Student Fee Status
  const handleToggleFeeStatus = async (student) => {
    const nextStatus = student.feeStatus === "PAID" ? "PENDING" : "PAID";
    try {
      const res = await fetch(`${API_ENDPOINTS.STUDENTS}/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...student, feeStatus: nextStatus }),
      });

      if (res.ok) {
        setActionMsg(`Updated fee status for ${student.name} to ${nextStatus}.`);
        fetchStudents();
      }
    } catch {
      setActionMsg("Failed to update student fee status.");
    }
  };

  const pendingComplaints = complaints.filter(c => c.status === "PENDING");
  const pendingGatePasses = gatePasses.filter(g => g.status === "PENDING");
  const unpaidStudents = students.filter(s => s.feeStatus !== "PAID");

  return (
    <div>
      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => setActiveTab("complaints")}
        >
          Complaints ({pendingComplaints.length} Pending)
        </button>
        <button
          className={`tab-btn ${activeTab === "gatepasses" ? "active" : ""}`}
          onClick={() => setActiveTab("gatepasses")}
        >
          Outpass Requests ({pendingGatePasses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "notices" ? "active" : ""}`}
          onClick={() => setActiveTab("notices")}
        >
          Notice Board ({notices.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Student Roster ({students.length})
        </button>
      </nav>

      <main className="main-content">
        {actionMsg && (
          <div className="alert-message alert-success">
            {actionMsg}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-title">Pending Complaints</span>
                <span className="stat-value" style={{ color: pendingComplaints.length > 0 ? "var(--warning)" : "var(--success)" }}>
                  {pendingComplaints.length}
                </span>
                <span className="stat-desc">Issues needing maintenance</span>
              </div>

              <div className="stat-card">
                <span className="stat-title">Gate Pass Queue</span>
                <span className="stat-value" style={{ color: pendingGatePasses.length > 0 ? "var(--primary)" : "inherit" }}>
                  {pendingGatePasses.length}
                </span>
                <span className="stat-desc">Outpass requests pending review</span>
              </div>

              <div className="stat-card">
                <span className="stat-title">Total Residents</span>
                <span className="stat-value">{students.length}</span>
                <span className="stat-desc">Active students registered</span>
              </div>

              <div className="stat-card">
                <span className="stat-title">Fee Defaulters</span>
                <span className="stat-value" style={{ color: unpaidStudents.length > 0 ? "var(--danger)" : "var(--success)" }}>
                  {unpaidStudents.length}
                </span>
                <span className="stat-desc">Unpaid maintenance dues</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-primary" onClick={() => setShowNoticeModal(true)}>
                + Broadcast New Notice
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab("complaints")}>
                View Pending Complaints
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab("gatepasses")}>
                Review Outpass Queue
              </button>
            </div>

            {/* Quick overview of pending complaints */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Urgent / Pending Complaints</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("complaints")}>Manage All</button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student</th>
                        <th>Room</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingComplaints.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-state">No pending complaints. All issues resolved!</td>
                        </tr>
                      ) : (
                        pendingComplaints.slice(0, 5).map((c) => (
                          <tr key={c.id}>
                            <td>#{c.id}</td>
                            <td>{c.studentName}</td>
                            <td>{c.roomNumber || "N/A"}</td>
                            <td><span className="badge">{c.category}</span></td>
                            <td>{c.description}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => { setSelectedComplaint(c); setResolutionNotes(""); }}
                              >
                                Resolve
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === "complaints" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">All Student Maintenance Complaints</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Room</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-state">No complaints found.</td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c.id}>
                          <td>#{c.id}</td>
                          <td>
                            <strong>{c.studentName}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.studentEmail}</div>
                          </td>
                          <td>{c.roomNumber || "N/A"}</td>
                          <td><span className="badge">{c.category}</span></td>
                          <td>
                            <div>{c.description}</div>
                            {c.resolutionNotes && (
                              <div style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: "0.2rem" }}>
                                ✓ {c.resolutionNotes}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${c.status === "RESOLVED" ? "badge-resolved" : "badge-pending"}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            {c.status !== "RESOLVED" ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => { setSelectedComplaint(c); setResolutionNotes(""); }}
                              >
                                Mark Resolved
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Completed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GATE PASSES TAB */}
        {activeTab === "gatepasses" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Outpass & Gate Pass Requests</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Student</th>
                      <th>Room</th>
                      <th>Reason & Destination</th>
                      <th>Dates</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatePasses.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-state">No outpass requests found.</td>
                      </tr>
                    ) : (
                      gatePasses.map((g) => (
                        <tr key={g.id}>
                          <td>#{g.id}</td>
                          <td>
                            <strong>{g.studentName}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{g.studentEmail}</div>
                          </td>
                          <td>{g.roomNumber || "N/A"}</td>
                          <td>
                            <strong>{g.reason}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>To: {g.destination || "Local"}</div>
                          </td>
                          <td style={{ fontSize: "0.8rem" }}>
                            <div>Out: {g.departureTime || "N/A"}</div>
                            <div>In: {g.returnTime || "N/A"}</div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                g.status === "APPROVED"
                                  ? "badge-approved"
                                  : g.status === "REJECTED"
                                  ? "badge-rejected"
                                  : "badge-pending"
                              }`}
                            >
                              {g.status}
                            </span>
                          </td>
                          <td>
                            {g.status === "PENDING" ? (
                              <div style={{ display: "flex", gap: "0.4rem" }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleUpdateGatePass(g.id, "APPROVED")}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleUpdateGatePass(g.id, "REJECTED")}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* NOTICES TAB */}
        {activeTab === "notices" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Manage Notice Board</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowNoticeModal(true)}>
                + Post New Notice
              </button>
            </div>
            <div className="card-body">
              {notices.length === 0 ? (
                <p className="empty-state">No notices posted. Click the button above to publish your first announcement.</p>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "1.25rem",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                          {n.urgent && <span className="badge badge-urgent">URGENT</span>}
                          <span className="badge">{n.category || "General"}</span>
                          <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{n.title}</h3>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          {n.content}
                        </p>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Published by: {n.postedBy || "Warden"}
                        </span>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteNotice(n.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Student Directory & Fee Status</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Room</th>
                      <th>Hostel Block</th>
                      <th>Phone</th>
                      <th>Fee Amount</th>
                      <th>Fee Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-state">No students found.</td>
                      </tr>
                    ) : (
                      students.map((s) => (
                        <tr key={s.id}>
                          <td>#{s.id}</td>
                          <td>
                            <strong>{s.name}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.email}</div>
                          </td>
                          <td>{s.roomNumber || "N/A"}</td>
                          <td>{s.hostelName || "Block 1"}</td>
                          <td>{s.phone || "—"}</td>
                          <td>₹{s.feeAmount || 45000}</td>
                          <td>
                            <span className={`badge ${s.feeStatus === "PAID" ? "badge-paid" : "badge-pending"}`}>
                              {s.feeStatus || "PENDING"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleToggleFeeStatus(s)}
                            >
                              Toggle {s.feeStatus === "PAID" ? "Unpaid" : "Paid"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: POST NOTICE */}
      {showNoticeModal && (
        <div className="modal-overlay" onClick={() => setShowNoticeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Publish Hostel Notice</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowNoticeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateNotice}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Water Supply Interruption / Mess Timings"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={noticeCategory} onChange={(e) => setNoticeCategory(e.target.value)}>
                    <option value="General">General Announcement</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Mess">Mess & Food</option>
                    <option value="Rules">Discipline & Rules</option>
                    <option value="Inspection">Room Inspection</option>
                  </select>
                </div>

                <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    id="urgentNotice"
                    checked={noticeUrgent}
                    onChange={(e) => setNoticeUrgent(e.target.checked)}
                  />
                  <label htmlFor="urgentNotice" style={{ cursor: "pointer", color: "var(--text-primary)" }}>
                    Mark as Urgent Announcement (Pins at top of Student screen)
                  </label>
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea
                    rows={4}
                    placeholder="Write announcement description..."
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNoticeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE COMPLAINT */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Resolve Complaint #{selectedComplaint.id}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedComplaint(null)}>✕</button>
            </div>
            <form onSubmit={handleResolveComplaint}>
              <div className="modal-body">
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Student & Room:</div>
                  <strong>{selectedComplaint.studentName} ({selectedComplaint.roomNumber})</strong>
                </div>

                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Reported Issue:</div>
                  <p style={{ fontSize: "0.9rem" }}>{selectedComplaint.description}</p>
                </div>

                <div className="form-group">
                  <label>Resolution Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Detail the fix applied (e.g. Electrician replaced capacitor / Plumber fixed leak)"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
