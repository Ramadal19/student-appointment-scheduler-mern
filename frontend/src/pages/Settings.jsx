import { useEffect, useState } from "react";
import { API_BASE, apiFetch } from "../api";
import "../styles/settings.css";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingUser(true);

        const data = await apiFetch("/auth/me");

        if (alive) {
          setUser(data.user || null);
        }
      } catch {
        if (alive) {
          setUser(null);
        }
      } finally {
        if (alive) {
          setLoadingUser(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const isGithubUser = user?.provider === "github";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/api/users/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update password.");
      }

      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-page">
      <div className="settings-hero">
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Manage your account security and update your password.
          </p>
        </div>
      </div>

      <div className="settings-panel">
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Change Password</h2>
            <p>
              Keep your account secure by using a strong password that only you
              know.
            </p>
          </div>

          {loadingUser ? (
            <div className="settings-info">Loading account settings...</div>
          ) : user && isGithubUser ? (
            <div className="settings-info settings-info-github">
              This account signs in with GitHub.
              <br />
              Password changes must be managed directly from your GitHub
              account.
            </div>
          ) : (
            <>
              {error ? <div className="settings-alert error">{error}</div> : null}
              {success ? (
                <div className="settings-alert success">{success}</div>
              ) : null}

              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="settings-field">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={saving}
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </div>

                <div className="settings-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}