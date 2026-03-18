import React from "react";
import {
  getDayName,
  getTimeLabel,
} from "../../utils/appointmentHelpers";

export default function BookingPanel({
  selectedSlot,
  topics,
  selectedTopicId,
  setSelectedTopicId,
  notes,
  setNotes,
  loadingTopics,
  booking,
  openConfirmModal,
}) {
  if (!selectedSlot) return null;

  return (
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
  );
}