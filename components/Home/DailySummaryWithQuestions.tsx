"use client";

import React, { useEffect, useState } from "react";
import DailySummaryAI from "./DailySummaryAI";
import { usePersistentState } from "../hooks/usePersistentState";

type QuestionState = {
  sleep: string;
  focus: string;
  timeAvailable: string;
  mainWorry: string;
};

type NightQuestionState = {
  biggestWin: string;
  mood: string;
  stress: string;
  carryOver: string;
  finalThought: string;
};

type DailyCheckInRecord = {
  date: string;

  morning?: {
    answers: QuestionState;
    generatedAt: number;
  };

  night?: {
    answers: NightQuestionState;
    generatedAt: number;
  };
};

const DEFAULT_STATE: QuestionState = {
  sleep: "",
  focus: "",
  timeAvailable: "",
  mainWorry: "",
};

const DEFAULT_NIGHT_STATE: NightQuestionState = {
  biggestWin: "",
  mood: "",
  stress: "",
  carryOver: "",
  finalThought: "",
};

export default function DailySummaryWithQuestions() {
  const [answers, setAnswers] =
    usePersistentState<QuestionState>(
      "daily_questions_v1",
      DEFAULT_STATE
    );

  const [nightAnswers, setNightAnswers] =
    usePersistentState<NightQuestionState>(
      "daily_night_questions_v1",
      DEFAULT_NIGHT_STATE
    );

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const [
    savedCheckIn,
    setSavedCheckIn,
  ] =
    usePersistentState<DailyCheckInRecord | null>(
      `daily_checkin_${today}`,
      null
    );

  const [showSummary, setShowSummary] =
    useState(Boolean(savedCheckIn));

  const [editingMode, setEditingMode] =
    useState<"morning" | "night" | null>(
      null
    );

  useEffect(() => {
    if (savedCheckIn?.date === today) {
      setShowSummary(true);
    }
  }, [savedCheckIn, today]);

  function handleChange(
    field: keyof QuestionState,
    value: string
  ) {
    setAnswers((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleNightChange(
    field: keyof NightQuestionState,
    value: string
  ) {
    setNightAnswers((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleGenerate() {
    setSavedCheckIn((previous) => ({
      date: today,

      morning: {
        answers,
        generatedAt: Date.now(),
      },

      night:
        previous?.date === today
          ? previous.night
          : undefined,
    }));

    setEditingMode(null);
    setShowSummary(true);
  }

  function handleGenerateNight() {
    setSavedCheckIn((previous) => ({
      date: today,

      morning:
        previous?.date === today
          ? previous.morning
          : undefined,

      night: {
        answers: nightAnswers,
        generatedAt: Date.now(),
      },
    }));

    setEditingMode(null);
    setShowSummary(true);
  }

  function handleResetMorning() {
    setSavedCheckIn((previous) => {
      if (
        !previous ||
        previous.date !== today
      ) {
        return null;
      }

      if (!previous.night) {
        return null;
      }

      return {
        date: today,
        night: previous.night,
      };
    });

    setAnswers(DEFAULT_STATE);
    setEditingMode("morning");
    setShowSummary(false);
  }

  function openMorningEditor() {
    if (savedCheckIn?.morning?.answers) {
      setAnswers(
        savedCheckIn.morning.answers
      );
    }

    setEditingMode("morning");
    setShowSummary(false);
  }

  function openNightEditor() {
    if (savedCheckIn?.night?.answers) {
      setNightAnswers(
        savedCheckIn.night.answers
      );
    }

    setEditingMode("night");
    setShowSummary(false);
  }

  return (
    <div className="home-checkin-shell space-y-3">
      {!showSummary && (
        <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-xs">
          {editingMode ===
            "morning" && (
            <>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  ☀️ Morning Check-In
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Tell AffirmMe what kind
                  of day you&apos;re
                  walking into.
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    How did you sleep?
                  </label>

                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    value={answers.sleep}
                    onChange={(event) =>
                      handleChange(
                        "sleep",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Choose one…
                    </option>
                    <option value="great">
                      Great – I feel rested
                    </option>
                    <option value="okay">
                      Okay – a little tired
                    </option>
                    <option value="poor">
                      Rough – very tired
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    Focus level right now
                  </label>

                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    value={answers.focus}
                    onChange={(event) =>
                      handleChange(
                        "focus",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Choose one…
                    </option>
                    <option value="sharp">
                      Sharp – ready to go
                    </option>
                    <option value="medium">
                      Medium – can focus with
                      breaks
                    </option>
                    <option value="low">
                      Low – need something
                      gentle
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    Realistic study time
                    today
                  </label>

                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    value={
                      answers.timeAvailable
                    }
                    onChange={(event) =>
                      handleChange(
                        "timeAvailable",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Choose one…
                    </option>
                    <option value="15-20">
                      15–20 minutes
                    </option>
                    <option value="30-45">
                      30–45 minutes
                    </option>
                    <option value="60+">
                      60+ minutes
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    Biggest worry /
                    distraction on your mind
                  </label>

                  <input
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    placeholder="(optional) ex: bills, work drama, kids…"
                    value={
                      answers.mainWorry
                    }
                    onChange={(event) =>
                      handleChange(
                        "mainWorry",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  {savedCheckIn?.morning
                    ? "✓ Update Morning Summary"
                    : "Generate Morning Summary"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleResetMorning
                  }
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-[11px] text-slate-300 hover:border-slate-500"
                >
                  Clear Morning Answers
                </button>
              </div>
            </>
          )}

          {editingMode === "night" && (
            <>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
                  🌙 Night Check-In
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Close out your day,
                  recognize what you
                  accomplished, and decide
                  what can wait until
                  tomorrow.
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    What was your biggest
                    win today?
                  </label>

                  <input
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    placeholder="Something you're proud of..."
                    value={
                      nightAnswers.biggestWin
                    }
                    onChange={(event) =>
                      handleNightChange(
                        "biggestWin",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    How are you feeling
                    tonight?
                  </label>

                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    value={
                      nightAnswers.mood
                    }
                    onChange={(event) =>
                      handleNightChange(
                        "mood",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Choose one…
                    </option>
                    <option value="great">
                      Great
                    </option>
                    <option value="okay">
                      Okay
                    </option>
                    <option value="drained">
                      Drained
                    </option>
                    <option value="stressed">
                      Stressed
                    </option>
                    <option value="sad">
                      Sad
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    Stress level tonight
                  </label>

                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    value={
                      nightAnswers.stress
                    }
                    onChange={(event) =>
                      handleNightChange(
                        "stress",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Choose 1–10…
                    </option>

                    {Array.from(
                      { length: 10 },
                      (_, index) =>
                        index + 1
                    ).map((level) => (
                      <option
                        key={level}
                        value={String(
                          level
                        )}
                      >
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">
                    What needs to carry
                    over?
                  </label>

                  <input
                    className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
                    placeholder="Anything that can wait until tomorrow..."
                    value={
                      nightAnswers.carryOver
                    }
                    onChange={(event) =>
                      handleNightChange(
                        "carryOver",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">
                  Anything else on your
                  mind before you close out
                  today?
                </label>

                <textarea
                  className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-950/80 p-2 text-[11px]"
                  placeholder="Optional..."
                  value={
                    nightAnswers.finalThought
                  }
                  onChange={(event) =>
                    handleNightChange(
                      "finalThought",
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                type="button"
                onClick={
                  handleGenerateNight
                }
                className="rounded-md bg-indigo-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-indigo-300"
              >
                {savedCheckIn?.night
                  ? "🌙 Update Night Summary"
                  : "🌙 Save Night Check-In"}
              </button>
            </>
          )}

          {editingMode === null && (
            <div className="home-checkin-choice flex flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                Choose a check-in
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={
                    openMorningEditor
                  }
                  className="rounded-full border border-emerald-500/50 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/10"
                >
                  ☀️ Morning Check-In
                </button>

                <button
                  type="button"
                  onClick={
                    openNightEditor
                  }
                  className="rounded-full border border-indigo-500/50 px-3 py-1.5 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/10"
                >
                  🌙 Night Check-In
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showSummary && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <span>
              Today&apos;s Daily Summary
            </span>

            <div className="flex flex-wrap gap-2">
              {savedCheckIn?.morning ? (
                <button
                  type="button"
                  onClick={
                    openMorningEditor
                  }
                  className="rounded-full border border-emerald-500/50 px-3 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/10"
                >
                  ✏️ Edit Morning
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    openMorningEditor
                  }
                  className="rounded-full border border-emerald-500/50 px-3 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/10"
                >
                  ☀️ Complete Morning
                </button>
              )}

              {savedCheckIn?.night ? (
                <button
                  type="button"
                  onClick={openNightEditor}
                  className="rounded-full border border-indigo-500/50 px-3 py-1 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-500/10"
                >
                  🌙 Edit Night
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openNightEditor}
                  className="rounded-full border border-indigo-500/50 px-3 py-1 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-500/10"
                >
                  🌙 Complete Night
                </button>
              )}
            </div>
          </div>

          <DailySummaryAI
            checkIn={
              savedCheckIn?.morning
                ?.answers
            }
            nightCheckIn={
              savedCheckIn?.night?.answers
            }
          />
        </div>
      )}
    </div>
  );
}