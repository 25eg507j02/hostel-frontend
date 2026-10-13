import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../apiConfig";

export default function AuthPage() {
  const { login } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STUDENT"); // STUDENT or WARDEN

  // UI status
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      if (isLoginTab) {
        // Login Flow
        const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setIsError(true);
          setMessage(data.message || "Invalid credentials. Please try again.");
          setLoading(false);
          return;
        }

        login({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
      } else {
        // Register Flow
        const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
          setIsError(true);
          setMessage(data.message || "Registration failed.");
          setLoading(false);
          return;
        }

        setIsError(false);
        setMessage("Account created successfully! Please sign in.");
        setIsLoginTab(true);
      }
    } catch {
      setIsError(true);
      setMessage("Cannot connect to backend server. Ensure Spring Boot is running on port 9090.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo credentials helper
  const fillDemoAccount = (roleType) => {
    if (roleType === "STUDENT") {
      setEmail("student@hostel.com");
      setPassword("password123");
    } else {
      setEmail("warden@hostel.com");
      setPassword("password123");
    }
    setIsLoginTab(true);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.25rem" }}>
            HostelConnect
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Student & Hostel Management Portal
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${isLoginTab ? "active" : ""}`}
            onClick={() => { setIsLoginTab(true); setMessage(""); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!isLoginTab ? "active" : ""}`}
            onClick={() => { setIsLoginTab(false); setMessage(""); }}
          >
            Register
          </button>
        </div>

        {message && (
          <div className={`alert-message ${isError ? "alert-error" : "alert-success"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!isLoginTab && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anurag Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="STUDENT">Student</option>
                  <option value="WARDEN">Warden / Management</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@hostel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Processing..." : isLoginTab ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Quick Demo Login:
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => fillDemoAccount("STUDENT")}
            >
              Demo Student
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => fillDemoAccount("WARDEN")}
            >
              Demo Warden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
