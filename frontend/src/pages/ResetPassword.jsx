import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const API = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Reset failed.");
        return;
      }

      // ✅ Éxito con mensaje claro
      setMsg("Password updated successfully! Redirecting to Login...");
      setCountdown(5); // ⏳ ahora 5 segundos

    } catch (err) {
      console.error(err);
      setMsg("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Reset Password</h2>
      <p>Enter a new password for your account.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, cursor: "pointer" }}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      {countdown !== null && (
        <p style={{ marginTop: 8 }}>
          Redirecting to Login in {countdown}...
        </p>
      )}

      <p style={{ marginTop: 16 }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}