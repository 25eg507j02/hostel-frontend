import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../apiConfig";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [studentProfile, setStudentProfile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [gatePasses, setGatePasses] = useState([]);

  // Modal forms
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showGatePassModal, setShowGatePassModal] = useState(false);

  // New Complaint form
  const [category, setCategory] = useState("Electrical");
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");

  // New Gate Pass form
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [returnTime, setReturnTime] = useState("");

  // Action status message
  const [actionMsg, setActionMsg] = useState("");

  // Fetch student specific profile & lists
  useEffect(() => {
    fetchStudentData();
    fetchNotices();
    fetchComplaints();
    fetchGatePasses();
  }, [user]);

  const fetchStudentData = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.STUDENTS}/email/${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setStudentProfile(data);
        if (data.roomNumber) setRoomNumber(data.roomNumber);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.NOTICES);
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.COMPLAINTS);
      if (res.ok) {
        const data = await res.json();
        // Filter student's complaints or show all for student
        const myComplaints = data.filter(c => c.studentEmail === user.email || !c.studentEmail);
        setComplaints(myComplaints);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGatePasses = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.GATEPASSES}?studentEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setGatePasses(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Complaint
  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setActionMsg("");
    try {
      const payload = {
        studentName: user.name,
        studentEmail: user.email,
        roomNumber: roomNumber || studentProfile?.roomNumber || "N/A",
        hostelName: studentProfile?.hostelName || "Hostel Block 1",
        category,
        description,
      };

      const res = await fetch(API_ENDPOINTS.COMPLAINTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActionMsg("Complaint lodged successfully!");
        setDescription("");
        setShowComplaintModal(false);
        fetchComplaints();
      }
    } catch {
      setActionMsg("Failed to submit complaint. Check backend.");
    }
  };

  // Submit Gate Pass Request
  const handleCreateGatePass = async (e) => {
    e.preventDefault();
    setActionMsg("");
    try {
      const payload = {
        studentName: user.name,
        studentEmail: user.email,
        roomNumber: roomNumber || studentProfile?.roomNumber || "N/A",
        hostelName: studentProfile?.hostelName || "Hostel Block 1",
        reason,
        destination,
        departureTime,
        returnTime,
      };

      const res = await fetch(API_ENDPOINTS.GATEPASSES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActionMsg("Gate pass requested successfully!");
        setReason("");
        setDestination("");
        setShowGatePassModal(false);
        fetchGatePasses();
      }
    } catch {
      setActionMsg("Failed to request gate pass.");
    }
  };

  const urgentNotice = notices.find(n => n.urgent);
  const pendingComplaintsCount = complaints.filter(c => c.status === "PENDING").length;
  const approvedPassCount = gatePasses.filter(g => g.status === "APPROVED").length;

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
          My Complaints ({complaints.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "gatepasses" ? "active" : ""}`}
          onClick={() => setActiveTab("gatepasses")}
        >
          Gate Passes ({gatePasses.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "notices" ? "active" : ""}`}
          onClick={() => setActiveTab("notices")}
        >
          Notice Board ({notices.length})
        </button>
      </nav>

      <main className="main-content">
        {actionMsg && (
          <div className="alert-message alert-success">
            {actionMsg}
          </div>
        )}

        {/* Urgent Announcement Header if available */}
        {urgentNotice && (
          <div className="notice-banner">
            <div className="banner-left">
              <span className="badge badge-urgent">URGENT</span>
              <div>
                <strong>{urgentNotice.title}</strong>: {urgentNotice.content}
              </div>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {urgentNotice.postedBy}
            </span>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Quick Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-title">Room & Hostel</span>
                <span className="stat-value">{studentProfile?.roomNumber || "B-204"}</span>
                <span className="stat-desc">{studentProfile?.hostelName || "Boys Hostel Block 1"}</span>
              </div>

              <div className="stat-card">
                <span className="stat-title">Hostel Fee Status</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span className={`badge ${studentProfile?.feeStatus === "PAID" ? "badge-paid" : "badge-pending"}`}>
                    {studentProfile?.feeStatus || "PAID"}
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                    ₹{studentProfile?.feeAmount || 45000}
                  </span>
                </div>
                <span className="stat-desc">Semester Maintenance Fee</span>
              </div>

              <div className="stat-card">
                <span className="stat-title">Pending Complaints</span>
                <span className="stat-value" style={{ color: pendingComplaintsCount > 0 ? "var(--warning)" : "inherit" }}>
                  {pendingComplaintsCount}
                </span>
                <span className="stat-desc">Awaiting resolution by Warden</span>
              </div>

              <div className="stat-card">
                <span className="stat-title">Approved Outpasses</span>
                <span className="stat-value" style={{ color: "var(--success)" }}>
                  {approvedPassCount}
                </span>
                <span className="stat-desc">Ready for gate exit</span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button className="btn btn-primary" onClick={() => setShowComplaintModal(true)}>
                + Raise Maintenance Issue
              </button>
              <button className="btn btn-secondary" onClick={() => setShowGatePassModal(true)}>
                + Request Gate Pass
              </button>
            </div>

            {/* Recent Notices Snapshot */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Broadcasts</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("notices")}>
                  View All
                </button>
              </div>
              <div className="card-body">
                {notices.length === 0 ? (
                  <p className="empty-state">No notices posted yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {notices.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "0.75rem",
                          background: "rgba(255, 255, 255, 0.02)",
                          borderRadius: "var(--radius-sm)",
                          borderLeft: n.urgent ? "3px solid var(--danger)" : "3px solid var(--primary)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <strong style={{ fontSize: "0.9rem" }}>{n.title}</strong>
                          <span className="badge">{n.category || "General"}</span>
                        </div>
                        <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>{n.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === "complaints" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Maintenance & Complaints</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowComplaintModal(true)}>
                + Lodge New Complaint
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Room</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Resolution Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-state">No complaints raised. Everything looks good!</td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c.id}>
                          <td>#{c.id}</td>
                          <td>
                            <span className="badge">{c.category}</span>
                          </td>
                          <td>{c.roomNumber || "N/A"}</td>
                          <td>{c.description}</td>
                          <td>
                            <span className={`badge ${c.status === "RESOLVED" ? "badge-resolved" : "badge-pending"}`}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                            {c.resolutionNotes || "—"}
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
              <span className="card-title">Digital Outpasses / Gate Passes</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowGatePassModal(true)}>
                + Request Gate Pass
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Pass ID</th>
                      <th>Reason</th>
                      <th>Destination</th>
                      <th>Departure</th>
                      <th>Expected Return</th>
                      <th>Status</th>
                      <th>Warden Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gatePasses.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-state">No gate passes requested.</td>
                      </tr>
                    ) : (
                      gatePasses.map((g) => (
                        <tr key={g.id}>
                          <td>#{g.id}</td>
                          <td>{g.reason}</td>
                          <td>{g.destination || "Local"}</td>
                          <td>{g.departureTime || "N/A"}</td>
                          <td>{g.returnTime || "N/A"}</td>
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
                          <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                            {g.wardenRemarks || "—"}
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
              <span className="card-title">Hostel Notice Board</span>
            </div>
            <div className="card-body">
              {notices.length === 0 ? (
                <p className="empty-state">No notices available.</p>
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
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {n.urgent && <span className="badge badge-urgent">URGENT</span>}
                          <span className="badge">{n.category || "Notice"}</span>
                          <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{n.title}</h3>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          By: {n.postedBy || "Warden Office"}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: LODGE COMPLAINT */}
      {showComplaintModal && (
        <div className="modal-overlay" onClick={() => setShowComplaintModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Lodge Maintenance Issue</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowComplaintModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateComplaint}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Electrical">Electrical (Fan, Light, Switch)</option>
                    <option value="Plumbing">Plumbing (Tap, Shower, Leakage)</option>
                    <option value="Wi-Fi">Wi-Fi & Internet</option>
                    <option value="Carpentry">Carpentry & Furniture</option>
                    <option value="Cleaning">Housekeeping & Cleaning</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. B-204"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Describe the Problem</label>
                  <textarea
                    rows={4}
                    placeholder="Detail the issue so maintenance staff can resolve it quickly..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowComplaintModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST GATE PASS */}
      {showGatePassModal && (
        <div className="modal-overlay" onClick={() => setShowGatePassModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Request Outpass / Gate Pass</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowGatePassModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateGatePass}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason for Leave</label>
                  <input
                    type="text"
                    placeholder="e.g. Visiting home for weekend"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Destination City / Place</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Departure Date & Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-10-18 09:00"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expected Return Date & Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-10-20 20:00"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGatePassModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
