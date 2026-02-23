import { useEffect, useState } from "react";
import resetImg from "../assets/reset-bg.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);

  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://student-appointment-scheduler-mern.onrender.com";

  // token viene del URL: /reset-password/:token
  const token = window.location.pathname.split("/reset-password/")[1] || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!password.trim()) return setError("Please enter a new password.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    if (!token) return setError("Missing reset token.");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Reset failed.");
        return;
      }

      setMsg("Password updated successfully! Redirecting to Login...");
      setCountdown(7); // ✅ más tiempo (7 segundos)

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      window.location.href = "/login";
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
        <div className="brand-image-bottom">
            <img src={resetImg} alt="Reset password visual" />
        </div>
      </section>

      {/* Right card */}
      <main className="auth-main">
        <div className="auth-card" role="region" aria-label="Reset password form">
          <header className="auth-header">
            <h2>Reset Password</h2>
            <p>Enter a new password for your account.</p>
          </header>

          {error ? (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          ) : null}

          {msg ? (
            <div className="auth-success" role="status">
              {msg}
              {countdown !== null ? (
                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  Redirecting to Login in {countdown}...
                </div>
              ) : null}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>New Password</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

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