import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await apiFetch("/auth/me");
        const ok =
          data.loggedIn === true || data.authenticated === true;

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

  if (checking) {
    return <div style={{ padding: 24 }}>Checking session...</div>;
  }

  return allowed ? children : <Navigate to="/login" replace />;
}