"use client";

import React, { useState } from "react";

type MoodArea = "Work" | "School" | "Family" | "Love" | "Money" | "Self-worth" | "Other";

function getCoaching(area: MoodArea, text: string) {
  const base = text.toLowerCase();

  if (area === "School") {
    return [
      "You have already proven you can learn under pressure — one exam does not erase that.",
      "Break what’s scaring you into a 20–25 minute study block and schedule it instead of carrying it in your chest.",
      "Talk to yourself like you would to someone you care about — you would never speak to them the way your inner critic speaks to you.",
    ];
  }

  if (area === "Work") {
    return [
      "You are not responsible for everyone’s feelings, only for your behavior and your boundaries.",
      "Before reacting, ask: 'Is this about my worth, or is this about a system that’s already broken?'",
      "Make a tiny after-shift ritual (music in the car, shower, skincare) to tell your body: 'We’re off duty now.'",
    ];
  }

  if (area === "Love") {
    return [
      "Your value is not measured by who texts back, how fast they reply, or who sees your worth right away.",
      "Protect your standards — the right person will be relieved, not scared, that you have them.",
      "Pull your energy back to your own life: gym, goals, home, kids. Love should add peace, not chaos.",
    ];
  }

  if (area === "Money") {
    return [
      "You can’t fix the whole money picture in one night. But one phone call or one plan is real progress.",
      "Write down the exact numbers. Hiding from them keeps your nervous system in a constant alarm.",
      "You deserve stability, not survival mode — and small consistent steps get you there.",
    ];
  }

  if (area === "Family") {
    return [
      "You are allowed to protect your children and your peace, even from people you love.",
      "You can care about someone and still say: 'I need distance to feel safe and sane.'",
      "You’re breaking patterns that were handed to you — that is heavy work, not weakness.",
    ];
  }

  if (area === "Self-worth") {
    return [
      "You are not behind — you are on a custom path with extra battles most people never see.",
      "Your softness, your fight, your compassion, and your honesty are not mistakes — they are your power.",
      "You are allowed to be proud of the woman you are becoming right now, not just the future version.",
    ];
  }

  // generic
  return [
    "Take a deep breath and put a hand on your chest. You are allowed to feel exactly what you feel right now.",
    "Ask: 'What do I need in the next 60 minutes?' Not in the next 6 months — just the next hour.",
    "You are not your worst day, your loudest thought, or your hardest season.",
  ];
}

export default function EmotionCoach() {
  const [area, setArea] = useState<MoodArea>("Other");
  const [text, setText] = useState("");
  const [show, setShow] = useState(false);

  const tips = getCoaching(area, text);

  function handleGenerate() {
    if (!text.trim() && area === "Other") {
      setShow(false);
      return;
    }
    setShow(true);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-100">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Emotion Coach
        </p>
        <p className="text-[11px] text-slate-400">
          Write what you&apos;re feeling and pick a category. This space mirrors back
          kindness and a tiny plan.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900/80 p-2 text-[11px]"
            value={area}
            onChange={(e) => setArea(e.target.value as MoodArea)}
          >
            <option>Work</option>
            <option>School</option>
            <option>Family</option>
            <option>Love</option>
            <option>Money</option>
            <option>Self-worth</option>
            <option>Other</option>
          </select>
          <textarea
            className="h-24 w-full rounded-md border border-slate-700 bg-slate-900/80 p-2 text-[11px]"
            placeholder="Type what you’re feeling, like you were texting a friend who really gets you..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Show me some gentle guidance
          </button>
        </div>

        {show && (
          <div className="space-y-2 rounded-md border border-slate-800 bg-slate-950/80 p-3">
            <p className="font-semibold text-slate-200">
              Gentle reminders for you:
            </p>
            <ul className="space-y-1 list-disc pl-4 text-[11px] text-slate-200">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}