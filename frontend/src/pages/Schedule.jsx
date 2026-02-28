import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Schedule() {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://student-appointment-scheduler-mern.onrender.com";

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/api/advisors`, {
        credentials: "include",
      });
      const data = await res.json();
      setAdvisors(data); // tu backend devuelve array directo
      setLoading(false);
    })();
  }, [API_BASE]);

  if (loading) return <p>Loading advisors...</p>;

  return (
    <div>
      <h2>Request an Appointment</h2>

      {advisors.length === 0 ? (
        <p>No advisors available.</p>
      ) : (
        <ul>
          {advisors.map((a) => (
            <li key={a._id} style={{ marginBottom: 10 }}>
              <b>{a.name}</b> — {a.email}{" "}
              <button onClick={() => navigate(`/schedule/${a._id}`)}>
                View availability
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}