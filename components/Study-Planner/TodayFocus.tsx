"use client";

import React from "react";

interface TodayFocusProps {
  levelLabel: string;
  subjectLabel: string;
  isNursingProgram: boolean;
}

function getBlockBullets(
  isNursingProgram: boolean,
  subjectLabel: string
): string[] {
  if (isNursingProgram) {
    return [
      `Choose one small goal in ${subjectLabel}, such as reviewing 10 practice questions or rereading two pages of notes.`,
      "Start your Zaryx Focus Session below and place your device on Study Focus or Do Not Disturb.",
      "When the session ends, identify anything that still feels weak or confusing.",
      "Write one small next step for your next study session.",
    ];
  }

  return [
    `Choose one specific task in ${subjectLabel}, such as completing one worksheet, reading three pages, or reviewing one example problem.`,
    "Start your Zaryx Focus Session below and avoid switching apps or subjects.",
    "When the session ends, mark anything that still feels confusing.",
    "Write one short note so you know where to restart next time.",
  ];
}

export default function TodayFocus({
  levelLabel,
  subjectLabel,
  isNursingProgram,
}: TodayFocusProps) {
  const bullets = getBlockBullets(
    isNursingProgram,
    subjectLabel
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs text-slate-100">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold text-emerald-300">
            TODAY&apos;S FOCUS
          </p>

          <p className="text-[12px] text-slate-400">
            One focused block that keeps you consistent
            without burning out.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-200">
            Level:{" "}
            <span className="font-semibold text-emerald-300">
              {levelLabel}
            </span>
          </span>

          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-200">
            Subject:{" "}
            <span className="font-semibold text-emerald-300">
              {subjectLabel}
            </span>
          </span>
        </div>
      </header>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-purple-500/50 bg-slate-950/95 p-4">
          <p className="text-[11px] font-semibold text-emerald-200">
            Your study plan · {subjectLabel}
          </p>

          <ol className="mt-3 space-y-3 text-[11px] text-slate-200">
            {bullets.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-400 bg-purple-500/20 text-[10px] font-bold text-purple-100">
                  {index + 1}
                </span>

                <span className="pt-1">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="text-[11px] font-semibold text-emerald-200">
            Tiny mindset for today
          </p>

          <p className="mt-2 text-[11px] text-slate-300">
            You don&apos;t need a perfect study day—you
            just need{" "}
            <span className="font-semibold text-emerald-200">
              one honest block
            </span>{" "}
            where you showed up and tried.
          </p>

          <p className="mt-3 text-[11px] text-slate-400">
            After the session, you can continue, take a
            break, or finish for today. No punishment and
            no self-bullying—just one block at a time.
          </p>

          <div className="mt-4 rounded-xl border border-pink-400/40 bg-pink-500/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-pink-200">
              Next step
            </p>

            <p className="mt-1 text-[11px] text-slate-200">
              Scroll to Zaryx Focus Session, select your
              study time, and press Start.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}