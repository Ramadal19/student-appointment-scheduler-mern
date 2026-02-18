import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  // URL dinámica: local o producción
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
    </div>
  );
}

export default App;

