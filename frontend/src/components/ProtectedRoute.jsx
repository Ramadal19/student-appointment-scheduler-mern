import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  const API_BASE =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false));
  }, [API_BASE]);

  if (allowed === null) return <p style={{ padding: 40 }}>Checking session...</p>;

  if (!allowed) {
    window.location.href = "/login";
    return null;
  }

  return children;
}