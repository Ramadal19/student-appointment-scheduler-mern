export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const DISPLAY_TIME_ZONE = "America/Chicago";

export function getDayName(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

export function getDateLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

export function getTimeLabel(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return `${start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TIME_ZONE,
  })} - ${end.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TIME_ZONE,
  })}`;
}