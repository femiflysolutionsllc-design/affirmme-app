// components/Study-Planner/HormoneReflection.tsx
"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type TrackingContext =
  | "none"
  | "general"
  | "period"
  | "follicular"
  | "ovulation"
  | "luteal_pms"
  | "pcos_irregular"
  | "pregnancy_postpartum"
  | "peri_menopause"
  | "hormone_medication";

type SavedBodyEntry = {
  id: string;
  date: string;
  cyclePhase: string;
  mood: string;
  notes: string;
  symptoms?: string[];
};

const TRACKING_CONTEXTS: Array<{
  value: TrackingContext;
  label: string;
}> = [
  { value: "none", label: "Not tracking / doesn’t apply" },
  { value: "general", label: "General body changes" },
  { value: "period", label: "Period" },
  { value: "follicular", label: "Follicular / after period" },
  { value: "ovulation", label: "Ovulation" },
  { value: "luteal_pms", label: "Luteal / PMS" },
  { value: "pcos_irregular", label: "PCOS / irregular cycle" },
  {
    value: "pregnancy_postpartum",
    label: "Pregnancy / postpartum",
  },
  {
    value: "peri_menopause",
    label: "Perimenopause / menopause",
  },
  {
    value: "hormone_medication",
    label: "Hormone medication / treatment",
  },
];

const SYMPTOM_OPTIONS = [
  "Low energy",
  "Brain fog",
  "Sleep changes",
  "Headache",
  "Anxious",
  "Irritable",
  "Mood changes",
  "Cramps",
  "Bloating",
  "Tender breasts",
  "Hot flashes",
  "Appetite / cravings",
  "Skin changes",
  "Libido changes",
];

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createEntryId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}`;
}

function getContextInsight(context: TrackingContext, mood: string) {
  switch (context) {
    case "general":
      return "Body and mood changes can be influenced by sleep, stress, nutrition, medication, and hormones. Track a few days and look for patterns without judging yourself.";

    case "period":
      return "Energy and comfort can change during a period. Rest, warmth, hydration, and gentle movement may help. Your needs can be different from one cycle to another.";

    case "follicular":
      return "Some people notice increasing energy during this phase. Consider using that energy for planning, studying, movement, or starting a manageable task.";

    case "ovulation":
      return "Some people notice changes in energy, confidence, focus, or physical symptoms around ovulation. Record what is true for you instead of expecting a specific experience.";

    case "luteal_pms":
      return "Sleep, appetite, energy, and emotions may shift during this phase. Reduce unnecessary pressure and notice whether additional rest or support helps.";

    case "pcos_irregular":
      return "With PCOS or irregular cycles, patterns may not follow a predictable calendar. Tracking symptoms, mood, sleep, and bleeding can help you understand your individual rhythm.";

    case "pregnancy_postpartum":
      return "Pregnancy and postpartum changes can affect energy, sleep, mood, and comfort. Track gently and contact a healthcare professional if a symptom feels concerning or difficult to manage.";

    case "peri_menopause":
      return "Perimenopause and menopause can affect sleep, temperature, focus, energy, and mood. Tracking changes can help you describe patterns clearly when seeking support.";

    case "hormone_medication":
      return "Medication and hormone treatment can affect people differently. Note timing, sleep, mood, energy, and physical changes so you can discuss patterns with your healthcare professional.";

    default:
      return mood.trim()
        ? "Your experience may be influenced by sleep, stress, nutrition, medication, health, or hormones. Continue tracking only what feels useful to you."
        : "Choose what applies to you, or simply track your mood and body changes without selecting a cycle or hormone category.";
  }
}

export default function HormoneReflection() {
  const [context, setContext] = usePersistentState<TrackingContext>(
    "cycle_phase",
    "none"
  );

  const [mood, setMood] = usePersistentState<string>(
    "cycle_mood_notes",
    ""
  );

  const [symptoms, setSymptoms] = usePersistentState<string[]>(
    "cycle_symptoms",
    []
  );

  const [entries, setEntries] = usePersistentState<SavedBodyEntry[]>(
    "hormone_log_v1",
    []
  );

  const [savedMessage, setSavedMessage] = React.useState("");

  const canSave =
    context !== "none" ||
    symptoms.length > 0 ||
    Boolean(mood.trim());

  function toggleSymptom(label: string) {
    if (symptoms.includes(label)) {
      setSymptoms(symptoms.filter((symptom) => symptom !== label));
    } else {
      setSymptoms([...symptoms, label]);
    }

    setSavedMessage("");
  }

  function saveTodayCheckIn() {
    if (!canSave) return;

    const today = getLocalDateKey();
    const existingEntry = entries.find((entry) => entry.date === today);

    const newEntry: SavedBodyEntry = {
      id: existingEntry?.id || createEntryId(),
      date: today,
      cyclePhase: context,
      mood: mood.trim(),
      notes: existingEntry?.notes || "",
      symptoms: [...symptoms],
    };

    const updatedEntries = existingEntry
      ? entries.map((entry) =>
          entry.date === today ? newEntry : entry
        )
      : [newEntry, ...entries];

    setEntries(updatedEntries);

    setSavedMessage(
      existingEntry
        ? "Today’s check-in was updated."
        : "Today’s check-in was saved."
    );
  }

  const insight = getContextInsight(context, mood);

  return (
    <section className="body-hormone-check space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-emerald-300">
          Body & Hormone Check-In
        </h2>

        <p className="text-sm text-slate-400">
          Notice patterns across your mood, energy, sleep, body, hormones,
          or cycle. Track only what applies to you.
        </p>
      </header>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-300">
          What applies to you today?
        </p>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Choose a body, hormone, or cycle context"
        >
          {TRACKING_CONTEXTS.map((item) => {
            const isActive = context === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setContext(item.value);
                  setSavedMessage("");
                }}
                className={`hormone-context-button rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "is-active border-emerald-400 bg-emerald-500 text-slate-900"
                    : "border-slate-600 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-300">
          What changes or symptoms do you notice?
        </p>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Select any symptoms or changes"
        >
          {SYMPTOM_OPTIONS.map((label) => {
            const isActive = symptoms.includes(label);

            return (
              <button
                key={label}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggleSymptom(label)}
                className={`hormone-symptom-button rounded-full border px-3 py-1.5 text-xs ${
                  isActive
                    ? "is-active border-sky-400 bg-sky-500/80 text-slate-900"
                    : "border-slate-600 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="body-hormone-notes"
          className="text-xs font-medium text-slate-300"
        >
          How do you feel today?
        </label>

        <textarea
          id="body-hormone-notes"
          rows={3}
          value={mood}
          onChange={(e) => {
            setMood(e.target.value);
            setSavedMessage("");
          }}
          className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Example: focused, tired, calm, sensitive, warm, restless..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveTodayCheckIn}
          disabled={!canSave}
          className="body-hormone-save-button rounded-lg border border-emerald-400 bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save Today’s Check-In
        </button>

        {savedMessage ? (
          <p
            className="text-[11px] font-semibold text-emerald-300"
            role="status"
          >
            {savedMessage}
          </p>
        ) : null}
      </div>

      <div className="hormone-insight-card rounded-md border border-sky-700/40 bg-sky-950/40 px-3 py-3 text-sm text-sky-100">
        <p className="mb-1 text-xs uppercase tracking-wide text-sky-400">
          Pattern Insight
        </p>

        <p>{insight}</p>
      </div>
    </section>
  );
}