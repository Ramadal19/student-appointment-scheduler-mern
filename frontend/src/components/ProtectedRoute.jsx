import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        // ✅ Tu backend parece devolver { loggedIn: true/false }
        const ok = res.ok && (data.loggedIn === true || data.authenticated === true);

        if (alive) setAllowed(ok);
      } catch (e) {
        if (alive) setAllowed(false);
      } finally {
        if (alive) setChecking(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (checking) return <div style={{ padding: 24 }}>Checking session...</div>;

  return allowed ? children : <Navigate to="/login" replace />;
}