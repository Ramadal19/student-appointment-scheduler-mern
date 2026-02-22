import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://student-appointment-scheduler-mern.onrender.com";

export default function DashboardV2() {
  const navigate = useNavigate();

  const [active, setActive] = useState("Dashboard");
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("Checking session...");
  const [user, setUser] = useState(null);
  const [sessionOk, setSessionOk] = useState(false); // ✅ nuevo

  // ✅ Verificar sesión + traer usuario (y si no, sacar a login)
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error("Not logged in");
        return data;
      })
      .then((data) => {
        const u = data.user || data.currentUser || null;
        setUser(u);
        setSessionOk(true);

        const label =
          u?.name
            ? `${u.name}${u.email ? ` (${u.email})` : ""}`
            : u?.email
            ? u.email
            : data.loggedIn
            ? "Yes"
            : "Unknown";

        setStatus(`✅ Welcome, ${label}`);
      })
      .catch(() => {
        setUser(null);
        setSessionOk(false);
        setStatus("❌ Not logged in");
        // ✅ clave: evita que el usuario vuelva con la flecha atrás
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  // ✅ Cargar appointments SOLO si hay sesión
  useEffect(() => {
    if (!sessionOk) return;

    fetch(`${API_BASE}/api/appointments`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]));
  }, [sessionOk]);

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

  // 🔐 Logout (con replace)
  const onLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // aunque falle, igual sacamos al user
    } finally {
      setUser(null);
      setAppointments([]);
      setSessionOk(false);
      navigate("/login", { replace: true }); // ✅ clave
    }
  };

  return (
    <div className="layout">
      <Sidebar
        active={active}
        setActive={setActive}
        onLogout={onLogout}
        profileName={user?.name || "Student"}
        profileSub={user?.email || "Session Mode"}
      />

      <main className="content">
        <div className="pageCard">
          <h1>Student Appointment Dashboard</h1>

          <p className="subtitle">{status}</p>

          <div className="searchRow">
            <span className="searchIcon">🔎</span>
            <input
              className="searchInput"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              disabled={!sessionOk}
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