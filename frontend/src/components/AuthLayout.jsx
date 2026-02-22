import React from "react";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={styles.page}>
      {/* LEFT BLUE PANEL */}
      <div style={styles.left}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>🎓</div>
          <div>
            <h1 style={styles.brandTitle}>Student Appointment Scheduling System</h1>
            <div style={styles.brandSubtitle}>Academic Advising Portal</div>
          </div>
        </div>

        <ul style={styles.bullets}>
          <li style={styles.bullet}>Create your student account</li>
          <li style={styles.bullet}>Book advising sessions</li>
          <li style={styles.bullet}>Manage upcoming appointments</li>
        </ul>

        <div style={styles.footer}>© 2026 Student Services</div>
      </div>

      {/* RIGHT WHITE CARD */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>{title}</h2>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "100vh",
    background: "#f4f7ff",
  },
  left: {
    padding: "48px 42px",
    color: "white",
    background:
      "linear-gradient(180deg, #0b2b5b 0%, #0a3a7a 55%, #082e63 100%)",
    position: "relative",
  },
  brandRow: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    marginBottom: 26,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "rgba(255,255,255,0.14)",
    display: "grid",
    placeItems: "center",
    fontSize: 18,
  },
  brandTitle: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 800,
  },
  brandSubtitle: {
    marginTop: 6,
    opacity: 0.9,
    fontSize: 14,
  },
  bullets: {
    marginTop: 28,
    paddingLeft: 20,
    lineHeight: 1.9,
    opacity: 0.95,
    fontSize: 15,
  },
  bullet: { marginBottom: 6 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 42,
    opacity: 0.85,
    fontSize: 12,
  },
  right: {
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "white",
    borderRadius: 16,
    boxShadow: "0 18px 50px rgba(10,30,70,0.10)",
    padding: 28,
    border: "1px solid rgba(10,30,70,0.06)",
  },
  title: { margin: 0, fontSize: 28, fontWeight: 800, color: "#0b1b3a" },
  subtitle: { marginTop: 8, color: "#51607a", fontSize: 14 },
};