"use client";

import type {
  EventType,
} from "./calendarTypes";

export type CalendarEventFormValue = {
  title: string;
  type: EventType;

  time: string;
  durationMinutes: number;
  prepMinutes: number;

  endDate: string;
  endTime: string;
};

type CalendarEventFormProps = {
  selectedDate: string;
  editingId: string | null;

  form:
    CalendarEventFormValue;

  listening: boolean;

  onChange: (
    patch: Partial<CalendarEventFormValue>
  ) => void;

  onStartDateChange: (
    date: string
  ) => void;

  onSave: () => void;
  onVoiceInput: () => void;
  onClear: () => void;
};

const MANUAL_EVENT_TYPES: EventType[] = [
  "Gym",
  "Study",
  "Work",
  "Appointment",
  "Self-care",
  "Travel",
  "Other",
];

/* =========================
   Formatting
========================= */

function formatLongDate(
  dateISO: string
) {
  const date = new Date(
    `${dateISO}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateISO;
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

function formatShortDate(
  dateISO: string
) {
  const date = new Date(
    `${dateISO}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateISO;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function formatTime(
  time: string
) {
  if (!time) {
    return "";
  }

  const date = new Date(
    `2000-01-01T${time}:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return time;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

function getSpanDays(
  startDate: string,
  endDate: string
) {
  const start =
    new Date(
      `${startDate}T00:00:00`
    );

  const end =
    new Date(
      `${endDate}T00:00:00`
    );

  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    )
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.round(
      (end.getTime() -
        start.getTime()) /
        86400000
    ) + 1
  );
}

function formatDuration(
  minutes: number
) {
  if (
    minutes % 60 === 0
  ) {
    const hours =
      minutes / 60;

    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    }`;
  }

  if (minutes > 60) {
    const hours =
      Math.floor(
        minutes / 60
      );

    const remaining =
      minutes % 60;

    return `${hours}h ${remaining}m`;
  }

  return `${minutes} minutes`;
}

function getCalculatedDurationMinutes(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
) {
  if (
    !startDate ||
    !startTime ||
    !endDate ||
    !endTime
  ) {
    return 0;
  }

  const start =
    new Date(
      `${startDate}T${startTime}:00`
    );

  const end =
    new Date(
      `${endDate}T${endTime}:00`
    );

  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    ) ||
    end <= start
  ) {
    return 0;
  }

  return Math.round(
    (end.getTime() -
      start.getTime()) /
      60000
  );
}

/* =========================
   Component
========================= */

