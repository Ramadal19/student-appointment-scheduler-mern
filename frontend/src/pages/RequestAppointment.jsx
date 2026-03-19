import React from "react";
import "../styles/requestAppointment.css";
import ConfirmAppointmentModal from "../components/appointments/ConfirmAppointmentModal";
import AvailabilityGrid from "../components/appointments/AvailabilityGrid";
import BookingPanel from "../components/appointments/BookingPanel";
import useRequestAppointment from "../hooks/useRequestAppointment";

export default function RequestAppointment({
  sessionOk,
  user,
  onAppointmentCreated,
}) {
  const {
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
  } = useRequestAppointment(onAppointmentCreated);

  return (
    <div className="requestPage">
      <h2>Request Appointment</h2>
      <p className="subtitle">
        Select an advisor and choose a time block. <strong>*</strong> Indicates required fields.
      </p>

      <div className="field">
        <label htmlFor="advisorSelect">Advisor *</label>
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
        <AvailabilityGrid
          timeRows={timeRows}
          slotMap={slotMap}
          selectedSlotId={selectedSlotId}
          setSelectedSlotId={setSelectedSlotId}
          booking={booking}
        />
      )}

      <div className="requestFeedback">
        {error && <div className="auth-alert">{error}</div>}
        {success && <div className="success-alert">{success}</div>}
      </div>

      <BookingPanel
        selectedSlot={selectedSlot}
        topics={topics}
        selectedTopicId={selectedTopicId}
        setSelectedTopicId={setSelectedTopicId}
        notes={notes}
        setNotes={setNotes}
        loadingTopics={loadingTopics}
        booking={booking}
        openConfirmModal={openConfirmModal}
      />

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