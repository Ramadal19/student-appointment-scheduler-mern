import { useState } from "react";
import { Link } from "react-router-dom";
import forgotImg from "../assets/forg-bg.png";
import { API_BASE } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setResetUrl("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Request failed.");
        return;
      }

      setMsg(data?.message || "Reset link generated successfully.");

      if (data?.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand" aria-label="Institutional branding">
        <div className="brand-top">
          <div className="brand-logo" aria-hidden="true">
            🎓
          </div>

          <div>
            <h1 className="brand-title">Student Appointment Scheduling System</h1>
            <p className="brand-subtitle">Academic Advising Portal</p>
          </div>
        </div>

        <ul className="brand-points">
          <li>
            <span className="dot" aria-hidden="true" />
            Create your student account
          </li>
          <li>
            <span className="dot" aria-hidden="true" />
            Book advising sessions
          </li>
          <li>
            <span className="dot" aria-hidden="true" />
            Manage upcoming appointments
          </li>
        </ul>

        <div className="brand-footer">
          <small>© {new Date().getFullYear()} Student Services</small>
        </div>

        <div className="brand-image-bottom">
          <img src={forgotImg} alt="Forgot password visual" />
        </div>
      </section>

      <main className="auth-main">
        <div className="auth-card" role="region" aria-label="Forgot password form">
          <header className="auth-header">
            <h2>Forgot Password</h2>
            <p>Enter your email and we will generate a reset link.</p>
          </header>

          {error ? (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          ) : null}

          {msg ? (
            <div className="auth-success" role="status">
              {msg}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !!resetUrl}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {resetUrl ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                window.location.href = resetUrl;
              }}
              disabled={loading}
              style={{ marginTop: 12 }}
            >
              Reset Password Now
            </button>
          ) : null}

          <p className="auth-bottom">
            Back to{" "}
            <Link className="link" to="/login">
              Login
            </Link>
          </p>

          <footer className="auth-legal">
            <Link className="link" to="/support">
              Contact support
            </Link>
            <span className="sep">•</span>
            <Link className="link" to="/privacy">
              Privacy
            </Link>
            <span className="sep">•</span>
            <Link className="link" to="/terms">
              Terms
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}