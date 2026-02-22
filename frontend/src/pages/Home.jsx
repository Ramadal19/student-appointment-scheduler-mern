import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/hero-bg.png";
import "../styles/home.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_BASE}/api/health`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API ERROR:", err));
  }, [API_BASE]);

  return (
    <div
      className="hero"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="overlay">
        <div className="content">
          <h1>Student Appointment Scheduler</h1>

          <p>
            Book academic advising appointments easily and manage your
            schedule in one place.
          </p>

          {message && <p className="health">{message}</p>}

          <div className="buttons">
            <button
              className="btn primary"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="btn secondary"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}