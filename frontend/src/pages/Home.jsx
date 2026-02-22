import React from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/hero-bg.png";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="hero"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="overlay">
        <div className="content">
          <h1>
            Student Appointment <br />
            Scheduler
          </h1>

          <p>
            Book academic advising appointments easily and manage your
            schedule in one place.
          </p>

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