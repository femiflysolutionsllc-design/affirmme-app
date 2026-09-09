"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

// ----------------- Types & Data -----------------

type BsnWeekKey = "w1_4" | "w5_8" | "w9_12";
type TaskStatus = "todo" | "doing" | "done";

type WeekSection = {
  id: BsnWeekKey;
  title: string;
  subtitle: string;
  bullets: string[];
};

const WEEK_SECTIONS: WeekSection[] = [
  {
    id: "w1_4",
    title: "Weeks 1–4 · Rebuild your BSN foundation",
    subtitle:
      "Stabilize school skills (reading, notes, papers) + core RN content so you don’t feel behind.",
    bullets: [
      "Pick 2 core content areas to anchor each week (ex: Med-Surg cardio/resp + Pharm safety). Use Let’s Study to pick the exact subject.",
      "Create one ‘master note’ template for lectures: date, objectives, key patho, priority nursing actions, labs/meds, and exam flags.",
      "Once per week, do a focused paper block: thesis, outline, or 1–2 paragraphs for any current or upcoming BSN paper.",
      "Do 10–20 NCLEX-style questions/week on the topics you are currently covering in class and debrief your patterns in Subject Helper.",
    ],
  },
  {
    id: "w5_8",
    title: "Weeks 5–8 · Heavy course load + EBP / writing muscles",
    subtitle:
      "Blend RN clinical content with BSN things like research, group work, and presentations.",
    bullets: [
      "Choose one course each week to be your ‘feature class’ (the one most at risk). Plan extra review blocks only for that class.",
      "Evidence-based practice: once/week, practice skimming 1 article (abstract, methods, conclusion) and write 3–4 bullet takeaways.",
      "Paper power hour: one 45–60 minute block to draft or edit a paper (intro, body, or conclusion) — phone away, document open.",
      "Continue NCLEX-style questions 2×/week on current units; note which questions are strictly NCLEX vs which are school/exam style.",
    ],
  },
  {
    id: "w9_12",
    title: "Weeks 9–12 · Leadership, capstone energy + NCLEX bridge",
    subtitle:
      "Prepare for leadership/management courses, clinical preceptorship, and gently bridge into NCLEX-RN thinking.",
    bullets: [
      "Leadership/management: 1 block/week on staffing, delegation, conflict, quality improvement, and communication with providers.",
      "Capstone / big projects: break them into tiny tasks (outline, sources, slides, reflection) and schedule 2–3 micro-blocks per week.",
      "Once/week, do a 25–50 question mixed block (all subjects) and practice clinical judgment steps, not just memorizing facts.",
      "Last week: light review and organization — update checklists, clean up notes, finalize any papers, and set a realistic NCLEX plan.",
    ],
  },
];

// ----------------- Helpers -----------------

function getTaskId(weekId: BsnWeekKey, index: number): string {
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

export default function BsnRoadmap() {
  // Per-task status (todo / doing / done)
  const [taskStatus, setTaskStatus] = usePersistentState<
    Record<string, TaskStatus>
  >("bsn_roadmap_tasks_v1", {} as any);

  // Which week cards are expanded
  const [openSections, setOpenSections] = usePersistentState<
    Record<BsnWeekKey, boolean>
  >("bsn_roadmap_open_v1", {
    w1_4: true,
    w5_8: true,
    w9_12: true,
  });

  // Free-form weekly plan notes
  const [weeklyPlan, setWeeklyPlan] = usePersistentState<string>(
    "bsn_roadmap_weekly_plan_v1",
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

  function toggleSection(id: BsnWeekKey) {
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
        [taskStatus ? "": ""]: undefined,
        ...prev,
        [taskId]: next,
      } as Record<string, TaskStatus>;
    });
  }

  function handleQuickPlanGenerate() {
    const planText =
      "Sample weekly plan for BSN:\n" +
      "• 2 content blocks for the hardest nursing class (Med-Surg, Critical Care, etc.)\n" +
      "• 1 paper / EBP block (reading article or writing)\n" +
      "• 1 leadership/management or community health block\n" +
      "• 1 mixed NCLEX-style question block (20–40 questions on current topics)\n" +
      "\nAdjust this based on your real classes and work shifts.";
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
              BSN · 12-week School + NCLEX Bridge Roadmap
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              Designed to balance{" "}
              <span className="font-semibold text-emerald-200">
                BSN papers, EBP, leadership, and core RN content
              </span>{" "}
              without burning you out.
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
              Tiny moves count — move tasks to{" "}
              <span className="text-emerald-300">In progress</span> or{" "}
              <span className="text-emerald-300">Done</span> even if you only
              worked 20 minutes.
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
                Think of these bullets as your BSN survival guide: content,
                writing, and leadership — but broken into pieces you can
                actually do.
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
              Weekly BSN study plan
            </h4>
            <p className="mt-1 text-[11px] text-slate-400">
              Map your week across classes, work, kids, and life. This is just
              for BSN so you can balance papers + NCLEX prep without guessing.
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
          placeholder="Example: Mon – Med-Surg content, Wed – paper work, Fri – NCLEX questions, Sun – leadership/EBP review."
          value={weeklyPlan}
          onChange={(e) => setWeeklyPlan(e.target.value)}
        />

        <p className="mt-1 text-[10px] text-slate-500">
          Saved only for the{" "}
          <span className="font-semibold text-emerald-200">BSN roadmap</span>.
          You can rewrite this every week while your checkboxes and progress
          stay put.
        </p>
      </section>
    </div>
  );
}