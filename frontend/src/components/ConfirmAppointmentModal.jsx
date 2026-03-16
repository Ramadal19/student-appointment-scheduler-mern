import React from "react";
import "../styles/appointmentModal.css";

export default function ConfirmAppointmentModal({
  visible,
  appointment,
  onConfirm,
  onCancel,
  confirming,
}) {
  if (!visible || !appointment) return null;

  const advisorName =
    appointment.advisorName ||
    appointment.advisor?.name ||
    appointment.advisor ||
    "Not assigned";

  return (
    <div className="modalOverlay">
      <div className="appointmentCard">
        <div className="checkPreview">📅</div>

        <h2>Confirm Appointment</h2>

        <div className="appointmentSummary">
          <div className="appointmentTime">{appointment.time}</div>
          <div className="appointmentAdvisor">Advisor: {advisorName}</div>
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