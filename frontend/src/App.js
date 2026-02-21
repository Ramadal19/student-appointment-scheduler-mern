import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import "./styles/auth.css";
import Dashboard from "./pages/Dashboard";

function Home() {
  const [message, setMessage] = useState("");

  const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API ERROR:", err));
  }, [API_BASE]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Student Appointment Scheduler</h1>
      <p>{message}</p>

      <div style={{ marginTop: 20 }}>
        <Link to="/login">Go to Login</Link>
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
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}