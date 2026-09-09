"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type MoodEntry = any;
type StressEntry = any;
type HormoneEntry = any;

type MorningAnswers = {
  sleep: string;
  focus: string;
  timeAvailable: string;
  mainWorry: string;
};

type NightAnswers = {
  biggestWin: string;
  mood: string;
  stress: string;
  carryOver: string;
  finalThought: string;
};

type DailyCheckInRecord = {
  date: string;

  morning?: {
    answers: MorningAnswers;
    generatedAt: number;
  };

  night?: {
    answers: NightAnswers;
    generatedAt: number;
  };
};

function getLatestTwo<T extends { date?: string }>(arr: T[]): T[] {
  const sorted = [...arr].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });
  return sorted.slice(0, 2);
}

export default function WhatChangedPanel() {
  const now = new Date();

const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("-");

const yesterdayDate = new Date(now);
yesterdayDate.setDate(
  yesterdayDate.getDate() - 1
);

const yesterday = [
  yesterdayDate.getFullYear(),
  String(yesterdayDate.getMonth() + 1).padStart(2, "0"),
  String(yesterdayDate.getDate()).padStart(2, "0"),
].join("-");

  const [moodsRaw] = usePersistentState<MoodEntry[]>(
    "mood_checkin_entries_v1",
    []
  );
  const [stressRaw] = usePersistentState<StressEntry[]>(
    "stress_trigger_log_v1",
    []
  );
  const [hormonesRaw] = usePersistentState<HormoneEntry[]>(
    "hormone_log_v1",
    []
  );

  const [todayCheckIn] =
  usePersistentState<DailyCheckInRecord | null>(
    `daily_checkin_${today}`,
    null
  );

const [yesterdayCheckIn] =
  usePersistentState<DailyCheckInRecord | null>(
    `daily_checkin_${yesterday}`,
    null
  );

  const [m1, m2] = getLatestTwo(moodsRaw || []);
  const [s1, s2] = getLatestTwo(stressRaw || []);
  const [h1, h2] = getLatestTwo(hormonesRaw || []);

  const changes: string[] = [];

  const todayMorning =
  todayCheckIn?.morning?.answers;

const yesterdayMorning =
  yesterdayCheckIn?.morning?.answers;

const todayNight =
  todayCheckIn?.night?.answers;

const yesterdayNight =
  yesterdayCheckIn?.night?.answers;

  if (
    todayMorning?.sleep &&
    yesterdayMorning?.sleep &&
    todayMorning.sleep !== yesterdayMorning.sleep
  ) {
    const sleepLabels: Record<string, string> = {
      poor: "rough",
      okay: "okay",
      great: "rested",
    };
  
    const yesterdaySleep =
      sleepLabels[yesterdayMorning.sleep] ??
      yesterdayMorning.sleep;
  
    const todaySleep =
      sleepLabels[todayMorning.sleep] ??
      todayMorning.sleep;
  
    changes.push(
      `Your sleep shifted from ${yesterdaySleep} yesterday to ${todaySleep} today.`
    );
  }

  if (
    todayMorning?.focus &&
    yesterdayMorning?.focus &&
    todayMorning.focus !== yesterdayMorning.focus
  ) {
    const focusLabels: Record<string, string> = {
      low: "low",
      medium: "steady",
      sharp: "sharp",
    };
  
    const yesterdayFocus =
      focusLabels[yesterdayMorning.focus] ??
      yesterdayMorning.focus;
  
    const todayFocus =
      focusLabels[todayMorning.focus] ??
      todayMorning.focus;
  
    changes.push(
      `Your focus shifted from ${yesterdayFocus} yesterday to ${todayFocus} today.`
    );
  }

if (
  todayNight?.stress &&
  yesterdayNight?.stress &&
  todayNight.stress !== yesterdayNight.stress
) {
  const todayStress =
    Number(todayNight.stress);

  const yesterdayStress =
    Number(yesterdayNight.stress);

  if (
    Number.isFinite(todayStress) &&
    Number.isFinite(yesterdayStress)
  ) {
    if (todayStress < yesterdayStress) {
      changes.push(
        `Stress improved from ${yesterdayStress}/10 yesterday to ${todayStress}/10 today.`
      );
    } else {
      changes.push(
        `Stress increased from ${yesterdayStress}/10 yesterday to ${todayStress}/10 today.`
      );
    }
  }
}

if (
  yesterdayNight?.carryOver?.trim()
) {
  const carried =
    yesterdayNight.carryOver.trim();

  changes.push(
    `You wanted to carry forward: ${carried}.`
  );
}

  // Mood change
  if (m1 && m2) {
    const v = (m: any) =>
      typeof m.value === "number"
        ? m.value
        : typeof m.score === "number"
        ? m.score
        : typeof m.mood === "number"
        ? m.mood
        : null;
    const v1 = v(m1);
    const v2 = v(m2);
    if (v1 != null && v2 != null && v1 !== v2) {
      const diff = (v1 - v2).toFixed(1);
      changes.push(
        `Your mood moved from ${v2.toFixed(1)}/10 to ${v1.toFixed(
          1
        )}/10. That's a change of ${diff}.`
      );
    }
  }

  // Stress & triggers log count difference
  if (s1 && s2) {
    const date1 = s1.date ?? "today";
    const date2 = s2.date ?? "previous entry";
    if (date1 !== date2) {
      changes.push(
        `You have at least one saved stress/trigger plan for ${date1}. Try reviewing the one from ${date2} and see what felt different.`
      );
    }
  }

  // Hormone phase difference
  if (h1 && h2) {
    const p1 = (h1.cyclePhase || "").toLowerCase();
    const p2 = (h2.cyclePhase || "").toLowerCase();
    if (p1 && p2 && p1 !== p2) {
      changes.push(
        `You moved from the "${p2}" phase to "${p1}". You may want to adjust your study energy based on how this phase usually feels.`
      );
    }
  }

  if (changes.length === 0) {
    return (
      <div className="home-changes-shell rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
          What Changed Since Yesterday?
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          As you log more moods, stress plans, and hormone entries, I&apos;ll
          reflect back small shifts from day to day.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
        What Changed Since Yesterday?
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-slate-300">
        {changes.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-slate-500">
        These are gentle reflections, not judgments. Use them to choose your
        next smallest step.
      </p>
    </div>
  );
}