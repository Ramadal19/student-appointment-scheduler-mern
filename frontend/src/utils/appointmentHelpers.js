export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export function getDayName(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
  });
}

export function getDateLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getTimeLabel(startTime, endTime) {
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