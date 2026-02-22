import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");

  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://student-appointment-scheduler-mern.onrender.com";

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

      // ✅ ya sin “testing mode” si lo cambiaste en backend
      setMsg(data?.message || "Reset link generated successfully.");

      // ✅ modo básico: backend devuelve resetUrl
      if (data?.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
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
      </section>

      {/* Right card */}
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

          {/* ✅ Link enmascarado en botón */}
          {resetUrl ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => (window.location.href = resetUrl)}
              disabled={loading}
              style={{ marginTop: 12 }}
            >
              Reset Password Now
            </button>
          ) : null}

          <p className="auth-bottom">
            Back to <a className="link" href="/login">Login</a>
          </p>

          <footer className="auth-legal">
            <a className="link" href="/support">Contact support</a>
            <span className="sep">•</span>
            <a className="link" href="/privacy">Privacy</a>
            <span className="sep">•</span>
            <a className="link" href="/terms">Terms</a>
          </footer>
        </div>
      </main>
    </div>
  );
}