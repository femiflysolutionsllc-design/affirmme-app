"use client";

import type {
  CalendarEvent,
  EventType,
} from "./calendarTypes";

type DayDetailsModalProps = {
  isOpen: boolean;
  selectedDate: string;
  events: CalendarEvent[];

  onClose: () => void;
  onAddEvent: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
};

const TYPE_STYLES: Record<
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

function formatDisplayDate(
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

function formatEventTime(
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

function formatDuration(
  durationMinutes?: number
) {
  if (!durationMinutes) {
    return "";
  }

  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }

  const hours =
    durationMinutes / 60;

  return `${hours} hr${
    hours === 1 ? "" : "s"
  }`;
}

function isGeneratedEvent(
  event: CalendarEvent
) {
  return (
    event.source === "paycheck" ||
    event.source === "bill" ||
    Boolean(event.paycheckId) ||
    Boolean(event.billId) ||
    Boolean(event.billOccurrenceKey)
  );
}

export default function DayDetailsModal({
  isOpen,
  selectedDate,
  events,
  onClose,
  onAddEvent,
  onEdit,
  onDelete,
}: DayDetailsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-details-title"
        className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] shadow-[10px_10px_0px_rgba(0,0,0,.85)]"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4 border-b-[3px] border-black bg-[#111933] p-5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#60A5FA]">
              📅 Day Details
            </p>

            <h3
              id="day-details-title"
              className="mt-2 text-2xl font-black text-white"
            >
              {formatDisplayDate(
                selectedDate
              )}
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-400">
              {events.length} event
              {events.length === 1
                ? ""
                : "s"}{" "}
              scheduled
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close day details"
            className="shrink-0 rounded-xl border-[3px] border-black bg-[#F43F7A] px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_black]"
          >
            ✕ Close
          </button>
        </div>

        <div className="max-h-[calc(88vh-120px)] overflow-y-auto p-5">
          {events.length === 0 ? (
            <div className="rounded-[22px] border-[3px] border-black bg-[#111933] p-7 text-center shadow-[5px_5px_0px_black]">
              <p className="text-4xl">
                ✨
              </p>

              <p className="mt-3 text-xl font-black uppercase text-white">
                Nothing Scheduled
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-400">
                This day is currently
                clear.
              </p>

              <button
                type="button"
                onClick={onAddEvent}
                className="mt-5 rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
              >
                Add an Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const time =
                  formatEventTime(event);

                const duration =
                  formatDuration(
                    event.durationMinutes
                  );

                return (
                  <div
                    key={event.id}
                    className={
                      "rounded-[20px] border-[3px] p-4 shadow-[4px_4px_0px_rgba(0,0,0,.7)] " +
                      TYPE_STYLES[
                        event.type
                      ]
                    }
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-50">
                            {event.title}
                          </p>

                          {isGeneratedEvent(
                            event
                          ) && (
                            <span className="rounded-full border border-green-400/50 bg-green-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-green-100">
                              Auto
                            </span>
                          )}

                          {event.roadmapId && (
                            <span className="rounded-full border border-sky-400/50 bg-sky-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-sky-100">
                              Roadmap
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-200/80">
  {typeof event.allocationAmount === "number" ? (
    <>
      <span>
        Reserved from paycheck
      </span>

      {event.billDueLabel && (
        <span className="rounded-full border border-yellow-400/40 bg-yellow-500/10 px-2 py-1 text-[10px] font-black text-yellow-200">
          📅 {event.billDueLabel}
        </span>
      )}

      {event.allocationPaid && (
        <span className="rounded-full border border-green-400/40 bg-green-500/10 px-2 py-1 text-[10px] font-black text-green-200">
          ✓ Paid
        </span>
      )}
    </>
  ) : (
    <>
      <span>
        {event.type}
      </span>

      {time && (
        <span>
          🕒 {time}
        </span>
      )}

      {duration && (
        <span>
          ⏱️ {duration}
        </span>
      )}
    </>
  )}
</div>
</div>

                      {!isGeneratedEvent(
                        event
                      ) && (
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(event)
                            }
                            className="rounded-xl border-[2px] border-black bg-[#60A5FA] px-3 py-2 text-[10px] font-black uppercase text-black shadow-[3px_3px_0px_black]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onDelete(event)
                            }
                            className="rounded-xl border-[2px] border-black bg-[#F43F7A] px-3 py-2 text-[10px] font-black uppercase text-white shadow-[3px_3px_0px_black]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}