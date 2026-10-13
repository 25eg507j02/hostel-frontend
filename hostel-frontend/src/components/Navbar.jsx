import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, backendHealth } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">H</div>
        <span>HostelConnect</span>
      </div>

      <div className="nav-actions">
        {/* Backend Connectivity Status Pill */}
        <div className="health-pill" title={`Backend: ${backendHealth}`}>
          <span className={`health-dot ${backendHealth === "UP" ? "online" : "offline"}`}></span>
          <span>{backendHealth === "UP" ? "Cloud DB Connected" : "Backend Offline"}</span>
        </div>

        {user && (
          <>
            <div className="user-badge">
              <span className={`badge ${user.role === "WARDEN" ? "badge-role-warden" : "badge-role-student"}`}>
                {user.role}
              </span>
              <span>{user.name}</span>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
