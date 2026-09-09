"use client";

import React, { useState } from "react";

type SubjectId =
  | "fundamentals"
  | "medsurg"
  | "pharm"
  | "peds"
  | "ob"
  | "psych"
  | "skills"
  | "nclex";

type Subject = {
  id: SubjectId;
  label: string;
  examples: string[];
};

const SUBJECTS: Subject[] = [
  {
    id: "fundamentals",
    label: "Fundamentals",
    examples: [
      "Maslow’s hierarchy & priority questions",
      "ADPIE (nursing process) – know what step each action is",
      "Vital signs norms & when to call the provider",
      "Delegation: what UAP/LPN/RN can and cannot do",
    ],
  },
  {
    id: "medsurg",
    label: "Med-Surg",
    examples: [
      "Heart failure – patho, assessment, priority interventions",
      "Pneumonia – assessment, oxygenation, ABGs basics",
      "Diabetes – hypo vs hyperglycemia treatment & teaching",
      "Electrolytes – K⁺, Na⁺, Ca²⁺ imbalances and EKG changes",
    ],
  },
  {
    id: "pharm",
    label: "Pharmacology",
    examples: [
      "Insulins – onset, peak, duration (rapid/short/intermediate/long)",
      "Cardiac meds – beta-blockers, ACE inhibitors, diuretics (nursing checks)",
      "Antibiotics – big side effects and teaching",
      "Safe med admin – rights, high-alert meds, double-checks",
    ],
  },
  {
    id: "peds",
    label: "Pediatrics",
    examples: [
      "Developmental milestones by age group",
      "Dehydration signs and basic fluid calculation ideas",
      "Resp illnesses: bronchiolitis, croup, asthma priorities",
      "Family-centered care & atraumatic care principles",
    ],
  },
  {
    id: "ob",
    label: "OB / Maternal",
    examples: [
      "Stages of labor & what happens in each",
      "Fetal heart rate patterns – early/late/variable decels",
      "Postpartum assessment (BUBBLE-HE)",
      "PPH risk factors & priority interventions",
    ],
  },
  {
    id: "psych",
    label: "Psych",
    examples: [
      "Therapeutic vs non-therapeutic communication",
      "Levels of anxiety & best interventions for each",
      "Suicide precautions & safety priorities",
      "Common psych meds – side effects & teaching",
    ],
  },
  {
    id: "skills",
    label: "Skills & Labs",
    examples: [
      "IV insertion basics & infiltration vs phlebitis",
      "Sterile technique & what breaks sterility",
      "Lab values: CBC, BMP, coag labs – know highs/lows",
      "Wound care basics & documentation phrases",
    ],
  },
  {
    id: "nclex",
    label: "NCLEX Strategy",
    examples: [
      "Priority frameworks: ABCs, safety, least restrictive, stable vs unstable",
      "Do 10–20 NCLEX-style questions and focus on rationales",
      "Practice eliminating 2 obviously wrong answers first",
      "Teach yourself the content behind every missed question",
    ],
  },
];

export default function StudySubjectsHelper() {
  const [active, setActive] = useState<SubjectId | null>(null);
  const current = SUBJECTS.find((s) => s.id === active) || null;

  return (
    <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-100">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-emerald-200">
          What should I study inside each subject?
        </h3>
        <p className="text-[11px] text-slate-400">
          Tap a subject to see specific ideas for a 20–30 minute focused block.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={
              "rounded-full border px-3 py-1 text-[11px] transition " +
              (active === s.id
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/90 p-3">
          <p className="text-[11px] font-semibold text-emerald-200 mb-1">
            {current.label} – example focused blocks
          </p>
          <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-200">
            {current.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-slate-500">
            Pick one of these and use it as your study focus for the day.
          </p>
        </div>
      )}
    </section>
  );
}