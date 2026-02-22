import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import "../styles/auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

export default function Register({ onRegistered }) {
  const [form, setForm] = useState({
    name: "Danny",
    email: "danny+test@test.com",
    password: "123456",
    confirmPassword: ""
  });

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const score = useMemo(() => passwordScore(form.password), [form.password]);

  const errors = useMemo(() => {
    const e = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) e.name = "Name is required.";
    else if (name.length < 2) e.name = "Name must be at least 2 characters.";

    if (!email) e.email = "Email is required.";
    else if (!emailRegex.test(email)) e.email = "Please enter a valid email.";

    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    else if (form.password.length < 8 || score < 2)
      e.password = "Use 8+ chars and add at least 2 of: uppercase, number, symbol.";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match.";

    return e;
  }, [form, score]);

  const isValid = Object.keys(errors).length === 0;

  function setField(name, value) {
    setMsg("");
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!isValid) return;

    setLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        })
      });

      setMsg(`✅ Registered: ${data.user.email}`);
      onRegistered?.(data.user);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const strengthLabel =
    score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";

  return (
    <div className="auth-bg">
      <div className="auth-shell">
        <div className="auth-side">
          <div className="brand">
            <div className="brand-badge">SAS</div>
            <div>
              <h1>Student Appointment Scheduler</h1>
              <p>Create your account to book advising sessions easily.</p>
            </div>
          </div>

          <ul className="auth-bullets">
            <li>✅ Fast registration</li>
            <li>🔒 Secure access</li>
            <li>📅 Book appointments</li>
          </ul>
        </div>

        <div className="auth-card">
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                className={`input ${touched.name && errors.name ? "input-error" : ""}`}
                id="name"
                name="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                onBlur={onBlur}
                placeholder="Your name"
                autoComplete="name"
              />
              {touched.name && errors.name && <div className="error">{errors.name}</div>}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                className={`input ${touched.email && errors.email ? "input-error" : ""}`}
                id="email"
                name="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={onBlur}
                placeholder="email@example.com"
                autoComplete="email"
              />
              {touched.email && errors.email && <div className="error">{errors.email}</div>}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                className={`input ${touched.password && errors.password ? "input-error" : ""}`}
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                onBlur={onBlur}
                placeholder="8+ characters recommended"
                autoComplete="new-password"
              />

              <div className="pw-meter">
                <div className={`pw-bar s${score}`} />
                <span>{strengthLabel}</span>
              </div>

              {touched.password && errors.password && <div className="error">{errors.password}</div>}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                className={`input ${
                  touched.confirmPassword && errors.confirmPassword ? "input-error" : ""
                }`}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                onBlur={onBlur}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="error">{errors.confirmPassword}</div>
              )}
            </div>

            <button className="btn" type="submit" disabled={loading || !isValid}>
              {loading ? "Creating..." : "Create account"}
            </button>

            {msg && <div className={`toast ${msg.startsWith("✅") ? "ok" : "bad"}`}>{msg}</div>}
          </form>

          <div className="auth-footer">
            <span>By creating an account, you agree to our basic terms.</span>
          </div>
        </div>
      </div>
    </div>
  );
}