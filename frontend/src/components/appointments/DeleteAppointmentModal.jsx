import React from "react";
import { createPortal } from "react-dom";
import "../../styles/deleteAppointmentModal.css";

export default function DeleteAppointmentModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  appointment,
}) {
  if (!open) return null;

  const topic =
    appointment?.topic ||
    appointment?.topicId?.title ||
    appointment?.topicId?.name ||
    "this appointment";

  const advisor =
    appointment?.advisor ||
    appointment?.advisorId?.name ||
    "the advisor";

  const dateLabel = appointment?.dateLabel || "the selected time";

  return createPortal(
    <div
      className="deleteModalOverlay"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="deleteModalCard"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="deleteModalHeader">
          <h3>Delete Appointment</h3>
          <button
            type="button"
            className="deleteModalClose"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="deleteModalBody">
          <p className="deleteModalText">
            Are you sure you want to delete this appointment?
          </p>

          <div className="deleteModalSummary">
            <div>
              <span className="deleteModalLabel">Topic</span>
              <strong>{topic}</strong>
            </div>

            <div>
              <span className="deleteModalLabel">Advisor</span>
              <strong>{advisor}</strong>
            </div>

            <div>
              <span className="deleteModalLabel">Date</span>
              <strong>{dateLabel}</strong>
            </div>
          </div>

          <p className="deleteModalWarning">
            This action will remove the appointment and free the time slot again.
          </p>
        </div>

        <div className="deleteModalActions">
          <button
            type="button"
            className="deleteModalCancelBtn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="deleteModalDeleteBtn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}