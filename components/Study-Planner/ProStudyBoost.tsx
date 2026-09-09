"use client";

import React, { useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type BoostCheckKey =
  | "sessions"
  | "questions"
  | "review"
  | "selfCare";

type BoostChecks = Record<BoostCheckKey, boolean>;

const CHECK_ITEMS: {
  key: BoostCheckKey;
  label: string;
  hint: string;
}[] = [
  {
    key: "sessions",
    label: "I completed at least 3 focused study sessions this week.",
    hint: "Even 20–30 minute blocks count. Consistency beats marathons.",
  },
  {
    key: "questions",
    label: "I practiced with questions, flashcards, or active recall.",
    hint: "Testing what you remember helps learning stick.",
  },
  {
    key: "review",
    label: "I returned to something I found difficult.",
    hint: "Revisiting one weak area builds confidence over time.",
  },
  {
    key: "selfCare",
    label: "I protected my sleep, water, and one small joy.",
    hint: "A tired brain cannot show what it actually knows.",
  },
];

function scoreChecks(checks: BoostChecks): number {
  const completed = CHECK_ITEMS.filter(
    (item) => checks[item.key]
  ).length;

  return Math.round(
    (completed / CHECK_ITEMS.length) * 100
  );
}

function buildAdvice(
  score: number,
  checks: BoostChecks
): string {
  if (score === 100) {
    return "You created a strong, balanced study week. Zaryx recommends keeping this rhythm steady instead of adding pressure.";
  }

  if (score >= 70) {
    return "You’re building a good rhythm. Choose one unfinished habit and give it a small, focused effort before the week ends.";
  }

  if (score >= 40) {
    return "This week may have felt uneven, but it is not lost. Choose one small action you can complete today and let that be enough.";
  }

  if (!checks.selfCare) {
    return "Your brain may need care before more content. Protect one basic need tonight: sleep, water, food, movement, or a quiet reset.";
  }

  return "Start gently. One honest 20-minute focus block can turn feeling stuck into forward movement.";
}

export default function ProStudyBoost() {
  const [checks, setChecks] =
    usePersistentState<BoostChecks>(
      "pro_study_boost_checks",
      {
        sessions: false,
        questions: false,
        review: false,
        selfCare: false,
      }
    );

  const score = useMemo(
    () => scoreChecks(checks),
    [checks]
  );

  const coachAdvice = useMemo(
    () => buildAdvice(score, checks),
    [score, checks]
  );

  function toggleCheck(key: BoostCheckKey) {
    setChecks((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  function resetWeek() {
    setChecks({
      sessions: false,
      questions: false,
      review: false,
      selfCare: false,
    });
  }

  return (
    <section className="space-y-3 rounded-xl border border-emerald-700/60 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/60 p-4 text-xs">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-emerald-300">
            Zaryx Weekly Study Check
          </h3>

          <p className="mt-1 text-[11px] text-slate-400">
            A gentle check of the habits supporting your
            learning this week.
          </p>
        </div>

        <div className="rounded-full border border-emerald-500/40 bg-slate-950 px-3 py-1 text-right shadow-[0_0_20px_rgba(16,185,129,0.35)]">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Study rhythm
          </p>

          <p className="text-sm font-semibold text-emerald-300">
            {score}%
          </p>
        </div>
      </header>

      <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
        {CHECK_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start gap-2 text-[11px] text-slate-200"
          >
            <input
              type="checkbox"
              checked={checks[item.key]}
              onChange={() => toggleCheck(item.key)}
              className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 accent-emerald-500"
            />

            <span>
              <span className="font-medium">
                {item.label}
              </span>

              <br />

              <span className="text-[10px] text-slate-500">
                {item.hint}
              </span>
            </span>
          </label>
        ))}

        <button
          type="button"
          onClick={resetWeek}
          className="mt-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[10px] text-slate-300 hover:border-slate-500"
        >
          Start a fresh week
        </button>
      </div>

      <div className="space-y-1 rounded-lg border border-emerald-700/40 bg-emerald-500/5 p-3">
        <p className="text-[11px] font-semibold text-emerald-200">
          Zaryx Coach Note
        </p>

        <p className="text-[11px] text-slate-100">
          {coachAdvice}
        </p>

        <p className="text-[10px] text-slate-500">
          Recheck after your next few study blocks to see
          how your weekly rhythm changes.
        </p>
      </div>
    </section>
  );
}