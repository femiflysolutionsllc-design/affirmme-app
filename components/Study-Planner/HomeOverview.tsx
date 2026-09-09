"use client";

import React from "react";

// Study overview components that already live in Study-Planner
import LpnRoadmap from "./LpnRoadmap";
import TodayFocus from "./TodayFocus";
import TodayWin from "./TodayWin";
import WeeklyChecklist from "./WeeklyChecklist";
import ProStudyBoost from "./ProStudyBoost";
import StressCheckIn from "./StressCheckIn";

export default function HomeOverview() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-emerald-300">
          Study Overview
        </h2>
        <p className="text-xs text-slate-400">
          Snapshot of your LPN roadmap, focus, wins, and support tools.
        </p>
      </header>

      {/* Row 1: Roadmap + Today focus / win */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
          <LpnRoadmap />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <TodayFocus />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <TodayWin />
          </div>
        </div>
      </div>

      {/* Row 2: Weekly checklist + boosts / stress check */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
          <WeeklyChecklist />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <ProStudyBoost />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <StressCheckIn />
          </div>
        </div>
      </div>
    </section>
  );
}