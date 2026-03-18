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

  const appointmentTime = appointment.time || "EMPTY TIME";
  const appointmentDate = appointment.date || "EMPTY DATE";
  const appointmentTopic = appointment.topic || "EMPTY TOPIC";

  console.log("ConfirmAppointmentModal appointment:", appointment);

  return (
    <div className="modalOverlay">
      <div className="appointmentCard">
        <div className="checkPreview">📅</div>

        <h2>Confirm Appointment</h2>

        <div className="appointmentSummary">
          <div
            className="appointmentTime"
            style={{ color: "#000", fontWeight: 700 }}
          >
            Time: {appointmentTime}
          </div>

          <div
            className="appointmentAdvisor"
            style={{ color: "#000", fontWeight: 700 }}
          >
            Advisor: {advisorName}
          </div>

          <div
            className="appointmentDate"
            style={{ color: "#000" }}
          >
            Date: {appointmentDate}
          </div>

          <div
            className="appointmentTopic"
            style={{ color: "#000" }}
          >
            Topic: {appointmentTopic}
          </div>

          <pre
            style={{
              marginTop: "12px",
              padding: "10px",
              textAlign: "left",
              background: "#f3f4f6",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#111",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(appointment, null, 2)}
          </pre>
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