import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setResetUrl("");

    if (!API) {
      setMsg("Missing REACT_APP_API_URL in frontend environment variables.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.message || "Request failed.");
        return;
      }

      setMsg(data.message || "If an account exists, a reset link was generated.");

      // Para modo básico (testing): si backend devuelve resetUrl, lo mostramos
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
        console.log("RESET URL:", data.resetUrl);
      }
    } catch (err) {
      console.error("FORGOT PASSWORD ERROR:", err);
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Forgot Password</h2>
      <p>Enter your email and we will generate a reset link.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, cursor: "pointer" }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      {/* Solo para pruebas en modo básico */}
      {resetUrl && (
        <div style={{ marginTop: 12 }}>
          <p style={{ marginBottom: 6 }}>
            <strong>Testing reset link:</strong>
          </p>
          <a href={resetUrl}>{resetUrl}</a>
        </div>
      )}

      <p style={{ marginTop: 16 }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}