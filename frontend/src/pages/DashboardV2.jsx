import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function DashboardV2() {
  const [active, setActive] = useState("Dashboard");
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("Checking session...");
  const [user, setUser] = useState(null);

  // ✅ Verificar sesión + traer usuario
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error("Not logged in");
        return data;
      })
      .then((data) => {
        // Soporta varias formas de respuesta
        const u = data.user || data.currentUser || null;
        setUser(u);

        const label =
          u?.name
            ? `${u.name}${u.email ? ` (${u.email})` : ""}`
            : u?.email
              ? u.email
              : (data.loggedIn ? "Yes" : "Unknown");

        setStatus(`✅ Welcome, ${label}`);
      })
      .catch(() => {
        setUser(null);
        setStatus("❌ Not logged in");
      });
  }, []);

  // ✅ Cargar appointments
  useEffect(() => {
    fetch(`${API_BASE}/api/appointments`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]));
  }, []);

  // 🔍 Filtrado
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;

    return appointments.filter((a) => {
      const id = String(a.id ?? a._id ?? "").toLowerCase();
      const date = String(a.date ?? a.startTime ?? "").toLowerCase();
      const st = String(a.status ?? "").toLowerCase();
      return id.includes(q) || date.includes(q) || st.includes(q);
    });
  }, [appointments, search]);

  const total = filtered.length;
  const confirmed = filtered.filter(
    (a) => String(a.status).toLowerCase() === "confirmed"
  ).length;
  const pending = filtered.filter(
    (a) => String(a.status).toLowerCase() === "pending"
  ).length;

  // 🔐 Logout real
  const onLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  return (
    <div className="layout">
      <Sidebar
        active={active}
        setActive={setActive}
        onLogout={onLogout}
        // ✅ NUEVO: datos reales del usuario
        profileName={user?.name || "Student"}
        profileSub={user?.email || "Session Mode"}
      />

      <main className="content">
        <div className="pageCard">
          <h1>Student Appointment Dashboard</h1>

          {/* ✅ Aquí se ve claramente el usuario */}
          <p className="subtitle">
            {status}
          </p>

          <div className="searchRow">
            <span className="searchIcon">🔎</span>
            <input
              className="searchInput"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <div className="cards">
            <div className="statCard purple">
              <div className="statTitle">Total Appointments</div>
              <div className="statSub">All</div>
              <div className="statValue">{total}</div>
              <div className="statFoot">Updated just now</div>
            </div>

            <div className="statCard teal">
              <div className="statTitle">Confirmed</div>
              <div className="statSub">OK</div>
              <div className="statValue">{confirmed}</div>
              <div className="statFoot">Ready to attend</div>
            </div>

            <div className="statCard yellow">
              <div className="statTitle">Pending</div>
              <div className="statSub">Wait</div>
              <div className="statValue">{pending}</div>
              <div className="statFoot">Needs confirmation</div>
            </div>
          </div>

          <h2 className="sectionTitle">Upcoming Appointments</h2>

          <div className="tableCard">
            <div className="tableTop">
              <div className="itemsCount">{filtered.length} items</div>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>ID</th>
                  <th style={{ width: "220px" }}>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const st = String(a.status || "").toLowerCase();
                  const id = a.id ?? a._id ?? "";
                  const date = a.date ?? a.startTime ?? "";
                  return (
                    <tr key={id || `${date}-${st}`}>
                      <td>{id}</td>
                      <td>{date}</td>
                      <td>
                        <span className={`pill ${st}`}>{st || "unknown"}</span>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="3" className="empty">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}