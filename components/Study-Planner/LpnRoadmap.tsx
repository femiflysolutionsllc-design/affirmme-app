"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

// ----------------- Types & Data -----------------

type LpnWeekKey = "w1_4" | "w5_8" | "w9_12";
type TaskStatus = "todo" | "doing" | "done";

type WeekSection = {
  id: LpnWeekKey;
  title: string;
  subtitle: string;
  bullets: string[];
};

const WEEK_SECTIONS: WeekSection[] = [
  {
    id: "w1_4",
    title: "Weeks 1–4 · Build your base",
    subtitle:
      "Lock in Fundamentals, Med-Surg basics, Pharm safety, and short question sets.",
    bullets: [
      "Fundamentals focus 2–3×/week: Maslow, ADPIE, vitals, safety, infection control, delegation rules (what LPN can / cannot do).",
      "Med-Surg core: heart failure, COPD, pneumonia, diabetes, post-op complications, fluid & electrolytes.",
      "Pharm basics: insulins, cardiac meds, pain meds, anticoagulants. Make one tiny drug chart each week.",
      "Do short 10–20 question sets (untimed) and review why the right answer is right.",
    ],
  },
  {
    id: "w5_8",
    title: "Weeks 5–8 · Add specialties + stamina",
    subtitle:
      "Rotate OB / Peds / Psych, build skills, and stretch your question sets.",
    bullets: [
      "Rotate weekly: one block for OB / Maternal and one for Peds (PPH, preeclampsia, FHR patterns, milestones, dehydration, resp distress).",
      "Psych 1×/week: therapeutic communication, anxiety levels, suicide / safety priorities.",
      "Skills & labs: sterile technique, IV complications, wound care, restraints, seizure / fall precautions, basic labs (Na⁺, K⁺, Hgb/Hct, BUN/Cr).",
      "Bump to 25–35 question sets, timed. Practice reading the stem slowly and using ABC / Maslow / safety rules.",
    ],
  },
  {
    id: "w9_12",
    title: "Weeks 9–12 · NCLEX-PN dress rehearsal",
    subtitle:
      "Shift into mixed-subject sets, realistic timing, and gentle review the final week.",
    bullets: [
      "2–3 mixed-question sessions per week (all subjects). Aim for 50–75 questions/session by Week 12.",
      "After each set, log your weak patterns in Subject Helper and add a 20–30 min review block the next day.",
      "Weekly “mini mock”: one block where you sit, no phone, exam-style timing, and treat it like the real test.",
      "Last week: light review only — no cramming. Sleep, hydration, and 1–2 calm practice sets just to stay warm.",
    ],
  },
];

// ----------------- Helpers -----------------

function getTaskId(weekId: LpnWeekKey, index: number): string {
  return `${weekId}-${index}`;
}

function statusLabel(status: TaskStatus): string {
  if (status === "doing") return "In progress";
  if (status === "done") return "Done";
  return "Not started";
}

function statusClasses(status: TaskStatus): string {
  switch (status) {
    case "doing":
      return "border-amber-400 bg-amber-500/10 text-amber-200";
    case "done":
      return "border-emerald-400 bg-emerald-500/15 text-emerald-200";
    default:
      return "border-slate-600 bg-slate-900/80 text-slate-300";
  }
}

// ----------------- Component -----------------

