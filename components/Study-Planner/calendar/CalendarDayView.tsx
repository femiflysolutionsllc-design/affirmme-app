"use client";

import type {
  CalendarEvent,
  EventType,
} from "./calendarTypes";

type CalendarDayViewProps = {
  selectedDate: string;
  events: CalendarEvent[];

  onOpenEvent: (
    event: CalendarEvent
  ) => void;

  onSelectTime: (
    time: string
  ) => void;

  onPreviousDay: () => void;
  onNextDay: () => void;
};

/* =========================
   Timeline
========================= */

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 24;
const HOUR_HEIGHT = 64;

const DAY_HOURS = Array.from(
  {
    length:
      DAY_END_HOUR -
      DAY_START_HOUR,
  },
  (_, index) =>
    index + DAY_START_HOUR
);

const TIMELINE_HEIGHT =
  DAY_HOURS.length *
  HOUR_HEIGHT;

/* =========================
   Event Colors
========================= */

const DOT_STYLES: Record<
  EventType,
  string
> = {
  Gym: "bg-emerald-400",
  Study: "bg-yellow-400",
  Work: "bg-purple-500",
  Appointment: "bg-blue-400",
  "Self-care": "bg-rose-400",
  Bill: "bg-yellow-400",
  Paycheck: "bg-emerald-400",
  Other: "bg-slate-400",
};

const CARD_STYLES: Record<
  EventType,
  string
> = {
  Gym:
    "border-emerald-400/30 bg-emerald-500/[0.06]",

  Study:
    "border-yellow-400/30 bg-yellow-500/[0.05]",

  Work:
    "border-purple-400 bg-purple-500/[0.10]",

  Appointment:
    "border-blue-400/40 bg-blue-500/[0.07]",

  "Self-care":
    "border-rose-400/40 bg-rose-500/[0.07]",

  Bill:
    "border-yellow-400/40 bg-yellow-500/[0.07]",

  Paycheck:
    "border-emerald-400/40 bg-emerald-500/[0.07]",

  Other:
    "border-slate-600 bg-slate-900/50",
};

/* =========================
   Formatting
========================= */

function formatDayHeading(
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
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function formatHourLabel(
  hour: number
) {
  const date = new Date();

  date.setHours(
    hour,
    0,
    0,
    0
  );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
    }
  ).format(date);
}

function formatTime(
  time?: string
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

function formatShortEndDay(
  dateISO?: string
) {
  if (!dateISO) {
    return "";
  }

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
    }
  ).format(date);
}

