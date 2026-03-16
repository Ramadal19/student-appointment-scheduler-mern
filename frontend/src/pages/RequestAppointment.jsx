import React, { useEffect, useMemo, useState } from "react";
import "../styles/requestAppointment.css";
import "../styles/appointmentModal.css";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getDayName(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function getDateLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getTimeLabel(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return `${start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function ConfirmAppointmentModal({
  visible,
  appointment,
  onConfirm,
  onCancel,
  confirming,
}) {
  if (!visible || !appointment) return null;

  return (
    <div className="modalOverlay">
      <div className="appointmentCard">
        <div className="checkPreview">📅</div>

        <h2>Confirm Appointment</h2>

        <div className="appointmentSummary">
          <div className="appointmentTime">{appointment.time}</div>
          <div className="appointmentAdvisor">{appointment.advisor}</div>
          <div className="appointmentDate">{appointment.date}</div>
          <div className="appointmentTopic">Topic: {appointment.topic}</div>
        </div>

        <div className="modalActions">
          <button
            type="button"
            className="cancelBtn"
            onClick={onCancel}
            disabled={confirming}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirmBtn"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? "Confirming..." : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RequestAppointment() {
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [appointmentPreview, setAppointmentPreview] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingAdvisors(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/advisors`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load advisors.");

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.advisors || [];

        console.log("ADVISORS FROM API:", list);
        
        if (alive) setAdvisors(list);
      } catch (err) {
        if (alive) {
          setAdvisors([]);
          setError(err.message || "Could not load advisors.");
        }
      } finally {
        if (alive) setLoadingAdvisors(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingTopics(true);

        const res = await fetch(`${API_BASE}/api/topics`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load topics.");

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.topics || [];

        if (alive) setTopics(list);
      } catch (err) {
        if (alive) {
          setTopics([]);
        }
      } finally {
        if (alive) setLoadingTopics(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    if (!selectedAdvisor) {
      setSlots([]);
      setSelectedSlotId("");
      setSelectedTopicId("");
      setNotes("");
      setConfirmVisible(false);
      setAppointmentPreview(null);
      return;
    }

    (async () => {
      try {
        setLoadingSlots(true);
        setError("");
        setSuccess("");
        setSelectedSlotId("");
        setSelectedTopicId("");
        setNotes("");
        setConfirmVisible(false);
        setAppointmentPreview(null);

        const res = await fetch(
          `${API_BASE}/api/availability?advisorId=${selectedAdvisor}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Failed to load availability.");
        }

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : data.slots || data.availability || [];

        if (alive) setSlots(list);
      } catch (err) {
        if (alive) {
          setSlots([]);
          setError(err.message || "Could not load availability.");
        }
      } finally {
        if (alive) setLoadingSlots(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedAdvisor]);

  const timeRows = useMemo(() => {
    const uniqueLabels = [
      ...new Set(slots.map((slot) => getTimeLabel(slot.startTime, slot.endTime))),
    ];

    uniqueLabels.sort((a, b) => {
      const aStart = a.split(" - ")[0];
      const bStart = b.split(" - ")[0];
      const aDate = new Date(`2000-01-01 ${aStart}`);
      const bDate = new Date(`2000-01-01 ${bStart}`);
      return aDate - bDate;
    });

    return uniqueLabels;
  }, [slots]);

  const slotMap = useMemo(() => {
    const map = {};

    for (const slot of slots) {
      const day = getDayName(slot.startTime);
      const time = getTimeLabel(slot.startTime, slot.endTime);

      if (!map[day]) map[day] = {};
      map[day][time] = slot;
    }

    return map;
  }, [slots]);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot._id === selectedSlotId) || null,
    [slots, selectedSlotId]
  );

  function openConfirmModal() {
  setError("");
  setSuccess("");

  if (!selectedAdvisor || !selectedSlotId || !selectedTopicId) {
    setError("Please select an advisor, a time block, and a topic.");
    return;
  }

  const advisor = advisors.find(
    (a) => String(a._id || a.id) === String(selectedAdvisor)
  );

  const topic = topics.find(
    (t) => String(t._id || t.id) === String(selectedTopicId)
  );

  if (!selectedSlot || !advisor || !topic) {
    console.log("selectedAdvisor:", selectedAdvisor);
    console.log("advisor found:", advisor);
    console.log("all advisors:", advisors);
    console.log("selectedTopicId:", selectedTopicId);
    console.log("topic found:", topic);
    setError("Could not prepare appointment summary.");
    return;
  }

  const advisorName =
    advisor.name ||
    advisor.fullName ||
    advisor.advisorName ||
    advisor.email ||
    "Advisor";

  setAppointmentPreview({
    advisor: advisorName,
    date: getDateLabel(selectedSlot.startTime),
    time: getTimeLabel(selectedSlot.startTime, selectedSlot.endTime),
    topic: topic.title || topic.name || "Topic",
  });

  setConfirmVisible(true);
}

  async function confirmAppointment() {
    setError("");
    setSuccess("");

    if (!selectedAdvisor || !selectedSlotId || !selectedTopicId) {
      setConfirmVisible(false);
      setError("Missing appointment information.");
      return;
    }

    try {
      setBooking(true);

      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          advisorId: selectedAdvisor,
          availabilityId: selectedSlotId,
          topicId: selectedTopicId,
          notes,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to create appointment.");
      }

      setConfirmVisible(false);
      setSuccess("Appointment created successfully.");

      const refreshRes = await fetch(
        `${API_BASE}/api/availability?advisorId=${selectedAdvisor}`,
        { credentials: "include" }
      );

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const refreshedList = Array.isArray(refreshData)
          ? refreshData
          : refreshData.slots || refreshData.availability || [];
        setSlots(refreshedList);
      }

      setSelectedSlotId("");
      setSelectedTopicId("");
      setNotes("");
      setAppointmentPreview(null);
    } catch (err) {
      setConfirmVisible(false);
      setError(err.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  }

  function cancelConfirmation() {
    setConfirmVisible(false);
  }

  return (
    <div className="requestPage">
      <h2>Request Appointment</h2>
      <p className="subtitle">
        Select an advisor and choose a time block from the weekly schedule.
      </p>

      {error ? <div className="auth-alert">{error}</div> : null}
      {success ? <div className="success-alert">{success}</div> : null}

      <div className="field">
        <label htmlFor="advisorSelect">Advisor</label>
        <select
          id="advisorSelect"
          value={selectedAdvisor}
          onChange={(e) => setSelectedAdvisor(e.target.value)}
          disabled={loadingAdvisors || booking}
        >
          <option value="">Select advisor</option>
          {advisors.map((advisor) => (
            <option key={advisor._id} value={advisor._id}>
              {advisor.name} {advisor.email ? `(${advisor.email})` : ""}
            </option>
          ))}
        </select>
      </div>

      {!selectedAdvisor ? (
        <p className="helperText">Please select an advisor first.</p>
      ) : loadingSlots ? (
        <p className="helperText">Loading schedule...</p>
      ) : timeRows.length === 0 ? (
        <p className="helperText">No schedule available for this advisor.</p>
      ) : (
        <div className="scheduleWrap">
          <div className="scheduleHeader">
            <h3>Advisor Weekly Schedule</h3>
            <p>Light Blue = available, Gray = occupied, Dark blue = selected</p>
          </div>

          <div className="scheduleGrid">
            <div className="timeCorner">Time</div>

            {WEEK_DAYS.map((day) => (
              <div key={day} className="dayHeader">
                {day}
              </div>
            ))}

            {timeRows.map((timeLabel) => (
              <React.Fragment key={timeLabel}>
                <div className="timeLabel">{timeLabel}</div>

                {WEEK_DAYS.map((day) => {
                  const slot = slotMap?.[day]?.[timeLabel];
                  const isSelected = selectedSlotId === slot?._id;

                  if (!slot) {
                    return (
                      <div key={`${day}-${timeLabel}`} className="cell bookedCell">
                        Not Available
                      </div>
                    );
                  }

                  const isBooked = !!slot.isBooked;

                  return (
                    <button
                      key={`${day}-${timeLabel}`}
                      type="button"
                      className={[
                        "cell",
                        isBooked ? "bookedCell" : "availableCell",
                        isSelected ? "selectedCell" : "",
                      ].join(" ")}
                      disabled={isBooked || booking}
                      onClick={() => setSelectedSlotId(slot._id)}
                      title={
                        isBooked
                          ? "Not Available"
                          : `${day} ${timeLabel} - Available`
                      }
                    >
                      {isBooked
                        ? "Not Available"
                        : isSelected
                        ? "Selected"
                        : "Available"}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {selectedSlot ? (
        <div className="bookingPanel">
          <div className="selectionSummary">
            <h3>Selected Block</h3>
            <p>
              <strong>Day:</strong> {getDayName(selectedSlot.startTime)}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {getTimeLabel(selectedSlot.startTime, selectedSlot.endTime)}
            </p>
          </div>

          <div className="field">
            <label htmlFor="topicSelect">Topic</label>
            <select
              id="topicSelect"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={loadingTopics || booking}
            >
              <option value="">Select topic</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              rows="4"
              placeholder="Add any details for the advisor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={booking}
            />
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={openConfirmModal}
            disabled={booking}
          >
            Request Appointment
          </button>
        </div>
      ) : null}

      <ConfirmAppointmentModal
        visible={confirmVisible}
        appointment={appointmentPreview}
        onConfirm={confirmAppointment}
        onCancel={cancelConfirmation}
        confirming={booking}
      />
    </div>
  );
}