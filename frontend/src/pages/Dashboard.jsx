import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import RequestAppointment from "./RequestAppointment";
import "../styles/Dashboard.css";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

function formatDateRange(start, end) {
  if (!start) return "No date";

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  const startText = startDate.toLocaleString();
  const endText = endDate
    ? endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return endText ? `${startText} - ${endText}` : startText;
}

function getAdvisorName(appointment) {
  return (
    appointment.advisorId?.name ||
    appointment.advisor?.name ||
    appointment.availabilityId?.advisorId?.name ||
    appointment.availability?.advisor?.name ||
    appointment.advisorName ||
    "No advisor"
  );
}

function getTopicLabel(appointment) {
  return (
    appointment.topicId?.title ||
    appointment.topicId?.name ||
    appointment.topic?.title ||
    appointment.topic?.name ||
    "No topic"
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [active, setActive] = useState("Dashboard");
  const [appointments, setAppointments] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");

  const [status, setStatus] = useState("Checking session...");
  const [user, setUser] = useState(null);
  const [sessionOk, setSessionOk] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

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

        const label = u?.name
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
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  useEffect(() => {
    if (!sessionOk) return;

    setLoadingAppointments(true);

    fetch(`${API_BASE}/api/appointments/my`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      })
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoadingAppointments(false));
  }, [sessionOk]);

  const normalizedAppointments = useMemo(() => {
    return appointments.map((a) => {
      const id = a._id || a.id || "";
      const startTime = a.startTime || a.availabilityId?.startTime || a.availability?.startTime || null;
      const endTime = a.endTime || a.availabilityId?.endTime || a.availability?.endTime || null;
      const advisor = getAdvisorName(a);
      const topic = getTopicLabel(a);
      const status = String(a.status || "confirmed").toLowerCase();

      return {
        raw: a,
        id,
        startTime,
        endTime,
        advisor,
        topic,
        status,
        dateLabel: formatDateRange(startTime, endTime),
      };
    });
  }, [appointments]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return normalizedAppointments;

    return normalizedAppointments.filter(
      (a) => a.status === statusFilter
    );
  }, [normalizedAppointments, statusFilter]);

  const total = normalizedAppointments.length;
  const confirmed = normalizedAppointments.filter(
    (a) => a.status === "confirmed"
  ).length;

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return [...normalizedAppointments]
      .filter((a) => a.startTime && new Date(a.startTime) >= now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);
  }, [normalizedAppointments]);

  const handleDelete = async (appointmentId) => {
  const ok = window.confirm(
    "Are you sure you want to delete this appointment?"
  );
  if (!ok) return;

  try {
    setDeleteLoadingId(appointmentId);

    const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.error || data.message || "Failed to delete appointment"
      );
    }

    setAppointments((prev) =>
      prev.filter((a) => (a._id || a.id) !== appointmentId)
    );
  } catch (err) {
    alert(err.message || "Could not delete appointment");
  } finally {
    setDeleteLoadingId(null);
  }
};

  const onLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // aunque falle logout remoto, igual limpiamos UI
    } finally {
      setUser(null);
      setAppointments([]);
      setSessionOk(false);
      navigate("/login", { replace: true });
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
        {active === "Dashboard" && (
          <div className="pageCard">
            <h1>Student Appointment Dashboard</h1>
            <p className="subtitle">{status}</p>

            <div className="filterRow">
              <button
                className={statusFilter === "all" ? "filterBtn active" : "filterBtn"}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                className={statusFilter === "confirmed" ? "filterBtn active" : "filterBtn"}
                onClick={() => setStatusFilter("confirmed")}
              >
                Confirmed
              </button>
            </div>

            <div className="cards">
              <div className="statCard purple">
                <div className="statTitle">Total Appointments</div>
                <div className="statSub">All records</div>
                <div className="statValue">{total}</div>
                <div className="statFoot">Loaded from your account</div>
              </div>

              <div className="statCard teal">
                <div className="statTitle">Confirmed</div>
                <div className="statSub">Scheduled meetings</div>
                <div className="statValue">{confirmed}</div>
                <div className="statFoot">Ready to attend</div>
              </div>
            </div>

            <h2 className="sectionTitle">Upcoming Appointments</h2>
            <div className="tableCard" style={{ marginBottom: "20px" }}>
              {upcomingAppointments.length > 0 ? (
                <ul className="upcomingList">
                  {upcomingAppointments.map((a) => (
                    <li key={a.id} className="upcomingItem">
                      <strong>{a.topic}</strong> with {a.advisor}
                      <br />
                      <span>{a.dateLabel}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty">No upcoming appointments.</div>
              )}
            </div>

            <h2 className="sectionTitle">Appointments Table</h2>

            <div className="tableCard">
              <div className="tableTop">
                <div className="itemsCount">
                  {loadingAppointments ? "Loading..." : `${filtered.length} items`}
                </div>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "120px" }}>ID</th>
                    <th style={{ width: "240px" }}>Date</th>
                    <th>Advisor</th>
                    <th>Topic</th>
                    <th>Status</th>
                    <th style={{ width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id ? a.id.slice(-6) : "N/A"}</td>
                      <td>{a.dateLabel}</td>
                      <td>{a.advisor}</td>
                      <td>{a.topic}</td>
                      <td>
                        <span className={`pill ${a.status}`}>{a.status}</span>
                      </td>
                      <td>
                        <button
                          className="deleteBtn"
                          onClick={() => handleDelete(a.id)}
                          disabled={deleteLoadingId === a.id}
                        >
                          {deleteLoadingId === a.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loadingAppointments && filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty">
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "Request Appointment" && (
          <div className="pageCard">
            <RequestAppointment />
          </div>
        )}

        {active === "Settings" && (
          <div className="pageCard">
            <h1>Settings</h1>
            <p className="subtitle">Settings section coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}