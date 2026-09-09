"use client";

import type {
  CalendarEvent,
  EventType,
} from "./calendarTypes";

import {
  TYPE_STYLES,
  DAY_SECTIONS,
  formatDisplayDate,
  formatEventTime,
  formatDuration,
  isGeneratedEvent,
} from "./calendarUtils";

type SelectedDayPanelProps = {
  selectedDate: string;
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onOpenEvent: (event: CalendarEvent) => void;
};

export default function SelectedDayPanel({
  selectedDate,
  events,
  onEdit,
  onDelete,
  onOpenEvent,
}: SelectedDayPanelProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
          📅 Selected Day
        </p>

        <h3 className="mt-2 text-lg font-black text-white">
  {formatDisplayDate(
    selectedDate
  )}
</h3>

        <p className="mt-1 text-[11px] font-semibold text-slate-400">
          {events.length} event
          {events.length === 1
            ? ""
            : "s"}{" "}
          scheduled
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-5 text-center">
          <p className="text-2xl">
            ✨
          </p>

          <p className="mt-2 font-black uppercase text-white">
            Nothing Scheduled
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Use the Add Event form
            above to plan this day.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAY_SECTIONS.map(
            (section) => {
              const sectionEvents =
                events.filter(
                  (event) =>
                    section.types.includes(
                      event.type
                    )
                );

              if (
                sectionEvents.length ===
                0
              ) {
                return null;
              }

              return (
                <section
                  key={section.title}
                  className="rounded-xl border border-slate-800 bg-[#0A1024] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black uppercase tracking-wide text-white">
                      {section.emoji}{" "}
                      {section.title}
                    </p>

                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-black text-slate-300">
                      {
                        sectionEvents.length
                      }
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {sectionEvents.map(
                      (event) => {
                        const time =
                          formatEventTime(
                            event
                          );

                        const duration =
                          formatDuration(
                            event.durationMinutes
                          );

                          const isAllocation =
  typeof event.allocationAmount ===
  "number";

                        return (
                          <div
                            key={event.id}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              onOpenEvent(
                                event
                              )
                            }
                            onKeyDown={(
                              keyboardEvent
                            ) => {
                              if (
                                keyboardEvent.key ===
                                  "Enter" ||
                                keyboardEvent.key ===
                                  " "
                              ) {
                                keyboardEvent.preventDefault();

                                onOpenEvent(
                                  event
                                );
                              }
                            }}
                            className={
                              "flex cursor-pointer flex-col gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between " +
                              TYPE_STYLES[
                                event.type
                              ]
                            }
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-50">
  {isAllocation
    ? `💸 ${event.title.replace(/^💸\s*/, "")}`
    : event.title}
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

                              <p className="mt-1 text-[10px] text-slate-200/80">
                              {isAllocation ? (
  <>
    Reserved from paycheck
    {" · "}
    {new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(
      event.allocationAmount || 0
    )}

    {event.allocationPaid
      ? " · Paid"
      : ""}
  </>
) : (
  <>
    {event.type}

    {time
      ? ` · ${time}`
      : ""}

    {duration
      ? ` · ${duration}`
      : ""}
  </>
)}
                              </p>
                            </div>

                            {!isGeneratedEvent(
                              event
                            ) && (
                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={(
                                    mouseEvent
                                  ) => {
                                    mouseEvent.stopPropagation();

                                    onEdit(
                                      event
                                    );
                                  }}
                                  className="rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-[10px] font-semibold text-white"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={(
                                    mouseEvent
                                  ) => {
                                    mouseEvent.stopPropagation();

                                    onDelete(
                                      event
                                    );
                                  }}
                                  className="rounded-md border border-rose-500/50 bg-rose-500/15 px-2 py-1 text-[10px] font-semibold text-rose-100"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </section>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}