import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardV2 from "./pages/DashboardV2";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import "./styles/auth.css";

function Home() {
  const [message, setMessage] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_BASE}/api/health`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API ERROR:", err));
  }, [API_BASE]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Student Appointment Scheduler</h1>
      <p>{message}</p>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 16,
          justifyContent: "center",
        }}
      >
        <Link to="/login">Go to Login</Link>
        <Link to="/register">Create account</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardV2 />
            </ProtectedRoute>
          }
        />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}