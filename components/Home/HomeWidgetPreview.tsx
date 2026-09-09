"use client";

import React from "react";

export default function HomeWidgetPreview() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
        Home Widget Preview (Future)
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        This is how an AffirmMe widget could look on your phone&apos;s home
        screen: quick affirmation, mood, and today&apos;s focus.
      </p>

      <div className="mt-3 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-3 text-[10px]">
        <p className="text-[10px] font-semibold text-emerald-300">
          AffirmMe · Today
        </p>
        <p className="mt-1 text-[10px] text-slate-100">
          “I am rebuilding my life one powerful choice at a time.”
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-400">Mood</p>
            <p className="text-[10px] text-emerald-200">6/10 · Gentle</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400">Today&apos;s focus</p>
            <p className="text-[10px] text-emerald-200">
              20 min · Med-Surg review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}