import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DeleteAppointmentModal from "../components/appointments/DeleteAppointmentModal";
import RequestAppointment from "./RequestAppointment";
import "../styles/Dashboard.css";
import Settings from "../pages/Settings";
import { API_BASE, apiFetch } from "../api";

function formatDateRange(start, end) {
  if (!start) return "No date";

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  const startText = startDate.toLocaleDateString([], {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const startTimeText = startDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTimeText = endDate
    ? endDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return endTimeText
    ? `${startText}, ${startTimeText} - ${endTimeText}`
    : `${startText}, ${startTimeText}`;
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

function formatUpcomingDate(start, end) {
  if (!start) return "No date";

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const now = new Date();

  const isToday = startDate.toDateString() === now.toDateString();

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = startDate.toDateString() === tomorrow.toDateString();

  const dayLabel = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : startDate.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  const startTimeText = startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTimeText = endDate
    ? endDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return endTimeText
    ? `${dayLabel} • ${startTimeText} - ${endTimeText}`
    : `${dayLabel} • ${startTimeText}`;
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  useEffect(() => {
   let alive = true;

    (async () => {
      try {
        const data = await apiFetch("/auth/me");
        const u = data.user || data.currentUser || null;

        if (!alive) return;

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
      } catch (err) {
        if (!alive) return;

        setUser(null);
        setSessionOk(false);
        setStatus("❌ Not logged in");
        navigate("/login", { replace: true });
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);

      const data = await apiFetch("/api/appointments/my");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (!sessionOk) return;
    loadAppointments();
  }, [sessionOk]);

  useEffect(() => {
    if (active !== "Dashboard") {
      setDeleteModalOpen(false);
      setAppointmentToDelete(null);
      setDeleteLoadingId(null);
    }
  }, [active]);

  useEffect(() => {
    if (sessionOk && active === "Dashboard") {
      loadAppointments();
    }
  }, [active, sessionOk]);

  const normalizedAppointments = useMemo(() => {
    return appointments.map((a) => {
      const id = a._id || a.id || "";

      const startTime =
        a.startTime ||
        a.availabilityId?.startTime ||
        a.availability?.startTime ||
        null;

      const endTime =
        a.endTime ||
        a.availabilityId?.endTime ||
        a.availability?.endTime ||
        null;

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
    return normalizedAppointments
      .filter((a) => a.startTime && a.status === "confirmed")
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 2);
  }, [normalizedAppointments]);

  const openDeleteModal = (appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoadingId) return;
    setDeleteModalOpen(false);
    setAppointmentToDelete(null);
  };

  const handleDelete = async () => {
    if (!appointmentToDelete?.id) return;

    try {
      setDeleteLoadingId(appointmentToDelete.id);

      const res = await fetch(
        `${API_BASE}/api/appointments/${appointmentToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "Failed to delete appointment"
        );
      }

      setAppointments((prev) =>
        prev.filter((a) => (a._id || a.id) !== appointmentToDelete.id)
      );

      setDeleteModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err) {
      alert(err.message || "Could not delete appointment");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const onLogout = async () => {
    try {
      await apiFetch("/auth/logout", {
       method: "POST",
      });
    } catch (e) {
      // Even if remote logout fails, still clear the local UI state
    } finally {
      setUser(null);
      setAppointments([]);
      setSessionOk(false);
      setStatus("Logged out");
      navigate("/", { replace: true });
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
                confirmed
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
                <div className="statTitle">confirmed</div>
                <div className="statSub">Scheduled meetings</div>
                <div className="statValue">{confirmed}</div>
                <div className="statFoot">Ready to attend</div>
              </div>
            </div>

            <h2 className="sectionTitle">Upcoming Appointments</h2>
            <div className="upcomingGrid">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((a) => (
                  <div key={a.id} className="upcomingCard">
                    <div className="upcomingCardTop">
                      <span className="upcomingBadge">confirmed</span>
                    </div>

                    <h3 className="upcomingTopic">{a.topic}</h3>

                    <p className="upcomingAdvisor">Advisor: {a.advisor}</p>

                    <p className="upcomingDate">
                      {formatUpcomingDate(a.startTime, a.endTime)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="tableCard">
                  <div className="empty">No upcoming appointments scheduled.</div>
                </div>
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
                          onClick={() => openDeleteModal(a)}
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

            <DeleteAppointmentModal
              open={deleteModalOpen}
              onClose={closeDeleteModal}
              onConfirm={handleDelete}
              loading={deleteLoadingId === appointmentToDelete?.id}
              appointment={appointmentToDelete}
            />
          </div>
        )}

        {active === "Request Appointment" && (
          <div className="pageCard">
            <RequestAppointment sessionOk={sessionOk}
              user={user}
              onAppointmentCreated={async () => {
                await loadAppointments();
                setActive("Dashboard");
              }}
            />
          </div>
        )}

        {active === "Settings" && <Settings />}
      </main>
    </div>
  );
}