import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register"; // ✅ NUEVO
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/auth.css";

function Home() {
  const [message, setMessage] = useState("");

  const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

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

      <div style={{ marginTop: 20, display: "flex", gap: 16, justifyContent: "center" }}>
        <Link to="/login">Go to Login</Link>
        <Link to="/register">Create account</Link> {/* ✅ NUEVO */}
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

        {/* ✅ NUEVO */}
        <Route path="/register" element={<Register />} />

        {/* ✅ PROTEGIDO */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* opcional: cualquier ruta desconocida vuelve a Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}