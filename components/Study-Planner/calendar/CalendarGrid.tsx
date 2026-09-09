"use client";

import type {
  CalendarEvent,
  EventType,
} from "./calendarTypes";

type CalendarCell = {
  label: string;
  dateStr?: string;
};

type CalendarGridProps = {
  monthLabel: string;
  calendarCells: CalendarCell[];
  todayStr: string;
  selectedDate: string;

  eventsByDate: Record<
    string,
    CalendarEvent[]
  >;

  onPreviousMonth: () => void;
  onNextMonth: () => void;

  onSelectDate: (
    dateStr: string
  ) => void;
};

/* =========================
   Event Dot Styles
========================= */

const TYPE_STYLES: Record<
  EventType,
  string
> = {
  Gym:
    "border-emerald-400 bg-emerald-400",

  Study:
    "border-yellow-400 bg-yellow-400",

  Work:
    "border-purple-400 bg-purple-400",

  Appointment:
    "border-blue-400 bg-blue-400",

  "Self-care":
    "border-rose-400 bg-rose-400",

  Bill:
    "border-pink-400 bg-pink-400",

  Paycheck:
    "border-teal-300 bg-teal-300",

  Other:
    "border-slate-500 bg-slate-500",
};

/* =========================
   Multi-Day Range Styles
========================= */

const RANGE_STYLES: Record<
  EventType,
  string
> = {
  Work:
    "border-purple-400/80 bg-purple-500/40",

  Gym:
    "border-emerald-400/80 bg-emerald-500/35",

  Study:
    "border-yellow-400/80 bg-yellow-500/35",

  Appointment:
    "border-blue-400/80 bg-blue-500/35",

  "Self-care":
    "border-rose-400/80 bg-rose-500/35",

  Bill:
    "border-pink-400/80 bg-pink-500/35",

  Paycheck:
    "border-teal-300/80 bg-teal-400/35",

  Other:
    "border-slate-400/70 bg-slate-500/30",
};

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/* =========================
   Range Helpers
========================= */

function isMultiDayEvent(
  event: CalendarEvent
) {
  const startDate =
    event.startDate ??
    event.date;

  const endDate =
    event.endDate;

  if (
    !startDate ||
    !endDate
  ) {
    return false;
  }

  return (
    endDate >
    startDate
  );
}

function eventIncludesDate(
  event: CalendarEvent,
  dateStr: string
) {
  const startDate =
    event.startDate ??
    event.date;

  const endDate =
    event.endDate ??
    startDate;

  return (
    dateStr >= startDate &&
    dateStr <= endDate
  );
}

function getUniqueEvents(
  eventsByDate: Record<
    string,
    CalendarEvent[]
  >
) {
  const seen =
    new Set<string>();

  const events:
    CalendarEvent[] = [];

  Object.values(
    eventsByDate
  )
    .flat()
    .forEach((event) => {
      if (
        seen.has(
          event.id
        )
      ) {
        return;
      }

      seen.add(
        event.id
      );

      events.push(
        event
      );
    });

  return events;
}

/* =========================
   Component
========================= */

