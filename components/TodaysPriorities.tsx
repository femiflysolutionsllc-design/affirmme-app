"use client";

import React, { useMemo } from "react";
import { usePersistentState } from "./hooks/usePersistentState";
import {
  getPaySplitSnapshot,
} from "./PaySplit/lib/paySplitSnapshot";

type CalendarEvent = {
  id: string;
  date: string;
  time?: string;
  title: string;
  type?: string;
};

type MorningAnswers = {
  sleep: string;
  focus: string;
  timeAvailable: string;
  mainWorry: string;
};

type DailyCheckInRecord = {
  date: string;

  morning?: {
    answers: MorningAnswers;
    generatedAt: number;
  };
};

type PriorityItem = {
  id: string;
  label: string;
  detail: string;
  tone:
    | "emerald"
    | "amber"
    | "rose"
    | "blue";
    score: number;
};

export default function TodaysPriorities() {
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const [events] =
    usePersistentState<CalendarEvent[]>(
      "calendar_events_v2",
      []
    );

    const [selectedSubject] =
    usePersistentState<string>(
      "planner_subject",
      "fundamentals"
    );
  
  const [subjectLabels] =
    usePersistentState<Record<string, string>>(
      "subject_labels_v1",
      {}
    );

  const [savedCheckIn] =
    usePersistentState<DailyCheckInRecord | null>(
      `daily_checkin_${today}`,
      null
    );

    const paySplitSnapshot =
    typeof window !== "undefined"
      ? getPaySplitSnapshot()
      : null;

  const todaysEvents = useMemo(
    () =>
      (events || [])
        .filter(
          (event) =>
            event.date === today
        )
        .sort(
          (first, second) =>
            (first.time || "").localeCompare(
              second.time || ""
            )
        ),
    [events, today]
  );

  const defaultSubjectLabels: Record<string, string> = {
    fundamentals: "Fundamentals",
    medsurg: "Med-Surg",
    pharm: "Pharmacology",
    peds: "Pediatrics",
    ob: "OB / Maternal",
    psych: "Psych",
    skills: "Skills & Labs",
    nclex: "NCLEX Strategy",
  
    jr_math: "Jr. High · Math",
    jr_english: "Jr. High · English",
    jr_science: "Jr. High · Science",
    jr_social: "Jr. High · Social Studies",
  
    hs_algebra: "HS · Algebra",
    hs_geometry: "HS · Geometry",
    hs_english: "HS · English",
    hs_biology: "HS · Biology",
    hs_chemistry: "HS · Chemistry",
    hs_history: "HS · History",
  
    college_anat: "College · A&P",
    college_micro: "College · Microbiology",
    college_stats: "College · Statistics",
    college_comp: "College · Comp / Writing",
    college_chem: "College · Chemistry",
    college_patho: "College · Pathophysiology",
  
    custom1: "Custom Subject 1",
    custom2: "Custom Subject 2",
    custom3: "Custom Subject 3",
  };
  
  const studyFocus =
    subjectLabels[selectedSubject] ??
    defaultSubjectLabels[selectedSubject] ??
    "";
    const moneyPriority =
  paySplitSnapshot
    ?.unfundedBills[0] ??
  null;

  const priorities = useMemo(() => {
    const items: PriorityItem[] = [];

    const morning =
      savedCheckIn?.morning?.answers;

    if (
      morning?.sleep === "poor" ||
      morning?.focus === "low"
    ) {
      items.push({
        id: "energy",
        label: "Protect Your Energy",
        detail:
          "Keep today lighter. Focus on what truly needs to get done first.",
        tone: "amber",
        score: 80,
      });
    }

    const currentTime =
  `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

const nextEvent =
  todaysEvents.find((event) => {
    if (!event.time) {
      return true;
    }

    return event.time >= currentTime;
  });

if (nextEvent) {
  items.push({
    id: "calendar",
    label: "Next on Your Calendar",
    detail:
      `${nextEvent.title}${
        nextEvent.time
          ? ` at ${nextEvent.time}`
          : ""
      }`,
    tone: "blue",
    score: 90,
  });
}

    if (moneyPriority) {
      items.push({
        id: "money",
        label: "PaySplit Needs Attention",
        detail:
  `${moneyPriority.bill.name} still needs $${moneyPriority.amountRemaining.toFixed(
    2
  )} funded.`,
        tone: "rose",
        score: 100,
      });
    }

    if (studyFocus.trim()) {
      const studyTime =
        morning?.timeAvailable?.trim();
    
      items.push({
        id: "study",
        label: "Study Focus",
        detail: studyTime
          ? `${studyTime} min · ${studyFocus.trim()}`
          : studyFocus.trim(),
        tone: "emerald",
        score: 60,
      });
    }

    if (
      morning?.mainWorry?.trim()
    ) {
      items.push({
        id: "worry",
        label: "Don’t Let This Run the Day",
        detail:
          morning.mainWorry.trim(),
        tone: "rose",
        score: 50,
      });
    }

    return items
    .sort(
      (first, second) =>
        second.score -
        first.score
    )
    .slice(0, 3);
  }, [
    savedCheckIn,
    todaysEvents,
    studyFocus,
    moneyPriority,
  ]);

  function toneClasses(
    tone: PriorityItem["tone"]
  ) {
    if (tone === "amber") {
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    }

    if (tone === "rose") {
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    }

    if (tone === "blue") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-200";
    }

    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  return (
    <section className="home-priorities-shell rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
          ✨ Today&apos;s Priorities
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          The few things most worth your attention right now.
        </p>
      </div>

      {priorities.length === 0 ? (
        <div className="home-priority-card mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-xs font-semibold text-slate-200">
            Nothing urgent right now.
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            Complete your morning check-in or add plans to your calendar and AffirmMe will guide you from there.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {priorities.map(
            (priority) => (
              <div
                key={priority.id}
                className={
                  "home-priority-card rounded-xl border p-3 " +
                  toneClasses(
                    priority.tone
                  )
                }
              >
                <p className="text-[10px] font-black uppercase tracking-wide">
                  {priority.label}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-100">
                  {priority.detail}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}