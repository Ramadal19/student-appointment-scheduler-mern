import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://student-appointment-scheduler-mern.onrender.com";

export default function AdvisorAvailability() {
  const { advisorId } = useParams();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [notes, setNotes] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState("");

  const selectedSlot = useMemo(
    () => slots.find((s) => s._id === selectedSlotId) || null,
    [slots, selectedSlotId]
  );

  useEffect(() => {
    if (!advisorId) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        setMsg("");

        try {
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            credentials: "include",
          });

          if (meRes.ok) {
            const me = await meRes.json();
            const id = me?.user?._id || me?._id || "";
            if (alive && id) setStudentId(id);
          }
        } catch (_) {}

        const resSlots = await fetch(
          `${API_BASE}/api/availability?advisorId=${advisorId}`,
          {
            credentials: "include",
          }
        );

        if (!resSlots.ok) {
          const t = await resSlots.text();
          throw new Error(
            `Failed to load availability. (${resSlots.status}) ${t || ""}`.trim()
          );
        }

        const dataSlots = await resSlots.json();
        const listSlots = Array.isArray(dataSlots)
          ? dataSlots
          : dataSlots.slots || [];
        const availableSlots = listSlots.filter((s) => !s.isBooked);

        if (alive) {
          setSlots(availableSlots);
          setSelectedSlotId(availableSlots[0]?._id || "");
        }

        const resTopics = await fetch(`${API_BASE}/api/topics`, {
          credentials: "include",
        });

        if (resTopics.ok) {
          const dataTopics = await resTopics.json();
          const listTopics = Array.isArray(dataTopics)
            ? dataTopics
            : dataTopics.topics || [];

          if (alive) {
            setTopics(listTopics);
            setSelectedTopicId(listTopics[0]?._id || "");
          }
        } else {
          if (alive) {
            setTopics([]);
            setSelectedTopicId("");
          }
        }
      } catch (e) {
        if (alive) {
          setError(e.message || "Error loading availability.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [advisorId]);

  const handleRequestAppointment = async () => {
    setError("");
    setMsg("");

    if (!studentId) {
      setError("Your session could not be verified. Please sign in again.");
      return;
    }

    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }

    if (!selectedTopicId) {
      setError("Please select a topic.");
      return;
    }

    try {
      setBooking(true);

      const payload = {
        studentId,
        advisorId,
        topicId: selectedTopicId,
        availabilityId: selectedSlot._id,
        notes: notes || "",
      };

      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `Booking failed (${res.status})`);
      }

      setMsg("✅ Appointment created successfully!");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1200);
    } catch (e) {
      setError(e.message || "Booking error.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p>Loading availability...</p>;

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
        ← Back
      </button>

      <h2>Advisor Availability</h2>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            border: "1px solid #f0b4b4",
            background: "#ffecec",
          }}
        >
          {error}
        </div>
      )}

      {msg && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            border: "1px solid #b7e4c7",
            background: "#eafff0",
          }}
        >
          {msg}
        </div>
      )}

      <hr style={{ margin: "16px 0" }} />

      {slots.length === 0 ? (
        <p>No available slots.</p>
      ) : (
        <>
          <p>
            <b>Select a time slot:</b>
          </p>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {slots.map((s) => (
              <li
                key={s._id}
                style={{
                  padding: 10,
                  marginBottom: 10,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="radio"
                    name="slot"
                    checked={selectedSlotId === s._id}
                    onChange={() => setSelectedSlotId(s._id)}
                    disabled={booking}
                  />
                  <span>
                    <b>{new Date(s.startTime).toLocaleString()}</b> →{" "}
                    {new Date(s.endTime).toLocaleString()}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 10 }}>
            <p>
              <b>Select a topic:</b>
            </p>

            {topics.length === 0 ? (
              <p style={{ opacity: 0.8 }}>
                No topics loaded.
              </p>
            ) : (
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                style={{ padding: 8, minWidth: 260 }}
                disabled={booking}
              >
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <p>
              <b>Notes (optional):</b>
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ width: "100%", maxWidth: 520, padding: 8 }}
              placeholder="Add any extra details for the advisor..."
              disabled={booking}
            />
          </div>

          <button
            onClick={handleRequestAppointment}
            disabled={booking}
            style={{ marginTop: 14, padding: "10px 14px" }}
          >
            {booking ? "Booking..." : "Request Appointment"}
          </button>
        </>
      )}
    </div>
  );
}