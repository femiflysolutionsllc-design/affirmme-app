"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

export default function TodayWin() {
  const [win, setWin] = usePersistentState<string>("today_win", "");
  const [lesson, setLesson] = usePersistentState<string>("today_lesson", "");

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-200">Today&apos;s Win</h2>
        <p className="text-xs text-slate-400">
          End the day by honoring what you did right and what you learned.
        </p>
      </header>

      <textarea
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        rows={2}
        placeholder="What is one thing you did well today?"
        value={win}
        onChange={(e) => setWin(e.target.value)}
      />
      <textarea
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        rows={2}
        placeholder="What is one thing you would improve next time?"
        value={lesson}
        onChange={(e) => setLesson(e.target.value)}
      />
    </section>
  );
}