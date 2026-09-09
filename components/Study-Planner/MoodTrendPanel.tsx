"use client";

import React from "react";
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
  date: string;
  time?: string;
  title: string;
  type?: EventType;
};

type MoodEntry = {
  id: string;
  date?: string;
  timestamp?: string;
  value?: number;
  score?: number;
  emotion?: string;
  note?: string;
};

type MoodPoint = {
  id: string;
  date: string;
  label: string;
  value: number;
  emotion?: string;
  note?: string;
};

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getMoodLabel(score: number) {
  if (score <= 2) return "Very Low";
  if (score <= 4) return "Low";
  if (score === 5) return "Neutral";
  if (score <= 7) return "Good";
  if (score <= 9) return "Great";
  return "Excellent";
}

export default function MoodTrendPanel() {
  const [entries] = usePersistentState<MoodEntry[]>(
    "mood_checkin_entries_v1",
    []
  );

  const recentEntries = [...entries]
    .filter((entry) => {
      const value = entry.value ?? entry.score;
      return typeof value === "number";
    })
    .sort((a, b) => {
      const firstDate = a.timestamp ?? a.date ?? "";
      const secondDate = b.timestamp ?? b.date ?? "";

      return firstDate.localeCompare(secondDate);
    })
    .slice(-7);

  const points: MoodPoint[] = recentEntries.map((entry, index) => {
    const rawDate =
      entry.date ??
      (entry.timestamp
        ? getLocalDateKey(new Date(entry.timestamp))
        : getLocalDateKey(new Date()));

    const value = Math.max(
      0,
      Math.min(10, entry.value ?? entry.score ?? 0)
    );

    return {
      id: entry.id || `${rawDate}-${index}`,
      date: rawDate,
      label: formatDateLabel(rawDate),
      value,
      emotion: entry.emotion,
      note: entry.note,
    };
  });

  if (points.length === 0) {
    return (
      <section className="mood-trend-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
        <header className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-200">
            Mood Trends
          </h2>

          <p className="text-xs text-slate-400">
            Save your daily mood check-ins to reveal your seven-day pattern.
          </p>
        </header>

        <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-5 text-center">
          <p className="text-3xl" aria-hidden="true">
            📈
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-300">
            Your mood story will appear here
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Complete and save today’s Mood Check-In to create your first point.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mood-trend-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-200">
          Seven-Day Mood Trend
        </h2>

        <p className="text-xs text-slate-400">
          A gentle view of how your overall mood has been shifting.
        </p>
      </header>

      <div className="mt-5 space-y-4">
        {points.map((point) => (
          <div key={point.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {point.label}
                </p>

                {point.emotion ? (
                  <p className="text-[10px] text-slate-500">
                    {point.emotion}
                  </p>
                ) : null}
              </div>

              <p className="text-xs font-bold text-emerald-300">
                {point.value}/10 · {getMoodLabel(point.value)}
              </p>
            </div>

            <div
              className="h-3 overflow-hidden rounded-full bg-slate-800"
              role="img"
              aria-label={`${point.label}: ${point.value} out of 10`}
            >
              <div
                className="mood-trend-fill h-full rounded-full"
                style={{
                  width: `${point.value * 10}%`,
                  background:
                    "linear-gradient(90deg, #ff2d8d, #a855f7, #60a5fa, #f6c453)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}