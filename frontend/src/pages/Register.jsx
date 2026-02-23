import { useState } from "react";
import registerImg from "../assets/reg-bg.png";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState("");

  // ✅ Cambia esto según tu env (local / prod)
  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://student-appointment-scheduler-mern.onrender.com";

  const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validación SOLO al enviar (botón siempre activo)
    if (!name.trim()) return setError("Please enter your name.");
    if (name.trim().length < 2) return setError("Name must be at least 2 characters.");

    if (!email.trim()) return setError("Please enter your email.");
    if (!emailOk(email)) return setError("Please enter a valid email address.");

    if (!password.trim()) return setError("Please enter a password.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    if (!confirmPassword.trim()) return setError("Please confirm your password.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    try {
      setLoadingEmail(true);

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.code === "EMAIL_EXISTS" || res.status === 409) {
          throw new Error("This email is already registered. Try signing in.");
        }
        throw new Error(data?.message || "Registration failed.");
      }

      // ✅ Si registró ok
      window.location.href = "/dashboard";
      // Alternativa:
      // window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left: Institutional brand panel (mismo look que Login) */}
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
            <img src={registerImg} alt="Register visual" />
        </div>

      </section>

      {/* Right: Register card */}
      <main className="auth-main">
        <div className="auth-card" role="region" aria-label="Create account form">
          <header className="auth-header">
            <h2>Create account</h2>
            <p>Start scheduling your advising sessions</p>
          </header>

          {error ? (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          ) : null}

          {/* ✅ Quitamos GitHub en Register */}
          {/* <button className="btn btn-github">...</button>
              <div className="divider"><span>or</span></div> */}

          <form onSubmit={handleEmailRegister} className="auth-form">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loadingEmail}
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingEmail}
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loadingEmail}
                />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loadingEmail}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Confirm password</span>
              <div className="password-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loadingEmail}
                />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setShowConfirm((v) => !v)}
                  disabled={loadingEmail}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {/* ✅ Botón siempre activo (solo se desactiva mientras carga) */}
            <button type="submit" className="btn btn-primary" disabled={loadingEmail}>
              {loadingEmail ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="auth-bottom">
            Already have an account? <a className="link" href="/login">Sign in</a>
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