import React from "react";
import {
  WEEK_DAYS,
} from "../../utils/appointmentHelpers";

export default function AvailabilityGrid({
  timeRows,
  slotMap,
  selectedSlotId,
  setSelectedSlotId,
  booking,
}) {
  return (
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
  );
}