function formatLongEndDate(
  dateISO?: string
) {
  if (!dateISO) {
    return "";
  }

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
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function formatDuration(
  minutes?: number
) {
  const value =
    minutes ?? 60;

  if (
    value % 60 === 0
  ) {
    const hours =
      value / 60;

    return `${hours}h`;
  }

  if (value > 60) {
    const hours =
      Math.floor(
        value / 60
      );

    const remaining =
      value % 60;

    return `${hours}h ${remaining}m`;
  }

  return `${value}m`;
}

/* =========================
   Event Math
========================= */

function getEventTime(
  event: CalendarEvent
) {
  return (
    event.startTime ??
    event.time
  );
}

function getEventStartMinutes(
  event: CalendarEvent
) {
  const time =
    getEventTime(event);

  if (!time) {
    return null;
  }

  const [
    hourText,
    minuteText,
  ] = time.split(":");

  const hour =
    Number(hourText);

  const minute =
    Number(
      minuteText || 0
    );

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  return (
    hour * 60 +
    minute
  );
}

function getEventTop(
  event: CalendarEvent
) {
  const startMinutes =
    getEventStartMinutes(
      event
    );

  if (
    startMinutes === null
  ) {
    return 0;
  }

  return Math.max(
    0,
    ((startMinutes -
      DAY_START_HOUR *
        60) /
      60) *
      HOUR_HEIGHT
  );
}

function isMultiDayEvent(
  event: CalendarEvent
) {
  const startDate =
    event.startDate ??
    event.date;

  const endDate =
    event.endDate;

  return Boolean(
    endDate &&
      endDate >
        startDate
  );
}

function getEventHeight(
  event: CalendarEvent
) {
  /*
   * Overnight events stay compact.
   * The continuation is explained
   * by the overnight information card.
   */
  if (
    isMultiDayEvent(event)
  ) {
    return 70;
  }

  const duration =
    event.durationMinutes ??
    60;

  return Math.max(
    58,
    (duration / 60) *
      HOUR_HEIGHT
  );
}

function eventsOverlap(
  first: CalendarEvent,
  second: CalendarEvent
) {
  const firstStart =
    getEventStartMinutes(
      first
    );

  const secondStart =
    getEventStartMinutes(
      second
    );

  if (
    firstStart === null ||
    secondStart === null
  ) {
    return false;
  }

  const firstEnd =
    firstStart +
    (first.durationMinutes ??
      60);

  const secondEnd =
    secondStart +
    (second.durationMinutes ??
      60);

  return (
    firstStart <
      secondEnd &&
    secondStart <
      firstEnd
  );
}

function getConflictLayout(
  event: CalendarEvent,
  events: CalendarEvent[]
) {
  const overlaps =
    events
      .filter(
        (other) =>
          other.id ===
            event.id ||
          eventsOverlap(
            event,
            other
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          (getEventStartMinutes(
            first
          ) ?? 0) -
          (getEventStartMinutes(
            second
          ) ?? 0)
      );

  const columnCount =
    Math.max(
      1,
      overlaps.length
    );

  const columnIndex =
    Math.max(
      0,
      overlaps.findIndex(
        (other) =>
          other.id ===
          event.id
      )
    );

  return {
    columnCount,
    columnIndex,
  };
}

function isHourOccupied(
  hour: number,
  events: CalendarEvent[]
) {
  const hourStart =
    hour * 60;

  const hourEnd =
    hourStart + 60;

  return events.some(
    (event) => {
      const start =
        getEventStartMinutes(
          event
        );

      if (
        start === null
      ) {
        return false;
      }

      const end =
        start +
        (event.durationMinutes ??
          60);

      return (
        start < hourEnd &&
        end > hourStart
      );
    }
  );
}

function formatEventRange(
  event: CalendarEvent
) {
  const startTime =
    getEventTime(event);

  if (!startTime) {
    return "";
  }

  if (
    isMultiDayEvent(
      event
    ) &&
    event.endDate &&
    event.endTime
  ) {
    return `${formatTime(
      startTime
    )} → ${formatShortEndDay(
      event.endDate
    )} ${formatTime(
      event.endTime
    )} (${formatDuration(
      event.durationMinutes
    )})`;
  }

  const startMinutes =
    getEventStartMinutes(
      event
    );

  if (
    startMinutes === null
  ) {
    return formatTime(
      startTime
    );
  }

  const duration =
    event.durationMinutes ??
    60;

  const start =
    new Date(
      2000,
      0,
      1,
      Math.floor(
        startMinutes / 60
      ),
      startMinutes % 60
    );

  const end =
    new Date(
      start.getTime() +
        duration *
          60000
    );

  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );

  return `${formatter.format(
    start
  )} – ${formatter.format(
    end
  )} (${formatDuration(
    duration
  )})`;
}

/* =========================
   Component
========================= */

export default function CalendarDayView({
  selectedDate,
  events,
  onOpenEvent,
  onSelectTime,
  onPreviousDay,
  onNextDay,
}: CalendarDayViewProps) {
  const financialEvents =
    events.filter(
      (event) =>
        event.type ===
          "Paycheck" ||
        event.type ===
          "Bill"
    );

    const timedEvents =
    events.filter((event) => {
      if (
        event.type ===
          "Paycheck" ||
        event.type ===
          "Bill"
      ) {
        return false;
      }
  
      const startDate =
        event.startDate ??
        event.date;
  
      return (
        startDate ===
          selectedDate &&
        Boolean(
          getEventTime(
            event
          )
        )
      );
    });

    const overnightEvents =
    events.filter(
      isMultiDayEvent
    );

  const conflictIds =
    new Set<string>();

  for (
    let firstIndex = 0;
    firstIndex <
    timedEvents.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
      timedEvents.length;
      secondIndex += 1
    ) {
      if (
        eventsOverlap(
          timedEvents[
            firstIndex
          ],
          timedEvents[
            secondIndex
          ]
        )
      ) {
        conflictIds.add(
          timedEvents[
            firstIndex
          ].id
        );

        conflictIds.add(
          timedEvents[
            secondIndex
          ].id
        );
      }
    }
  }

  const conflictingEvents =
    timedEvents.filter(
      (event) =>
        conflictIds.has(
          event.id
        )
    );

  return (
    <div className="overflow-hidden rounded-[22px] border-[2px] border-slate-700 bg-[#081022] shadow-[6px_6px_0px_black]">
    {/* Header */}
<div className="flex items-center justify-between gap-3 border-b border-slate-700 px-5 py-4">
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={onPreviousDay}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 bg-slate-900 text-lg font-black text-slate-200 transition hover:border-blue-400 hover:text-blue-300"
      aria-label="Previous day"
    >
      ‹
    </button>

    <h3 className="text-sm font-black text-white">
      <span className="text-[#60A5FA]">
        DAY VIEW
      </span>{" "}
      (
      {formatDayHeading(
        selectedDate
      )}
      )
    </h3>

    <button
      type="button"
      onClick={onNextDay}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 bg-slate-900 text-lg font-black text-slate-200 transition hover:border-blue-400 hover:text-blue-300"
      aria-label="Next day"
    >
      ›
    </button>
  </div>

  <span className="rounded-xl border border-blue-400/50 bg-blue-600 px-4 py-2 text-[10px] font-black text-white shadow-sm">
    {timedEvents.length}{" "}
    {timedEvents.length ===
    1
      ? "event"
      : "events"}
  </span>
</div>

      {/* Financial items */}
      {financialEvents.length >
        0 && (
        <div className="space-y-2 border-b border-slate-800 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
            💰 Money for this day
          </p>

          {financialEvents.map(
            (event) => (
              <button
                key={
                  event.id
                }
                type="button"
                onClick={() =>
                  onOpenEvent(
                    event
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-white">
                    {
                      event.title
                    }
                  </span>

                  <span className="text-[9px] font-black uppercase text-emerald-300">
                    {
                      event.type
                    }
                  </span>
                </div>
              </button>
            )
          )}
        </div>
      )}

      <div className="p-5">
        {/* Conflict */}
        {conflictingEvents.length >
          1 && (
          <div className="mb-4 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-300">
              ⚠ Schedule Conflict
            </p>

            <p className="mt-1 text-[10px] font-semibold text-slate-300">
              {conflictingEvents
                .map(
                  (event) =>
                    event.title
                )
                .join(
                  " and "
                )}{" "}
              overlap.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="relative max-h-[430px] overflow-y-auto rounded-xl border border-slate-700 bg-[#070E1E]">
          <div
            className="relative"
            style={{
              height: `${TIMELINE_HEIGHT}px`,
            }}
          >
            {/* Hour rows */}
            {DAY_HOURS.map(
              (hour) => {
                const timeValue =
                  `${String(
                    hour
                  ).padStart(
                    2,
                    "0"
                  )}:00`;

                const occupied =
                  isHourOccupied(
                    hour,
                    timedEvents
                  );

                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      if (
                        !occupied
                      ) {
                        onSelectTime(
                          timeValue
                        );
                      }
                    }}
                    style={{
                      position:
                        "absolute",

                      top:
                        (hour -
                          DAY_START_HOUR) *
                        HOUR_HEIGHT,

                      left: 0,
                      right: 0,

                      height:
                        HOUR_HEIGHT,
                    }}
                    className="grid grid-cols-[78px_1fr] border-b border-slate-800/90 text-left"
                  >
                    <div className="h-full border-r border-slate-800 px-3 py-2 text-right text-xs font-semibold text-slate-400">
                      {formatHourLabel(
                        hour
                      )}
                    </div>

                    <div className="relative h-full px-4 py-2">
                      {!occupied && (
                        <span className="text-[9px] font-semibold text-slate-700">
                          + Add at{" "}
                          {formatHourLabel(
                            hour
                          )}
                        </span>
                      )}
                    </div>
                  </button>
                );
              }
            )}

            {/* Multi-day continuation guide */}
{overnightEvents.map((event) => {
  const startDate =
    event.startDate ??
    event.date;

  const endDate =
    event.endDate ??
    startDate;

  const isStartDay =
    selectedDate ===
    startDate;

  const isEndDay =
    selectedDate ===
    endDate;

  const isMiddleDay =
    selectedDate >
      startDate &&
    selectedDate <
      endDate;

  const startTop =
    isStartDay
      ? getEventTop(event) +
        32
      : 0;

  const endMinutes =
    event.endTime
      ? (() => {
          const [
            hourText,
            minuteText,
          ] =
            event.endTime.split(
              ":"
            );

          const hour =
            Number(
              hourText
            );

          const minute =
            Number(
              minuteText ||
                0
            );

          return (
            hour * 60 +
            minute
          );
        })()
      : null;

  const endBottom =
    isEndDay &&
    endMinutes !== null
      ? Math.max(
          0,
          TIMELINE_HEIGHT -
            ((endMinutes -
              DAY_START_HOUR *
                60) /
              60) *
              HOUR_HEIGHT
        )
      : 18;

  return (
    <div
      key={`guide-${event.id}-${selectedDate}`}
      className="pointer-events-none absolute left-[70px] z-[3] w-px border-l-2 border-dashed border-purple-500/80"
      style={{
        top:
          isMiddleDay ||
          isEndDay
            ? 0
            : startTop,

        bottom:
          isStartDay ||
          isMiddleDay
            ? 18
            : endBottom,
      }}
    >
      {isStartDay && (
        <span className="absolute -left-[6px] -top-1 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
      )}

      {isEndDay && (
        <span className="absolute -bottom-[6px] -left-[6px] h-3 w-3 rounded-full border-2 border-purple-400 bg-[#070E1E]" />
      )}

      {(isStartDay ||
        isMiddleDay) && (
        <span className="absolute -bottom-2 -left-[8px] text-lg font-black text-purple-400">
          ↓
        </span>
      )}
    </div>
  );
})}

            {/* Events */}
            <div className="pointer-events-none absolute inset-0 left-[78px]">
              {timedEvents.map(
                (event) => {
                  const {
                    columnIndex,
                    columnCount,
                  } =
                    getConflictLayout(
                      event,
                      timedEvents
                    );

                  const gap =
                    6;

                  const width =
                    100 /
                    columnCount;

                  return (
                    <button
                      key={
                        event.id
                      }
                      type="button"
                      onClick={(
                        clickEvent
                      ) => {
                        clickEvent.stopPropagation();

                        onOpenEvent(
                          event
                        );
                      }}
                      style={{
                        position:
                          "absolute",

                        top: `${getEventTop(
                          event
                        )}px`,

                        left: `calc(${
                          columnIndex *
                          width
                        }% + ${
                          8 +
                          columnIndex *
                            gap
                        }px)`,

                        width: `calc(${
                          width
                        }% - ${
                          16 +
                          ((columnCount -
                            1) *
                            gap) /
                            columnCount
                        }px)`,

                        height: `${getEventHeight(
                          event
                        )}px`,
                      }}
                      className={
                        "pointer-events-auto z-10 overflow-hidden rounded-xl border px-4 py-3 text-left transition hover:brightness-110 " +
                        CARD_STYLES[
                          event.type
                        ]
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={
                              "h-3 w-3 shrink-0 rounded-full shadow-[0_0_8px_currentColor] " +
                              DOT_STYLES[
                                event.type
                              ]
                            }
                          />

                          <p className="truncate text-xs font-black text-white">
                            {
                              event.title
                            }
                            {event.type && (
                              <span className="text-slate-300">
                                {" "}
                                (
                                {
                                  event.type
                                }
                                )
                              </span>
                            )}
                          </p>
                        </div>

                        <span className="text-xl text-slate-300">
                          ›
                        </span>
                      </div>

                      <p className="mt-1 pl-5 text-[10px] font-semibold text-slate-300">
                        {formatEventRange(
                          event
                        )}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

       {/* Overnight information */}
{overnightEvents.map((event) => (
  <button
    key={`overnight-${event.id}`}
    type="button"
    onClick={() =>
      onOpenEvent(event)
    }
    className="mx-auto mt-4 block w-[92%] rounded-[20px] border-[2px] border-purple-400 bg-[#181329] px-5 py-5 text-left shadow-[4px_4px_0px_black] transition hover:bg-purple-500/10"
  >
    <div className="flex items-start gap-4">
      {/* Moon */}
      <span className="mt-0.5 shrink-0 text-3xl leading-none">
        🌙
      </span>

      <div className="min-w-0 flex-1">
        {/* Label */}
        <p className="text-sm font-black uppercase tracking-[0.12em] text-purple-200">
          Overnight Event
        </p>

        {/* Event title */}
        <p className="mt-3 text-base font-black text-white">
          {event.title}
        </p>

        {/* Subtle continuation text */}
        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-500">
          Continues past midnight and ends{" "}
          {formatLongEndDate(
            event.endDate
          )}{" "}
          at{" "}
          {formatTime(
            event.endTime
          )}
          .
        </p>
      </div>
    </div>
  </button>
))}
      </div>
    </div>
  );
}