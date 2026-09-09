"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type HormoneEntry = {
  id: string;
  date: string;
  cyclePhase: string;
  mood: string;
  notes: string;
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

function summarizeEntries(entries: HormoneEntry[]) {
  const combinedText = entries
    .map((entry) => `${entry.mood} ${entry.notes}`.toLowerCase())
    .join(" ");

  const lowerEnergyWords = [
    "tired",
    "low",
    "drained",
    "exhausted",
    "fog",
    "anxious",
    "restless",
    "irritable",
  ];

  const steadierWords = [
    "focused",
    "calm",
    "energized",
    "strong",
    "steady",
    "motivated",
    "rested",
  ];

  const lowerEnergyCount = lowerEnergyWords.filter((word) =>
    combinedText.includes(word)
  ).length;

  const steadierCount = steadierWords.filter((word) =>
    combinedText.includes(word)
  ).length;

  if (steadierCount > lowerEnergyCount) {
    return "In these entries, you used more words connected with steadier energy or focus. Consider what routines may have supported you.";
  }

  if (lowerEnergyCount > steadierCount) {
    return "In these entries, you used more words connected with lower energy or discomfort. Consider lighter tasks, additional rest, or support when this pattern returns.";
  }

  return "Your entries show a mixed pattern so far. Continue tracking mood, energy, sleep, and symptoms to make the pattern clearer.";
}

export default function HormonePatternHints() {
  const [entries] = usePersistentState<HormoneEntry[]>(
    "hormone_log_v1",
    []
  );

  const safeEntries = entries || [];
  const requiredEntries = 3;
  const progress = Math.min(
    100,
    Math.round((safeEntries.length / requiredEntries) * 100)
  );

  if (safeEntries.length < requiredEntries) {
    return (
      <section className="body-pattern-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
        <header className="space-y-1">
          <h2 className="text-sm font-semibold text-emerald-300">
            Building Your Patterns
          </h2>

          <p className="text-xs text-slate-400">
          Save at least three daily check-ins so Zaryx can begin reflecting
your personal patterns.
          </p>
        </header>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Entries collected</span>

            <span className="font-bold text-emerald-300">
              {safeEntries.length}/{requiredEntries}
            </span>
          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="body-pattern-fill h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="img"
              aria-label={`${safeEntries.length} of ${requiredEntries} entries collected`}
            />
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          These reflections are based only on information you choose to save
          and are not medical diagnoses.
        </p>
      </section>
    );
  }

  const groupedEntries: Record<string, HormoneEntry[]> = {};

  for (const entry of safeEntries) {
    const context = entry.cyclePhase || "none";

    if (!groupedEntries[context]) {
      groupedEntries[context] = [];
    }

    groupedEntries[context].push(entry);
  }

  const contextSummaries = Object.entries(groupedEntries)
    .map(([context, contextEntries]) => ({
      context,
      label: getContextLabel(context),
      count: contextEntries.length,
      summary: summarizeEntries(contextEntries),
    }))
    .sort((first, second) => second.count - first.count);

  const largestCount = Math.max(
    ...contextSummaries.map((summary) => summary.count),
    1
  );

  return (
    <section className="body-pattern-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-emerald-300">
          Zaryx Pattern Review
        </h2>

        <p className="text-xs text-slate-400">
          Gentle observations from your own body, mood, energy, and hormone
          entries.
        </p>
      </header>

      <div className="mt-4 space-y-3">
        {contextSummaries.map((item) => (
          <article
            key={item.context}
            className="body-pattern-row rounded-lg border border-slate-700 bg-slate-900/80 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-semibold text-emerald-200">
                {item.label}
              </h3>

              <span className="text-[10px] font-bold text-slate-400">
                {item.count} {item.count === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400"
                style={{
                  width: `${Math.max(
                    12,
                    Math.round((item.count / largestCount) * 100)
                  )}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
              {item.summary}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-3 text-[10px] text-slate-500">
        These are non-medical reflections based only on information you choose
        to save.
      </p>
    </section>
  );
}