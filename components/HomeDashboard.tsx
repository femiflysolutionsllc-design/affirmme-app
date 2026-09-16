"use client";

import React from "react";
import DailyAffirmation from "./affirmations/DailyAffirmation";
import TodayWin from "./TodayWin";
import GoalsBoard from "./GoalsBoard";
import { usePersistentState } from "../hooks/usePersistentState";


/**
 * Simple helpers to speak text out loud using the browser TTS.
 */
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    alert("Voice not available in this browser, but your plan is saved ❤️");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export default function HomeDashboard() {
  // morning + evening fields
  const [morningPlan, setMorningPlan] = usePersistentState<string>(
    "home_morning_plan",
    "Today I will show up for myself with calm focus and steady effort."
  );
  const [eveningRecap, setEveningRecap] = usePersistentState<string>(
    "home_evening_recap",
    ""
  );
  const [mood, setMood] = usePersistentState<string>("home_mood", "");
  const [improve, setImprove] = usePersistentState<string>(
    "home_improve",
    ""
  );

  // simple daily goals list
  const [goalsText, setGoalsText] = usePersistentState<string>(
    "home_goals_text",
    ""
  );

  const [schedule, setSchedule] = usePersistentState<string>(
    "home_schedule",
    ""
  ); 

  const morningSummary = `Good morning, Nicole. Here is your plan for today. 
  Main goals: ${goalsText || "Not set yet."}
  Schedule: ${schedule || "You haven’t written your schedule yet, but your time is yours to shape."}
  Morning focus: ${morningPlan}.`;


  const eveningSummary = `Good evening, Nicole. Here is your reflection for today. 
  Mood: ${mood || "Not recorded."}
  What went well: ${eveningRecap || "No notes yet."}
  What we can improve: ${improve || "No plan written yet, but tomorrow is a new chance."}`;

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const labelClass = "block text-xs font-medium text-slate-300 mb-1";

  return (
    <section className="space-y-4">
    
      {/* Top: Affirmation */}
      <DailyAffirmation />

    <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-200">
      Ready
    </div>
  

  <div className="mt-5 grid gap-3 md:grid-cols-2">
    <div className="rounded-xl bg-slate-800/80 p-4">
      <p className="text-xs font-bold uppercase text-emerald-300">
        Today’s Focus
      </p>
      <p className="mt-2 text-sm text-slate-200">{morningPlan}</p>
    </div>

    <div className="rounded-xl bg-slate-800/80 p-4">
      <p className="text-xs font-bold uppercase text-sky-300">
        Schedule
      </p>
      <p className="mt-2 text-sm text-slate-200">
        {schedule || "No schedule added yet."}
      </p>
    </div>
  </div>

  <button
    type="button"
    onClick={() => speak(morningSummary)}
    className="mt-5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20"
  >
    🔊 Read today’s briefing
  </button>


      {/* Daily goals + schedule summary (simple text for now) */}
      <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
  <h2 className="text-sm font-semibold text-slate-100">
    Today&apos;s Schedule
  </h2>
  <p className="text-[11px] text-slate-400">
    Work, gym, appointments, self-date, kids, etc.
  </p>
  <textarea
    className={inputClass}
    rows={4}
    placeholder="Work 7p–7a • Gym boxing 7pm • Self dinner date Friday 8pm..."
    value={schedule}
    onChange={(e) => setSchedule(e.target.value)}
  />
</div> 

        {/* Morning + Evening voice planner */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Voice Check-In
          </h2>

          <div className="space-y-2">
            <label className={labelClass}>Morning plan</label>
            <textarea
              className={inputClass}
              rows={2}
              value={morningPlan}
              onChange={(e) => setMorningPlan(e.target.value)}
              placeholder="Example: I will review cardiac meds and show up to work calmly and confidently."
            />
            <button
              type="button"
              onClick={() => speak(morningSummary)}
              className="mt-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/20 transition"
            >
              🔊 Read my morning plan
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className={labelClass}>Evening recap – what went well?</label>
            <textarea
              className={inputClass}
              rows={2}
              value={eveningRecap}
              onChange={(e) => setEveningRecap(e.target.value)}
              placeholder="Example: I finished my study block and handled a rough conversation calmly."
            />
            <label className={labelClass}>Mood &amp; what we can improve</label>
            <input
              className={inputClass}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Mood word (e.g., proud, tired, anxious, hopeful)"
            />
            <textarea
              className={inputClass}
              rows={2}
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="Tomorrow I will..."
            />
            <button
              type="button"
              onClick={() => speak(eveningSummary)}
              className="mt-1 rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              🔊 Read my evening reflection
            </button>
          </div>
        </div>
      </div>

      {/* Goals board snippet + TodayWin card at bottom */}
      <div className="grid gap-4 md:grid-cols-2">
        <GoalsBoard />
        <TodayWin />
      </div>
    </section>
  );
}