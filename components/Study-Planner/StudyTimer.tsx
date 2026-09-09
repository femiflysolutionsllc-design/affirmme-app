"use client";

import React, { useEffect, useRef, useState } from "react";

type TimerMode = "focus" | "break";

const TRACKS = [
  {
    id: "lofi1",
    label: "Calm lofi mix",
    url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  },
  {
    id: "rain",
    label: "Soft rain",
    url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
  },
];

export default function StudyTimer() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 minutes
  const [running, setRunning] = useState(false);

  const [currentTrackId, setCurrentTrackId] = useState<string>("lofi1");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // When we hit 0, stop the timer
  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
    }
  }, [secondsLeft, running]);

  function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function handleModeChange(next: TimerMode) {
    setMode(next);
    setRunning(false);
    setSecondsLeft(next === "focus" ? 25 * 60 : 5 * 60);
  }

  function handlePlayPauseMusic() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }

  const currentTrack = TRACKS.find((t) => t.id === currentTrackId) ?? TRACKS[0];

  return (
    <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-emerald-300">
            Focus timer with study music
          </h3>
          <p className="text-[11px] text-slate-400">
            Set a 25-minute focus block or a 5-minute break and play a calm
            background track while you study.
          </p>
        </div>
      </div>

      {/* Timer controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleModeChange("focus")}
            className={
              "rounded-full px-3 py-1.5 text-[11px] " +
              (mode === "focus"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-900 text-slate-300 border border-slate-700")
            }
          >
            Focus 25:00
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("break")}
            className={
              "rounded-full px-3 py-1.5 text-[11px] " +
              (mode === "break"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-900 text-slate-300 border border-slate-700")
            }
          >
            Break 5:00
          </button>
        </div>

        <div className="flex items-center gap-2">
          <p className="font-mono text-lg text-slate-50">
            {formatTime(secondsLeft)}
          </p>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={() =>
              setSecondsLeft(mode === "focus" ? 25 * 60 : 5 * 60)
            }
            className="rounded-md border border-slate-700 px-3 py-1.5 text-[11px] text-slate-200 hover:border-slate-500"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Music controls */}
      <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/90 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-emerald-200">
            Ambient study music
          </p>
          <button
            type="button"
            onClick={handlePlayPauseMusic}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200 hover:border-slate-500"
          >
            ▶️ / ⏸
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                setCurrentTrackId(track.id);
                // auto-play when you switch track
                setTimeout(() => handlePlayPauseMusic(), 50);
              }}
              className={
                "rounded-full border px-3 py-1 text-[11px] " +
                (currentTrackId === track.id
                  ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                  : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500")
              }
            >
              {track.label}
            </button>
          ))}
        </div>

        <audio ref={audioRef} src={currentTrack.url} loop />
      </div>
    </section>
  );
}