import type {
  CalendarEvent,
  EventType,
  StudyTimePreference,
} from "./calendarTypes";

/* =========================
   Shared Calendar Styles
========================= */

export const TYPE_STYLES: Record<
  EventType,
  string
> = {
  Gym:
    "border-emerald-400 bg-emerald-500/15 text-emerald-200",

  Study:
    "border-sky-400 bg-sky-500/15 text-sky-200",

  Work:
    "border-amber-400 bg-amber-500/15 text-amber-200",

  Appointment:
    "border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-200",

  "Self-care":
    "border-rose-400 bg-rose-500/15 text-rose-200",

  Bill:
    "border-yellow-400 bg-yellow-500/15 text-yellow-200",

  Paycheck:
    "border-green-400 bg-green-500/20 text-green-200",

  Other:
    "border-slate-600 bg-slate-900 text-slate-200",
};

export const EVENT_TYPES: EventType[] = [
  "Gym",
  "Study",
  "Work",
  "Appointment",
  "Self-care",
  "Bill",
  "Paycheck",
  "Other",
];

export const STUDY_TIME_LOOKUP: Record<
  StudyTimePreference,
  string
> = {
  morning: "09:00",
  afternoon: "14:00",
  evening: "20:00",
};

export const DAY_SECTIONS = [
  {
    title: "Paychecks",
    emoji: "💵",
    types: ["Paycheck"],
  },
  {
    title: "Bills",
    emoji: "🧾",
    types: ["Bill"],
  },
  {
    title: "Study",
    emoji: "📚",
    types: ["Study"],
  },
  {
    title: "Work & Appointments",
    emoji: "🗓️",
    types: ["Work", "Appointment"],
  },
  {
    title: "Personal",
    emoji: "✨",
    types: ["Gym", "Self-care", "Other"],
  },
];
/* =========================
   Shared Calendar Helpers
========================= */

export function getLocalDateKey(
  date: Date
) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDate(
  year: number,
  month: number,
  day: number
) {
  const monthText = String(
    month + 1
  ).padStart(2, "0");

  const dayText = String(
    day
  ).padStart(2, "0");

  return `${year}-${monthText}-${dayText}`;
}

export function addDays(
  dateText: string,
  days: number
) {
  const date = new Date(
    `${dateText}T00:00:00`
  );

  date.setDate(
    date.getDate() + days
  );

  return getLocalDateKey(date);
}

export function money(
  value: number
) {
  const safeValue =
    Number.isFinite(value)
      ? value
      : 0;

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(safeValue);
}

export function isGeneratedEvent(
  event: CalendarEvent
) {
  return (
    event.source === "paycheck" ||
    event.source === "bill" ||
    Boolean(event.paycheckId) ||
    Boolean(event.billId) ||
    Boolean(
      event.billOccurrenceKey
    )
  );
}

export function formatDisplayDate(
  dateText: string
) {
  const date = new Date(
    `${dateText}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

export function formatEventTime(
  event: CalendarEvent
) {
  if (!event.time) {
    return "";
  }

  const date = new Date(
    `${event.date}T${event.time}:00`
  );

  if (Number.isNaN(date.getTime())) {
    return event.time;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

export function formatDuration(
  durationMinutes?: number
) {
  if (!durationMinutes) {
    return "";
  }

  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }

  const hours = Math.floor(
    durationMinutes / 60
  );

  const remainingMinutes =
    durationMinutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr${
      hours === 1 ? "" : "s"
    }`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}