export default function LpnRoadmap() {
  // Per-task status (todo / doing / done)
  const [taskStatus, setTaskStatus] = usePersistentState<
    Record<string, TaskStatus>
  >("lpn_roadmap_tasks_v2", {} as any);

  // Which week cards are expanded
  const [openSections, setOpenSections] = usePersistentState<
    Record<LpnWeekKey, boolean>
  >("lpn_roadmap_open_v1", {
    w1_4: true,
    w5_8: true,
    w9_12: true,
  });

  // Free-form weekly plan notes
  const [weeklyPlan, setWeeklyPlan] = usePersistentState<string>(
    "lpn_roadmap_weekly_plan_v1",
    ""
  );

  // ---- Derived progress ----
  const allTaskIds = WEEK_SECTIONS.flatMap((week) =>
    week.bullets.map((_, i) => getTaskId(week.id, i))
  );
  const totalTasks = allTaskIds.length;
  const doneCount = allTaskIds.filter(
    (id) => taskStatus[id] === "done"
  ).length;
  const progressPct =
    totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

  // ---- Handlers ----

  function toggleSection(id: LpnWeekKey) {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function cycleTaskStatus(taskId: string) {
    setTaskStatus((prev) => {
      const current: TaskStatus = prev[taskId] ?? "todo";
      const next: TaskStatus =
        current === "todo" ? "doing" : current === "doing" ? "done" : "todo";
      return {
        ...prev,
        [taskId]: next,
      };
    });
  }

  function handleQuickPlanGenerate() {
    const planText =
      "Sample weekly plan for LPN NCLEX-PN:\n" +
      "• 2 fundamentals blocks (Maslow, safety, delegation)\n" +
      "• 2 med-surg blocks (one cardiac/resp, one diabetes/post-op)\n" +
      "• 1 pharm safety block (insulins, anticoagulants, high-risk meds)\n" +
      "• 1 specialty block (rotate OB / Peds / Psych)\n" +
      "• 2 question sets (25–35 questions each, timed)\n" +
      "\nEdit this to match your real schedule for the week.";
    setWeeklyPlan(planText);
  }

  // ----------------- UI -----------------

  return (
    <div className="space-y-4">
      {/* Overall progress header */}
      <section className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-4 text-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-emerald-300">
              LPN · 12-week NCLEX-PN + Core Skills Roadmap
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              This roadmap keeps you rotating through{" "}
              <span className="font-semibold text-emerald-200">
                Fundamentals, Med-Surg, Pharmacology, OB, Peds, Psych, Skills
              </span>{" "}
              while you build test stamina for the NCLEX-PN.
            </p>
          </div>

          <div className="mt-2 flex flex-col items-start gap-1 text-[11px] sm:mt-0 sm:items-end">
            <span className="text-slate-400">
              Overall roadmap progress:{" "}
              <span className="font-semibold text-emerald-300">
                {progressPct}%
              </span>
            </span>
            <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500">
              Tip: mark tasks as{" "}
              <span className="text-emerald-300">In progress</span> or{" "}
              <span className="text-emerald-300">Done</span> as you go.
            </span>
          </div>
        </div>
      </section>

      {/* Week sections */}
      {WEEK_SECTIONS.map((week) => (
        <section
          key={week.id}
          className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 text-xs shadow-sm"
        >
          <button
            type="button"
            onClick={() => toggleSection(week.id)}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <div>
              <h4 className="text-sm font-semibold text-emerald-300">
                {week.title}
              </h4>
              <p className="mt-1 text-[11px] text-slate-400">
                {week.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>
                {
                  week.bullets.filter((_, i) => {
                    const id = getTaskId(week.id, i);
                    return taskStatus[id] === "done";
                  }).length
                }{" "}
                / {week.bullets.length} done
              </span>
              <span
                className={
                  "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition " +
                  (openSections[week.id]
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-600 bg-slate-900 text-slate-300")
                }
              >
                {openSections[week.id] ? "−" : "+"}
              </span>
            </div>
          </button>

          {openSections[week.id] && (
            <div className="mt-3 space-y-2">
              {week.bullets.map((text, index) => {
                const id = getTaskId(week.id, index);
                const status: TaskStatus = taskStatus[id] ?? "todo";

                return (
                  <div
                    key={id}
                    className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-950/90 p-2"
                  >
                    <button
                      type="button"
                      onClick={() => cycleTaskStatus(id)}
                      className={
                        "mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition " +
                        statusClasses(status)
                      }
                    >
                      {status === "todo" && "○"}
                      {status === "doing" && "◐"}
                      {status === "done" && "●"}
                      <span>{statusLabel(status)}</span>
                    </button>
                    <p
                      className={
                        "text-[11px] " +
                        (status === "done"
                          ? "text-slate-500 line-through"
                          : "text-slate-200")
                      }
                    >
                      {text}
                    </p>
                  </div>
                );
              })}

              <p className="mt-1 text-[10px] text-slate-500">
                Use{" "}
                <span className="font-semibold text-emerald-200">
                  In progress
                </span>{" "}
                when you&apos;re halfway through a block, and{" "}
                <span className="font-semibold text-emerald-200">Done</span>{" "}
                once that task feels solid enough to move on.
              </p>
            </div>
          )}
        </section>
      ))}

      {/* Weekly plan helper */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-emerald-300">
              Weekly LPN study plan
            </h4>
            <p className="mt-1 text-[11px] text-slate-400">
              Use this space to sketch your real-life plan for the week:
              which days you&apos;ll do Fundamentals, Med-Surg, Pharm,
              specialties, and question sets.
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickPlanGenerate}
            className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-500/60 hover:bg-slate-800"
          >
            Auto-fill sample plan
          </button>
        </div>

        <textarea
          className="mt-3 h-28 w-full resize-none rounded-md border border-slate-700 bg-slate-900/90 p-2 text-[11px] text-slate-100"
          placeholder="Example: Mon – Fundamentals + 25 questions, Wed – Med-Surg, Fri – Pharm + OB/Peds rotation, Sun – review & mini mock."
          value={weeklyPlan}
          onChange={(e) => setWeeklyPlan(e.target.value)}
        />

        <p className="mt-1 text-[10px] text-slate-500">
          This note is saved just for the{" "}
          <span className="font-semibold text-emerald-200">LPN roadmap</span>.
          You can update it each week as your schedule changes.
        </p>
      </section>
    </div>
  );
}

export const LPN_ROADMAP = [];