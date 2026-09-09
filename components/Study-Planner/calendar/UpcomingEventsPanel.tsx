"use client";

import type {
  CalendarEvent,
  EventType,
} from "./calendarTypes";

type UpcomingEventsPanelProps = {
  events: CalendarEvent[];
  onOpenEvent: (
    event: CalendarEvent
  ) => void;
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

function formatDate(
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
      month: "short",
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

  if (durationMinutes % 60 === 0) {
    const hours =
      durationMinutes / 60;

    return `${hours} hr${
      hours === 1 ? "" : "s"
    }`;
  }

  const hours = Math.floor(
    durationMinutes / 60
  );

  const minutes =
    durationMinutes % 60;

  return `${hours} hr ${minutes} min`;
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

export default function UpcomingEventsPanel({
  events,
  onOpenEvent,
}: UpcomingEventsPanelProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
            ⏭️ Upcoming
          </p>

          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Your next scheduled items
          </p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] font-black text-slate-300">
          {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-5 text-center">
          <p className="text-2xl">
            ✨
          </p>

          <p className="mt-2 font-black uppercase text-white">
            Nothing Upcoming
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Future events will appear
            here.
          </p>
        </div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {events.map((event) => {
            const time =
              formatEventTime(event);

            const duration =
              formatDuration(
                event.durationMinutes
              );

            return (
              <button
                key={event.id}
                type="button"
                onClick={() =>
                  onOpenEvent(event)
                }
                className={
                  "block w-full rounded-xl border px-3 py-3 text-left transition hover:-translate-y-0.5 " +
                  TYPE_STYLES[
                    event.type
                  ]
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-50">
                        {event.title}
                      </p>

                      {isGeneratedEvent(
                        event
                      ) && (
                        <span className="rounded-full border border-green-400/50 bg-green-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-green-100">
                          Auto
                        </span>
                      )}

                      {event.roadmapId && (
                        <span className="rounded-full border border-sky-400/50 bg-sky-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-sky-100">
                          Roadmap
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[10px] font-semibold text-slate-200/80">
                      {formatDate(
                        event.date
                      )}
                      {" · "}
                      {event.type}

                      {time
                        ? ` · ${time}`
                        : ""}

                      {duration
                        ? ` · ${duration}`
                        : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm">
                    ›
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}