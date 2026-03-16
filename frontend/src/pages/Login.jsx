import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import loginImg from "../assets/login-bg.png";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://student-appointment-scheduler-mern.onrender.com";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [error, setError] = useState("");

  const handleGitHub = () => {
    setError("");
    setLoadingGitHub(true);
    window.location.href = `${API_BASE}/auth/github`;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoadingEmail(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, remember }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (data?.code === "USER_NOT_FOUND" || res.status === 404) {
          throw new Error("No account found for this email. Please create one.");
        }

        if (data?.code === "BAD_PASSWORD" || res.status === 401) {
          throw new Error("Incorrect password. Please try again.");
        }

        throw new Error(data?.message || "Login failed.");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoadingEmail(false);
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
            Book appointments fast
          </li>
          <li>
            <span className="dot" aria-hidden="true" />
            See availability in real time
          </li>
          <li>
            <span className="dot" aria-hidden="true" />
            Manage upcoming sessions
          </li>
        </ul>

        <div className="brand-footer">
          <small>© {new Date().getFullYear()} Student Services</small>
        </div>

        <div className="brand-image-bottom">
          <img src={loginImg} alt="Login visual" />
        </div>
      </section>

      <main className="auth-main">
        <div className="auth-card" role="region" aria-label="Sign in form">
          <header className="auth-header">
            <h2>Sign in</h2>
            <p>Access your advising dashboard</p>
          </header>

          {error ? (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            className="btn btn-github"
            onClick={handleGitHub}
            disabled={loadingGitHub || loadingEmail}
          >
            {loadingGitHub ? "Redirecting to GitHub..." : "Continue with GitHub"}
          </button>

          <div className="divider" role="separator" aria-label="or divider">
            <span>or</span>
          </div>

          <form onSubmit={handleEmailLogin} className="auth-form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingEmail || loadingGitHub}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loadingEmail || loadingGitHub}
                />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loadingEmail || loadingGitHub}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="row">
              <label className="check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loadingEmail || loadingGitHub}
                />
                Remember me
              </label>

              <Link className="link" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingEmail || loadingGitHub}
            >
              {loadingEmail ? "Signing in..." : "Sign in with Email"}
            </button>
          </form>

          <p className="auth-bottom">
            Don&apos;t have an account?{" "}
            <Link className="link" to="/register">
              Create one
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