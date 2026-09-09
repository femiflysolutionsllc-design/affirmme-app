"use client";

import React, { useEffect, useRef, useState } from "react";

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
      "Start the focus timer below and place your phone on Do Not Disturb.",
      "When the timer ends, identify anything that still feels weak or confusing.",
      "Write one small next step for your next study session.",
    ];
  }

  return [
    `Choose one specific task in ${subjectLabel}, such as completing one worksheet, reading three pages, or reviewing one example problem.`,
    "Start the focus timer below and avoid switching apps or subjects.",
    "When the timer ends, mark anything that still feels confusing.",
    "Write one short note so you know where to restart next time.",
  ];
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

export default function TodayFocus({
  levelLabel,
  subjectLabel,
  isNursingProgram,
}: TodayFocusProps) {
  const [duration, setDuration] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const endTimeRef = useRef<number | null>(null);

  const bullets = getBlockBullets(
    isNursingProgram,
    subjectLabel
  );

  const totalSeconds = duration * 60;

  const progress =
    totalSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalSeconds - secondsRemaining) / totalSeconds) *
              100
          )
        )
      : 0;

  useEffect(() => {
    if (!isRunning) return;

    function updateTimer() {
      if (!endTimeRef.current) return;

      const nextSeconds = Math.max(
        0,
        Math.ceil(
          (endTimeRef.current - Date.now()) / 1000
        )
      );

      setSecondsRemaining(nextSeconds);

      if (nextSeconds === 0) {
        setIsRunning(false);
        endTimeRef.current = null;
      }
    }

    updateTimer();

    const timerId = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(timerId);
  }, [isRunning]);

  useEffect(() => {
    setIsRunning(false);
    setHasStarted(false);
    setSecondsRemaining(duration * 60);
    endTimeRef.current = null;
  }, [levelLabel, subjectLabel]);

  function chooseDuration(nextDuration: number) {
    setDuration(nextDuration);
    setSecondsRemaining(nextDuration * 60);
    setIsRunning(false);
    setHasStarted(false);
    endTimeRef.current = null;
  }

  function toggleTimer() {
    if (isRunning) {
      if (endTimeRef.current) {
        const pausedSeconds = Math.max(
          0,
          Math.ceil(
            (endTimeRef.current - Date.now()) / 1000
          )
        );

        setSecondsRemaining(pausedSeconds);
      }

      setIsRunning(false);
      endTimeRef.current = null;
      return;
    }

    const startingSeconds =
      secondsRemaining > 0
        ? secondsRemaining
        : totalSeconds;

    setSecondsRemaining(startingSeconds);
    endTimeRef.current =
      Date.now() + startingSeconds * 1000;

    setHasStarted(true);
    setIsRunning(true);
  }

  function resetTimer() {
    setIsRunning(false);
    setHasStarted(false);
    setSecondsRemaining(totalSeconds);
    endTimeRef.current = null;
  }

  const timerStatus = isRunning
    ? "Focus block in progress"
    : secondsRemaining === 0
      ? "Focus block complete"
      : hasStarted
        ? "Focus block paused"
        : "Ready when you are";

  const mainButtonLabel = isRunning
    ? "Pause Focus Block"
    : secondsRemaining === 0
      ? "Start Another Block"
      : hasStarted
        ? "Resume Focus Block"
        : "Start Focus Block";

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

      <section className="mt-4 rounded-2xl border border-purple-500/50 bg-slate-950/95 p-4">
        <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
          <div className="text-center md:min-w-48">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {timerStatus}
            </p>

            <p
              className="mt-1 text-4xl font-black tabular-nums text-slate-100"
              aria-live="polite"
            >
              {formatTime(secondsRemaining)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              {[20, 25, 30].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseDuration(option)}
                  className={`focus-duration-button flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    duration === option
                      ? "is-active border-emerald-400 bg-emerald-500/90 text-slate-950"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {option} min
                </button>
              ))}
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {secondsRemaining === 0 && (
          <p className="mt-3 text-center text-sm font-semibold text-emerald-300">
            You completed your focus block. That counts as progress.
          </p>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            onClick={toggleTimer}
            className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
              isRunning
                ? "border-rose-400 bg-rose-500/90 text-slate-950"
                : "border-emerald-400 bg-emerald-500/90 text-slate-950"
            }`}
          >
            {mainButtonLabel}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="rounded-full border border-slate-600 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </section>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3">
          <p className="text-[11px] font-semibold text-emerald-200">
            {duration}-minute block · {subjectLabel}
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-slate-200">
            {bullets.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/95 p-3">
          <p className="text-[11px] font-semibold text-emerald-200">
            Tiny mindset for today
          </p>

          <p className="mt-1 text-[11px] text-slate-300">
            You don&apos;t need a perfect study day—you
            just need{" "}
            <span className="font-semibold text-emerald-200">
              one honest block
            </span>{" "}
            where you showed up and tried.
          </p>

          <p className="mt-2 text-[11px] text-slate-400">
            After this block, you can stop, take a break,
            or add another if you feel good. No punishment
            and no self-bullying—just one block at a time.
          </p>
        </div>
      </div>
    </section>
  );
}