import { useEffect, useMemo, useState } from "react";

import {
  getDayName,
  getDateLabel,
  getTimeLabel,
} from "../utils/appointmentHelpers";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

const FIXED_TIME_ROWS = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
//  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

export default function useRequestAppointment(onAppointmentCreated) {
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

        const weekFrom = "2026-03-23T00:00:00.000Z";
        const weekTo = "2026-03-27T23:59:59.999Z";

        const res = await fetch(
          `${API_BASE}/api/availability?advisorId=${selectedAdvisor}&from=${encodeURIComponent(
            weekFrom
          )}&to=${encodeURIComponent(weekTo)}`,
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

  const timeRows = useMemo(() => FIXED_TIME_ROWS, []);

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
        throw new Error(
          data?.error || data?.message || "Failed to create appointment."
        );
      }

      setConfirmVisible(false);

      if (onAppointmentCreated) {
        await onAppointmentCreated();
      }

      return;
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

  return {
    advisors,
    selectedAdvisor,
    setSelectedAdvisor,
    selectedSlotId,
    setSelectedSlotId,
    topics,
    selectedTopicId,
    setSelectedTopicId,
    notes,
    setNotes,
    loadingAdvisors,
    loadingTopics,
    loadingSlots,
    booking,
    error,
    success,
    confirmVisible,
    appointmentPreview,
    timeRows,
    slotMap,
    selectedSlot,
    openConfirmModal,
    confirmAppointment,
    cancelConfirmation,
  };
}