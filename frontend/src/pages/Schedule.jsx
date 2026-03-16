import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://student-appointment-scheduler-mern.onrender.com";

export default function Schedule() {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");

        const res = await fetch(`${API_BASE}/api/advisors`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load advisors.");
        }

        const data = await res.json();
        if (alive) {
          setAdvisors(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (alive) {
          setAdvisors([]);
          setError(err.message || "Could not load advisors.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <p>Loading advisors...</p>;

  return (
    <div>
      <h2>Request an Appointment</h2>

      {error ? <p>{error}</p> : null}

      {!error && advisors.length === 0 ? (
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