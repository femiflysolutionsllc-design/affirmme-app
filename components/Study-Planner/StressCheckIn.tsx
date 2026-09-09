"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type StressLevel = 1 | 2 | 3 | 4 | 5;

const STRESS_LEVELS: Array<{
  level: StressLevel;
  label: string;
  emoji: string;
}> = [
  { level: 1, label: "Calm", emoji: "😌" },
  { level: 2, label: "Mild", emoji: "🙂" },
  { level: 3, label: "Moderate", emoji: "😐" },
  { level: 4, label: "High", emoji: "😣" },
  { level: 5, label: "Overwhelmed", emoji: "🤯" },
];

function getStressAdvice(level: StressLevel, triggerNotes: string) {
  if (level <= 2) {
    return "You’re doing okay. Protect that balance with hydration, movement, or a five-minute breathing break.";
  }

  if (level === 3) {
    return "Stress is building. Choose one small action: five deep belly breaths, a short walk, or a ten-minute break.";
  }

  if (level === 4) {
    return "Stress is high. Step away from screens for 5–10 minutes, stretch, and contact someone safe. Break tasks into tiny steps.";
  }

  return triggerNotes
    ? `You’re feeling overwhelmed. Pause everything non-urgent and ground yourself: notice five things you see, four you feel, and three you hear. Your main trigger is: ${triggerNotes}. Be gentle with yourself.`
    : "You’re feeling overwhelmed. Pause everything non-urgent and ground yourself: notice five things you see, four you feel, and three you hear. Be gentle with yourself.";
}

export default function StressCheckIn() {
  const [stress, setStress] = usePersistentState<StressLevel>(
    "stress_level",
    3
  );

  const [notes, setNotes] = usePersistentState<string>("stress_notes", "");

  const selectedStress =
    STRESS_LEVELS.find((item) => item.level === stress) ?? STRESS_LEVELS[2];

  const advice = getStressAdvice(stress, notes.trim());

  return (
    <section className="stress-check-in space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-emerald-300">
          Stress Check-In
        </h2>

        <p className="text-sm text-slate-400">
          How much stress are you feeling right now?
        </p>
      </header>

      <div
        className="stress-status-badge flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-900/70 p-3"
        aria-live="polite"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Current Stress Level
          </p>

          <p className="mt-1 text-sm font-bold text-slate-100">
            {stress}/5 · {selectedStress.label}
          </p>
        </div>

        <span className="text-4xl" aria-hidden="true">
          {selectedStress.emoji}
        </span>
      </div>

      <div
        className="grid grid-cols-5 gap-2"
        role="group"
        aria-label="Choose your current stress level"
      >
        {STRESS_LEVELS.map((item) => {
          const isSelected = stress === item.level;

          return (
            <button
              key={item.level}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${item.level} out of 5, ${item.label}`}
              onClick={() => setStress(item.level)}
              className={`stress-level-button flex min-h-16 flex-col items-center justify-center rounded-xl border px-1 py-2 transition ${
                isSelected
                  ? "is-active border-emerald-400 bg-emerald-500 text-slate-950"
                  : "border-slate-600 text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="text-sm font-black">{item.level}</span>

              <span className="mt-1 text-[9px] font-semibold leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Calm</span>
          <span>Overwhelmed</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="stress-meter-fill h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-pink-500 transition-all duration-300"
            style={{ width: `${stress * 20}%` }}
            role="img"
            aria-label={`Stress meter: ${stress} out of 5`}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="stress-notes"
          className="text-xs font-medium text-slate-300"
        >
          What’s stressing you right now?
        </label>

        <textarea
          id="stress-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Example: exams, work shift, family, money, relationship..."
        />
      </div>

      <div className="stress-coach-card rounded-md border border-emerald-700/40 bg-emerald-950/30 px-3 py-3 text-sm text-emerald-100">
        <p className="mb-1 text-xs uppercase tracking-wide text-emerald-400">
        Zaryx Coach Suggestion 
        </p>

        <p>{advice}</p>
      </div>
    </section>
  );
}