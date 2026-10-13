import React, { createContext, useContext, useState, useEffect } from "react";
import { API_ENDPOINTS } from "../apiConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("hostel_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [backendHealth, setBackendHealth] = useState("CHECKING"); // UP, DOWN, CHECKING

  // Check backend health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.HEALTH);
        if (res.ok) {
          setBackendHealth("UP");
        } else {
          setBackendHealth("DOWN");
        }
      } catch {
        setBackendHealth("DOWN");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("hostel_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hostel_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, backendHealth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
