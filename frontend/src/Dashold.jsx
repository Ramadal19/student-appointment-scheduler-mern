import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import "./Dashboard.css";

const API_BASE = "http://localhost:5000";

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/appointments`)
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;

    return appointments.filter((a) => {
      const id = String(a.id ?? "").toLowerCase();
      const date = String(a.date ?? "").toLowerCase();
      const status = String(a.status ?? "").toLowerCase();
      return id.includes(q) || date.includes(q) || status.includes(q);
    });
  }, [appointments, search]);

  const total = filtered.length;
  const confirmed = filtered.filter((a) => String(a.status).toLowerCase() === "confirmed").length;
  const pending = filtered.filter((a) => String(a.status).toLowerCase() === "pending").length;

  const onLogout = () => {
    // For now, just a demo action:
    alert("Logged out!");
  };

  return (
    <div className="layout">
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} />

      <main className="content">
        <div className="pageCard">
          <h1>Student Appointment Dashboard</h1>
          <p className="subtitle">Overview of your appointments (local server)</p>

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
              <div className="statTitle">confirmed</div>
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
                  <th style={{ width: "80px" }}>ID</th>
                  <th style={{ width: "180px" }}>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const st = String(a.status || "").toLowerCase();
                  return (
                    <tr key={a.id ?? `${a.date}-${a.status}`}>
                      <td>{a.id}</td>
                      <td>{a.date}</td>
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