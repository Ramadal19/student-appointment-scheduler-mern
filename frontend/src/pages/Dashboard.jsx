import { useEffect, useState } from "react";

export default function Dashboard() {
  const [status, setStatus] = useState("Checking session...");

  const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(JSON.stringify(data));
        return data;
      })
      .then((data) => setStatus(`✅ loggedIn: ${data.loggedIn}`))
      .catch(() => setStatus("❌ Not logged in"));
  }, [API_BASE]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>{status}</p>
    </div>
  );
}