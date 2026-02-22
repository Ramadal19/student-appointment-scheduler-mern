import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!API) {
      setMsg("Missing REACT_APP_API_URL in frontend environment variables.");
      return;
    }

    if (!token) {
      setMsg("Missing reset token in URL.");
      return;
    }

    // Ya dijiste que tienes esta validación, igual la dejo aquí también:
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.message || "Reset failed.");
        return;
      }

      setMsg(data.message || "Password updated successfully!");

      // Redirige al login
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      <p style={{ marginTop: 16 }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}