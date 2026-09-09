"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type BodyHormoneEntry = {
  id: string;
  date: string;
  cyclePhase: string;
  mood: string;
  notes: string;
  symptoms?: string[];
};

const CONTEXT_LABELS: Record<string, string> = {
  none: "General body check-in",
  general: "General body changes",
  period: "Period",
  follicular: "Follicular / after period",
  ovulation: "Ovulation",
  luteal_pms: "Luteal / PMS",
  pcos_irregular: "PCOS / irregular cycle",
  pregnancy_postpartum: "Pregnancy / postpartum",
  peri_menopause: "Perimenopause / menopause",
  hormone_medication: "Hormone medication / treatment",
};

function getContextLabel(value: string) {
  return CONTEXT_LABELS[value] || value || "General body check-in";
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HormoneLog() {
  const [entries, setEntries] = usePersistentState<BodyHormoneEntry[]>(
    "hormone_log_v1",
    []
  );

  function handleDelete(id: string) {
    setEntries(entries.filter((entry) => entry.id !== id));
  }

  const sortedEntries = [...(entries || [])].sort((first, second) =>
    second.date.localeCompare(first.date)
  );

  return (
    <section className="body-hormone-history space-y-4">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-emerald-300">
          Body & Hormone History
        </h2>

        <p className="text-xs text-slate-400">
          Your saved check-ins appear here automatically. Return to the top
          check-in to add or update today’s entry.
        </p>
      </header>

      {sortedEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center">
          <p className="text-3xl" aria-hidden="true">
            ✨
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-300">
            No saved check-ins yet
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Complete the Body & Hormone Check-In above and tap Save Today’s
            Check-In.
          </p>
        </div>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {sortedEntries.map((entry) => (
            <article
              key={entry.id}
              className="body-hormone-history-entry space-y-3 rounded-xl border border-slate-700 bg-slate-950/80 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-100">
                    {formatDate(entry.date)}
                  </p>

                  <p className="mt-1 text-[11px] font-semibold text-emerald-300">
                    {getContextLabel(entry.cyclePhase)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] text-rose-200 hover:bg-rose-500/20"
                  aria-label={`Delete check-in from ${formatDate(entry.date)}`}
                >
                  Delete
                </button>
              </div>

              {entry.symptoms && entry.symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {entry.symptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="rounded-full border border-purple-500/50 bg-purple-500/10 px-2 py-1 text-[10px] font-semibold text-purple-200"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              ) : null}

              {entry.mood ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    How I felt
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
                    {entry.mood}
                  </p>
                </div>
              ) : null}

              {entry.notes ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    {entry.notes}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}