export default function CalendarGrid({
  monthLabel,
  calendarCells,
  todayStr,
  selectedDate,
  eventsByDate,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: CalendarGridProps) {
  const allKnownEvents =
    getUniqueEvents(
      eventsByDate
    );

  const multiDayEvents =
    allKnownEvents.filter(
      isMultiDayEvent
    );

  return (
    <div className="space-y-4 rounded-[22px] border border-slate-800 bg-slate-950/80 p-4 text-xs">
      {/* Month Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={
            onPreviousMonth
          }
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-lg font-black text-slate-300 transition hover:border-slate-500"
        >
          ‹
        </button>

        <p className="text-base font-black uppercase tracking-wide text-white">
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={
            onNextMonth
          }
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-lg font-black text-slate-300 transition hover:border-slate-500"
        >
          ›
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {WEEKDAYS.map(
          (dayName) => (
            <div
              key={
                dayName
              }
              className="text-center"
            >
              {dayName}
            </div>
          )
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-[11px]">
        {calendarCells.map(
          (
            cell,
            index
          ) => {
            const isEmpty =
              !cell.dateStr;

            const isToday =
              cell.dateStr ===
              todayStr;

            const isSelected =
              cell.dateStr ===
              selectedDate;

            const dayEvents =
              cell.dateStr
                ? eventsByDate[
                    cell.dateStr
                  ] || []
                : [];

            const rangeEvents =
              cell.dateStr
                ? multiDayEvents.filter(
                    (event) =>
                      eventIncludesDate(
                        event,
                        cell.dateStr!
                      )
                  )
                : [];

            const visibleRange =
              rangeEvents[0] ??
              null;

            const startDate =
              visibleRange
                ? visibleRange.startDate ??
                  visibleRange.date
                : null;

            const endDate =
              visibleRange
                ? visibleRange.endDate ??
                  startDate
                : null;

            const isRangeStart =
              Boolean(
                visibleRange &&
                  cell.dateStr ===
                    startDate
              );

            const isRangeEnd =
              Boolean(
                visibleRange &&
                  cell.dateStr ===
                    endDate
              );

            /*
             * Calendar rows are seven
             * columns wide.
             *
             * When a range crosses
             * Saturday -> Sunday, it
             * visually starts a new
             * segment on the next row.
             */
            const weekdayIndex =
              index % 7;

            const isStartOfWeek =
              weekdayIndex ===
              0;

            const isEndOfWeek =
              weekdayIndex ===
              6;

            const roundLeft =
              isRangeStart ||
              isStartOfWeek;

            const roundRight =
              isRangeEnd ||
              isEndOfWeek;

            const regularDotEvents =
              dayEvents.filter(
                (event) =>
                  !isMultiDayEvent(
                    event
                  )
              );

            return (
              <button
                key={`${cell.dateStr || "empty"}-${index}`}
                type="button"
                disabled={
                  isEmpty
                }
                onClick={() => {
                  if (
                    !cell.dateStr
                  ) {
                    return;
                  }

                  onSelectDate(
                    cell.dateStr
                  );
                }}
                className={
                  "relative flex h-20 min-w-0 flex-col items-center rounded-xl border px-1 py-1.5 transition " +
                  (isEmpty
                    ? "border-transparent bg-transparent"
                    : isSelected
                      ? "border-emerald-400 bg-emerald-500/10"
                      : isToday
                        ? "border-slate-600 bg-slate-900/80"
                        : "border-slate-800 bg-slate-950/80 hover:border-slate-600")
                }
              >
                {/* Date Number */}
                <div
                  className={
                    "relative z-20 text-[11px] " +
                    (isSelected
                      ? "font-black text-emerald-200"
                      : isToday
                        ? "font-black text-emerald-300"
                        : "font-semibold text-slate-200")
                  }
                >
                  {
                    cell.label
                  }
                </div>

                {/* Normal Event Dots */}
                <div className="relative z-20 mt-auto flex max-w-full flex-wrap justify-center gap-1 pb-1">
                  {regularDotEvents
                    .slice(
                      0,
                      3
                    )
                    .map(
                      (
                        event
                      ) => (
                        <span
                          key={
                            event.id
                          }
                          className={
                            "h-1.5 w-1.5 rounded-full border " +
                            TYPE_STYLES[
                              event
                                .type
                            ]
                          }
                        />
                      )
                    )}

                  {regularDotEvents.length >
                    3 && (
                    <span className="text-[9px] text-slate-400">
                      +
                      {regularDotEvents.length -
                        3}
                    </span>
                  )}
                </div>

                {/* Multi-Day Range */}
                {visibleRange &&
                  cell.dateStr && (
                    <div
                      className={
                        "pointer-events-none absolute bottom-2 z-10 h-3 border-y " +
                        RANGE_STYLES[
                          visibleRange
                            .type
                        ] +
                        (roundLeft
                          ? " left-2 rounded-l-full border-l "
                          : " -left-1 border-l-0 ") +
                        (roundRight
                          ? " right-2 rounded-r-full border-r "
                          : " -right-1 border-r-0 ")
                      }
                    >
                      {/* Start Marker */}
                      {isRangeStart && (
                        <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                      )}

                      {/* End Marker */}
                      {isRangeEnd && (
                        <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                      )}
                    </div>
                  )}

                {/* Extra Range Count */}
                {rangeEvents.length >
                  1 && (
                  <span className="absolute bottom-5 right-1 z-20 text-[8px] font-black text-purple-300">
                    +
                    {rangeEvents.length -
                      1}
                  </span>
                )}
              </button>
            );
          }
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-[9px] font-semibold text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-purple-400" />
          Work
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Gym
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          Study
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          Appointment
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-pink-400" />
          Bill
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-teal-300" />
          Paycheck
        </span>
      </div>

      <p className="text-center text-[10px] text-slate-500">
        Tap a date to view or add events.
      </p>
    </div>
  );
}