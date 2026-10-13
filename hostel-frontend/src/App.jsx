import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/auth/AuthPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import WardenDashboard from "./pages/warden/WardenDashboard";
import "./index.css";

function AppContent() {
  const { user } = useAuth();

  // If not logged in, render authentication page
  if (!user) {
    return <AuthPage />;
  }

  // Render dashboard based on role
  return (
    <div className="app-container">
      <Navbar />
      {user.role === "WARDEN" ? (
        <WardenDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
