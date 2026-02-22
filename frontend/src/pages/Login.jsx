import { useState, useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [error, setError] = useState("");

  // ✅ Cambia esto según tu env (local / prod)
  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://student-appointment-scheduler-mern.onrender.com";
    
    useEffect(() => {
        console.log("TEST: calling", `${API_BASE}/api/health`);
        fetch(`${API_BASE}/api/health`)
            .then((res) => {
                 console.log("TEST: status", res.status);
                return res.json();
            })
            .then((data) => console.log("✅ TEST OK:", data))
            .catch((err) => console.error("❌ TEST FAIL:", err));
    }, [API_BASE]);

  const handleGitHub = () => {
    setError("");
    setLoadingGitHub(true);

    // Tu backend debería exponer algo como:
    // GET /auth/github  -> redirect a GitHub
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

      // Tu backend debería exponer algo como:
      // POST /auth/login { email, password, remember }
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // importante si usas cookies/sessions
        body: JSON.stringify({ email, password, remember }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Invalid email or password.");
      }

      // ✅ Si el login fue ok, mandas al dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left: Institutional brand panel */}
      <section className="auth-brand" aria-label="Institutional branding">
        <div className="brand-top">
          <div className="brand-logo" aria-hidden="true">
            {/* Simple icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M8 12h8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
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
      </section>

      {/* Right: Login card */}
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

              <a className="link" href="/forgot-password">
                Forgot password?
              </a>
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
            Don&apos;t have an account? <a className="link" href="/register">Create one</a>
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