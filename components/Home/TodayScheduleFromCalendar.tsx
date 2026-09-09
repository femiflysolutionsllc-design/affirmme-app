"use client";

import React, { useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type EventType =
  | "Gym"
  | "Study"
  | "Work"
  | "Appointment"
  | "Self-care"
  | "Other";

type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  title: string;
  type?: EventType;
};

export default function TodayScheduleFromCalendar() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [events] = usePersistentState<CalendarEvent[]>(
    "calendar_events_v2",
    []
  );

  const todaysEvents = useMemo(() => {
    return (events || [])
      .filter((e) => e.date === todayStr)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [events, todayStr]);

  return (
    <div className="home-schedule-shell rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
          Today&apos;s Schedule
        </p>
        <p className="text-[10px] text-slate-500">{todayStr}</p>
      </div>

      {todaysEvents.length === 0 ? (
        <p className="mt-2 text-[11px] text-slate-500">
          No events on your calendar for today yet. Add plans in the Calendar
          tab and they&apos;ll show up here.
        </p>
      ) : (
        <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {todaysEvents.map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-2 rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1.5"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-100">
                  {e.title}
                </p>
                <p className="text-[10px] text-slate-400">
                  {e.time ? e.time : "All day"}
                  {e.type ? ` · ${e.type}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-[10px] text-slate-500">
        This pulls directly from your AffirmMe calendar so your Home view always
        matches your real schedule.
      </p>
    </div>
  );
}