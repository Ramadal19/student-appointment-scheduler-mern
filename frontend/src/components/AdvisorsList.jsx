import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdvisorsList() {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/advisors`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load advisors");
        setAdvisors(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return advisors;
    return advisors.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(s) ||
        (a.email || "").toLowerCase().includes(s)
    );
  }, [advisors, q]);

  if (loading) return <p>Loading advisors...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900 }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search advisor..."
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #e6e9ef",
          marginBottom: 16,
        }}
      />

      {filtered.length === 0 ? (
        <p>No advisors found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {filtered.map((a) => (
            <div
              key={a._id}
              style={{
                background: "#fff",
                border: "1px solid #e6e9ef",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 800 }}>{a.name || "Advisor"}</div>
              <div style={{ opacity: 0.75 }}>{a.email}</div>

              <button
                onClick={() => navigate(`/schedule/${a._id}`)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: "#1f5cff",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                View availability
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}