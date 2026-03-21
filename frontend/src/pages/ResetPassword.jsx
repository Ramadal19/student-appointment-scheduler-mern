import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import resetImg from "../assets/reset-bg.png";
import { API_BASE } from "../api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token = "" } = useParams();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!password.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!token) {
      setError("Missing reset token.");
      return;
    }

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
      setCountdown(7);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      navigate("/login", { replace: true });
      return;
    }

    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

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
          <img src={resetImg} alt="Reset password visual" />
        </div>
      </section>

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