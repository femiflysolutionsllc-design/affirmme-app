"use client";

import React, { useState } from "react";

// Affirmation + mood
import DailyAffirmation from "../affirmations/DailyAffirmation";
import MoodCheckIn from "../affirmations/MoodCheckIn";

// Study-planner / mind-mood pieces
import TodayWin from "./TodayWin";
import StressCheckIn from "./StressCheckIn";
import MeditationCoach from "./MeditationCoach";
import GoalsBoard from "./GoalsBoard";
import TriggerCoach from "./TriggerCoach";
import HormoneReflection from "./HormoneReflection";
import MindMoodAddOns from "./MindMoodAddOns";
import { useDailyStreak } from "../affirmations/useDailyStreak";

type SubTab = "overview" | "goals" | "triggers" | "hormones";

const subTabs: { id: SubTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "goals", label: "Goals" },
  { id: "triggers", label: "Trigger Coach" },
  { id: "hormones", label: "Hormone Reflections" },
];

export default function MindMoodPanel() {
  const [subTab, setSubTab] = useState<SubTab>("overview");

const levelKey = "general";
const { streak, isToday, checkInToday } = useDailyStreak();
  return (
    <section className="space-y-4 text-slate-100">
      {/* Header */}
      <header className="space-y-2">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-emerald-300">
      Mind &amp; Mood
    </h2>

    <button
      type="button"
      onClick={checkInToday}
      disabled={isToday}
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
        isToday
          ? "border-slate-700 bg-slate-900/60 text-slate-400 cursor-not-allowed"
          : "border-emerald-400 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
      }`}
    >
      🔥 {streak} day streak
    </button>
  </div>

  <p className="text-xs text-slate-400">
    Check in with your mind, track stress, and give yourself support.
  </p>
</header>

      {/* Sub-tabs */}
      <nav className="flex flex-wrap gap-2 text-xs font-semibold">
        {subTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={
              "rounded-full border px-3 py-1 transition " +
              (subTab === id
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500")
            }
          >
            {label}
          </button>
        ))}
      </nav>

      {/* CONTENT WRAPPER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
        {/* OVERVIEW TAB */}
        {subTab === "overview" && (
          <div className="space-y-4">
            {/* Top grid: Affirmation + Mood */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <h3 className="text-sm font-semibold text-emerald-200">
                  Daily Affirmation
                </h3>
                <DailyAffirmation />
              </div>

              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <h3 className="text-sm font-semibold text-emerald-200">
                  Mood Check-In
                </h3>
                <MoodCheckIn />
              </div>
            </div>

            {/* Middle grid: Today’s win + Stress level */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <h3 className="text-sm font-semibold text-emerald-200">
                  Today&apos;s Win
                </h3>
                <TodayWin />
              </div>

              <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <h3 className="text-sm font-semibold text-emerald-200">
                  Stress Level
                </h3>
                {/* Your existing stress slider component */}
                <StressCheckIn />          
              </div>
            </div>

            {/* Meditation section – everything about meditation lives here */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <h3 className="text-sm font-semibold text-emerald-200">
                Meditation
              </h3>
              <p className="text-[11px] text-slate-400">
                Use this space to calm your nervous system. Later we can plug in
                background sounds and timers.
              </p>
              <MeditationCoach />
            </div>
          </div>    
        )}

        {/* GOALS TAB */}
        {subTab === "goals" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-200">
              Goals with AI Support
            </h3>
            <p className="text-[11px] text-slate-400">
              Write your goals, check them off when you&apos;re done, and let the
              planner suggest simple steps to get there.
            </p>
            {/* GoalsBoard already has: add goal, mark done, AI plan helper */}
            <GoalsBoard />
          </div>
        )}

{/* TRIGGER COACH TAB */}
{subTab === "triggers" && (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-emerald-200">Trigger Coach</h3>
    <p className="text-[11px] text-slate-400">
      Log what set you off, how your body reacted, the response you want to practice next time,
      and see AI coaching tips for each trigger.
    </p>

    <TriggerCoach />
    <MindMoodAddOns levelKey={levelKey} />
  </div>
)}

        {/* HORMONE REFLECTION TAB */}
        {subTab === "hormones" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-200">
              Hormone Reflections
            </h3>
            <p className="text-[11px] text-slate-400">
              Track how your mood, energy, and symptoms line up with your cycle.
            </p>
            <HormoneReflection />
          </div>
        )}
      </div>
    </section>
  );
}