import React from "react";
import { useNavigate } from "react-router-dom";

export default function Confirmation({ appointment }) {
  const navigate = useNavigate();

  if (!appointment) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>No appointment selected</h2>
        <button onClick={() => navigate("/dashboard")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Appointment Confirmed ✅</h2>

      <p><strong>Time:</strong> {appointment.time}</p>
      <p><strong>Topic:</strong> {appointment.topic}</p>

      <button onClick={() => navigate("/dashboard")}>
        Close
      </button>
    </div>
  );
}