export default function CalendarEventForm({
  selectedDate,
  editingId,
  form,
  listening,
  onChange,
  onStartDateChange,
  onSave,
  onVoiceInput,
  onClear,
}: CalendarEventFormProps) {
  const spanDays =
    form.endDate
      ? getSpanDays(
          selectedDate,
          form.endDate
        )
      : 1;

  const hasRange =
    Boolean(
      form.time &&
        form.endDate &&
        form.endTime
    );

    const calculatedDurationMinutes =
  hasRange
    ? getCalculatedDurationMinutes(
        selectedDate,
        form.time,
        form.endDate,
        form.endTime
      )
    : 0;

  return (
    <div className="rounded-[24px] border-[2px] border-slate-700 bg-[#081022] p-5 shadow-[7px_7px_0px_black]">
      {/* Header */}
      <div>
        <p className="text-sm font-black uppercase tracking-[0.12em] text-emerald-300">
          ✏️{" "}
          {editingId
            ? "Edit Event"
            : "Add Event"}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-300">
          {formatLongDate(
            selectedDate
          )}
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="calendar-event-title"
            className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
          >
            Event Title
          </label>

          <input
            id="calendar-event-title"
            type="text"
            value={form.title}
            onChange={(event) =>
              onChange({
                title:
                  event.target.value,
              })
            }
            className="mt-2 h-14 w-full rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm text-white outline-none transition focus:border-emerald-400"
          />
        </div>

        {/* Event Type */}
        <div>
          <label
            htmlFor="calendar-event-type"
            className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
          >
            💼 Event Type
          </label>

          <select
            id="calendar-event-type"
            value={form.type}
            onChange={(event) =>
              onChange({
                type:
                  event.target
                    .value as EventType,
              })
            }
            className="mt-2 h-14 w-full rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm text-white outline-none transition focus:border-emerald-400"
          >
            {MANUAL_EVENT_TYPES.map(
              (eventType) => (
                <option
                  key={
                    eventType
                  }
                  value={
                    eventType
                  }
                >
                  {eventType}
                </option>
              )
            )}
          </select>
        </div>

{/* Start */}
<div className="grid grid-cols-2 gap-5">
  {/* Start Date */}
  <div className="min-w-0">
    <label
      htmlFor="calendar-start-date"
      className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
    >
      🗓 Start Date
    </label>

    <label className="relative mt-2 block h-14 cursor-pointer">
      <div className="flex h-full w-full items-center rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm font-semibold text-white">
        🗓️
        <span className="ml-2">
          {new Intl.DateTimeFormat(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          ).format(
            new Date(
              `${selectedDate}T00:00:00`
            )
          )}
        </span>
      </div>

      <input
        id="calendar-start-date"
        type="date"
        value={selectedDate}
        onChange={(event) => {
          const nextDate =
            event.target.value;

          if (!nextDate) {
            return;
          }

          onStartDateChange(
            nextDate
          );
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  </div>

  {/* Start Time */}
  <div className="min-w-0">
    <label
      htmlFor="calendar-start-time"
      className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
    >
      🕒 Start Time
    </label>

    <label className="relative mt-2 block h-14 cursor-pointer">
      <div className="flex h-full w-full items-center rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm font-semibold text-white">
        🕒
        <span className="ml-2">
          {form.time
            ? new Intl.DateTimeFormat(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              ).format(
                new Date(
                  `2000-01-01T${form.time}:00`
                )
              )
            : "Select time"}
        </span>
      </div>

      <input
        id="calendar-start-time"
        type="time"
        value={form.time}
        onChange={(event) =>
          onChange({
            time:
              event.target.value,
          })
        }
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  </div>
</div>

{/* End */}
<div className="grid grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)] items-end gap-3">
  {/* End Date */}
  <div className="min-w-0">
    <label
      htmlFor="calendar-end-date"
      className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
    >
      🗓 End Date
    </label>

    <label className="relative mt-2 block h-14 cursor-pointer">
      <div className="flex h-full w-full items-center rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm font-semibold text-white">
        🗓️
        <span className="ml-2">
          {form.endDate
            ? new Intl.DateTimeFormat(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              ).format(
                new Date(
                  `${form.endDate}T00:00:00`
                )
              )
            : "Select date"}
        </span>
      </div>

      <input
        id="calendar-end-date"
        type="date"
        min={selectedDate}
        value={form.endDate}
        onChange={(event) =>
          onChange({
            endDate:
              event.target.value,
          })
        }
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  </div>

  {/* Arrow */}
  <div className="flex h-14 items-center justify-center">
    <span className="text-2xl font-black text-emerald-400">
      →
    </span>
  </div>

  {/* End Time */}
  <div className="min-w-0">
    <label
      htmlFor="calendar-end-time"
      className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
    >
      🕒 End Time
    </label>

    <label className="relative mt-2 block h-14 cursor-pointer">
      <div className="flex h-full w-full items-center rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm font-semibold text-white">
        🕒
        <span className="ml-2">
          {form.endTime
            ? new Intl.DateTimeFormat(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              ).format(
                new Date(
                  `2000-01-01T${form.endTime}:00`
                )
              )
            : "Select time"}
        </span>
      </div>

      <input
        id="calendar-end-time"
        type="time"
        value={form.endTime}
        onChange={(event) =>
          onChange({
            endTime:
              event.target.value,
          })
        }
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  </div>
</div>



        {/* Range Summary */}
        {hasRange && (
          <div className="flex gap-4 rounded-xl border border-slate-600 bg-[#101A31] px-4 py-3">
            <span className="text-2xl">
              🗓
            </span>

            <div>
              <p className="text-xs font-semibold text-white">
                This event spans{" "}
                {spanDays}{" "}
                {spanDays === 1
                  ? "day"
                  : "days"}{" "}
                (
                  {formatDuration(
  calculatedDurationMinutes
)}
                )
              </p>

              <p className="mt-1 text-[10px] font-semibold text-slate-300">
                {formatShortDate(
                  selectedDate
                )}
                ,{" "}
                {formatTime(
                  form.time
                )}{" "}
                →{" "}
                {formatShortDate(
                  form.endDate
                )}
                ,{" "}
                {formatTime(
                  form.endTime
                )}
              </p>
            </div>
          </div>
        )}

        {/* Duration + Prep */}
        <div className="grid grid-cols-2 gap-5">
        <div className="min-w-0">
  <label
    htmlFor="calendar-duration"
    className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
  >
    ⏱ Duration
  </label>

  {hasRange ? (
    <div className="mt-2 flex h-14 w-full items-center rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4">
      <div>
        <p className="text-sm font-semibold text-white">
          {calculatedDurationMinutes > 0
            ? formatDuration(
                calculatedDurationMinutes
              )
            : "Set start & end"}
        </p>

        {calculatedDurationMinutes > 0 && (
          <p className="mt-0.5 text-[9px] font-semibold text-slate-500">
            Calculated automatically
          </p>
        )}
      </div>
    </div>
  ) : (
    <select
      id="calendar-duration"
      value={form.durationMinutes}
      onChange={(event) =>
        onChange({
          durationMinutes: Number(
            event.target.value
          ),
        })
      }
      className="mt-2 h-14 w-full rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm text-white outline-none transition focus:border-emerald-400"
    >
      <option value={15}>
        15 minutes
      </option>

      <option value={30}>
        30 minutes
      </option>

      <option value={45}>
        45 minutes
      </option>

      <option value={60}>
        1 hour
      </option>

      <option value={90}>
        1 hour 30 minutes
      </option>

      <option value={120}>
        2 hours
      </option>

      <option value={180}>
        3 hours
      </option>

      <option value={240}>
        4 hours
      </option>

      <option value={360}>
        6 hours
      </option>

      <option value={480}>
        8 hours
      </option>

      <option value={720}>
        12 hours
      </option>
    </select>
  )}
</div>

          <div className="min-w-0">
            <label
              htmlFor="calendar-prep"
              className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400"
            >
              🧳 Prep / Travel Time
            </label>

            <select
              id="calendar-prep"
              value={
                form.prepMinutes
              }
              onChange={(event) =>
                onChange({
                  prepMinutes:
                    Number(
                      event.target.value
                    ),
                })
              }
              className="mt-2 h-14 w-full rounded-xl border-[2px] border-slate-600 bg-[#050B18] px-4 text-sm text-white outline-none transition focus:border-emerald-400"
            >
              <option value={0}>
                None
              </option>

              <option value={15}>
                15 minutes before
              </option>

              <option value={30}>
                30 minutes before
              </option>

              <option value={45}>
                45 minutes before
              </option>

              <option value={60}>
                1 hour before
              </option>

              <option value={90}>
                1 hour 30 minutes before
              </option>

              <option value={120}>
                2 hours before
              </option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-[1.35fr_1fr_.7fr] gap-3 pt-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl border-[2px] border-black bg-[#58D36B] px-4 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
          >
            {editingId
              ? "✓ Save Changes"
              : "+ Add Event"}
          </button>

          <button
            type="button"
            onClick={
              onVoiceInput
            }
            className={
              "rounded-xl border-[2px] border-black px-4 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black] " +
              (listening
                ? "bg-yellow-300"
                : "bg-blue-400")
            }
          >
            {listening
              ? "🎙 Listening…"
              : "🎙 Voice Title"}
          </button>

          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border-[2px] border-black bg-slate-200 px-4 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}