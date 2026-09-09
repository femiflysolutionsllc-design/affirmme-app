"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

// ----------------- Types & Data -----------------

type RnWeekKey = "w1_4" | "w5_8" | "w9_12";
type TaskStatus = "todo" | "doing" | "done";

type WeekSection = {
  id: RnWeekKey;
  title: string;
  subtitle: string;
  bullets: string[];
};

const WEEK_SECTIONS: WeekSection[] = [
  {
    id: "w1_4",
    title: "Weeks 1–4 · RN foundations + prioritization",
    subtitle:
      "Tighten Fundamentals, Med-Surg, and safety at RN level while you warm up your test brain.",
    bullets: [
      "Fundamentals 2–3×/week: RN scope vs LPN/UAP, delegation, supervision, legal/ethical, safety bundles (falls, restraints, sepsis).",
      "Med-Surg core: cardiac (MI, HF, dysrhythmias), respiratory (COPD, pneumonia, ARDS), endocrine (DKA, HHS, thyroid).",
      "NCLEX-RN style questions: focus on priority/first questions and safety (infection control, isolation, high-alert meds).",
      "Start SATA practice: do small 5–10 question sets and review why each option is right or wrong.",
    ],
  },
  {
    id: "w5_8",
    title: "Weeks 5–8 · Advanced systems + clinical judgment",
    subtitle:
      "Push into neuro, renal, and shock. Practice clinical judgment steps on every question.",
    bullets: [
      "Rotate systems: neuro (stroke, ICP, seizures), renal (AKI, CKD, dialysis), shock/sepsis. Focus on early vs late signs.",
      "Pathophysiology refresh: for each big disease, write a 3-line story: cause → main problem → key nursing priorities.",
      "Interpret more complex labs & diagnostics (ABGs, troponin, BNP, creatinine, lactate, EKG basics).",
      "Do 25–35 question blocks 2×/week, mixed systems. After each block, write 2–3 ‘clinical judgment’ steps you used.",
    ],
  },
  {
    id: "w9_12",
    title: "Weeks 9–12 · RN leadership + NCLEX-RN dress rehearsal",
    subtitle:
      "Layer in leadership/management and simulate real NCLEX blocks with review instead of cramming.",
    bullets: [
      "Leadership & management: staffing, conflict resolution, quality improvement, incident reports, just culture, prioritizing assignments.",
      "Refine delegation & assignment at RN level: who gets the unstable pt, new admit, fresh post-op, and who can be delegated to LPN/UAP.",
      "Weekly ‘mock block’: 60–75 questions, timed. Immediately review rationales and log patterns in Subject Helper.",
      "Last 1–2 weeks: light content review, focus on weak patterns and mindset (sleep, hydration, calm practice instead of all-night cramming).",
    ],
  },
];

// ----------------- Helpers -----------------

function getTaskId(weekId: RnWeekKey, index: number): string {
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

export default function RnRoadmap() {
  // Per-task status (todo / doing / done)
  const [taskStatus, setTaskStatus] = usePersistentState<
    Record<string, TaskStatus>
  >("rn_roadmap_tasks_v1", {} as any);

  // Which week cards are expanded
  const [openSections, setOpenSections] = usePersistentState<
    Record<RnWeekKey, boolean>
  >("rn_roadmap_open_v1", {
    w1_4: true,
    w5_8: true,
    w9_12: true,
  });

  // Free-form weekly plan notes
  const [weeklyPlan, setWeeklyPlan] = usePersistentState<string>(
    "rn_roadmap_weekly_plan_v1",
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

  function toggleSection(id: RnWeekKey) {
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
      "Sample weekly plan for RN prep:\n" +
      "• 1–2 system blocks (cardiac/resp or neuro/renal)\n" +
      "• 1 fundamentals/leadership block (delegation, safety, management)\n" +
      "• 2 mixed NCLEX-RN blocks (25–50 questions each)\n" +
      "• 1 lab/diagnostic review block (ABGs, EKG snippets, labs)\n" +
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
              RN · 12-week NCLEX-RN + Clinical Judgment Roadmap
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              Rotates you through{" "}
              <span className="font-semibold text-emerald-200">
                priority, delegation, complex Med-Surg, patho, labs, and
                leadership
              </span>{" "}
              so you think like an RN on every question.
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
              Mark tasks as{" "}
              <span className="text-emerald-300">In progress</span> or{" "}
              <span className="text-emerald-300">Done</span> as you move
              through the 12 weeks.
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
                Think of each bullet as one or two focused study blocks. Check
                in with yourself weekly and move items to{" "}
                <span className="font-semibold text-emerald-200">Done</span>{" "}
                when that area feels solid.
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
              Weekly RN study plan
            </h4>
            <p className="mt-1 text-[11px] text-slate-400">
              Use this box to map your real week: work schedule, school days,
              and where RN study realistically fits.
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
          placeholder="Example: Tue – cardiac/resp + 30 Qs, Thu – neuro/renal, Sat – leadership + mixed 50-question block."
          value={weeklyPlan}
          onChange={(e) => setWeeklyPlan(e.target.value)}
        />

        <p className="mt-1 text-[10px] text-slate-500">
          Saved just for the{" "}
          <span className="font-semibold text-emerald-200">RN roadmap</span>,
          so you can rewrite your plan every week without losing past progress.
        </p>
      </section>
    </div>
  );
}