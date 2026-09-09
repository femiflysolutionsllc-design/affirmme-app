"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type SavedMoodEntry = {
  id: string;
  date: string;
  timestamp: string;
  value: number;
  emotion: string;
  note: string;
};

function getMoodLabel(score: number) {
  if (score <= 2) return "Very Low";
  if (score <= 4) return "Low";
  if (score === 5) return "Neutral";
  if (score <= 7) return "Good";
  if (score <= 9) return "Great";
  return "Excellent";
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MoodCheckIn() {
  const [score, setScore] = usePersistentState<number>("mood_score", 5);

  const [emotion, setEmotion] = usePersistentState<string>(
    "mood_emotion",
    "Neutral"
  );

  const [note, setNote] = usePersistentState<string>("mood_note", "");

  const [entries, setEntries] = usePersistentState<SavedMoodEntry[]>(
    "mood_checkin_entries_v1",
    []
  );

  const [savedMessage, setSavedMessage] = React.useState("");

  const moodLabel = getMoodLabel(score);

  function saveMoodCheckIn() {
    const date = getLocalDateKey();

    const newEntry: SavedMoodEntry = {
      id: date,
      date,
      timestamp: new Date().toISOString(),
      value: score,
      emotion,
      note,
    };

    const existingEntryIndex = entries.findIndex(
      (entry) => entry.date === date
    );

    const updatedEntries =
      existingEntryIndex >= 0
        ? entries.map((entry, index) =>
            index === existingEntryIndex ? newEntry : entry
          )
        : [...entries, newEntry];

    setEntries(updatedEntries);
    setSavedMessage("Today’s mood check-in is saved.");
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-4 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-200">
          Mood Check-In
        </h2>

        <p className="text-xs text-slate-400">
          No judgment. Just notice how you feel right now.
        </p>
      </header>

      <div className="space-y-2">
        <label
          htmlFor="overall-mood-score"
          className="flex items-center justify-between gap-3 text-xs text-slate-300"
        >
          <span>Overall Mood</span>

          <span className="font-semibold text-emerald-300">
            {score}/10 · {moodLabel}
          </span>
        </label>

        <input
          id="overall-mood-score"
          type="range"
          min={0}
          max={10}
          step={1}
          value={score}
          aria-label="Overall mood score"
          aria-valuetext={`${score} out of 10, ${moodLabel}`}
          onChange={(e) => {
            setScore(Number(e.target.value));
            setSavedMessage("");
          }}
          className="w-full accent-emerald-500"
        />

        <div className="flex justify-between text-[10px] text-slate-500">
          <span>0 · Very Low</span>
          <span>5 · Neutral</span>
          <span>10 · Excellent</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="sm:w-36">
          <label
            htmlFor="current-emotion"
            className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          >
            Main Feeling
          </label>

          <select
            id="current-emotion"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={emotion}
            onChange={(e) => {
              setEmotion(e.target.value);
              setSavedMessage("");
            }}
          >
            <option>Joyful</option>
            <option>Calm</option>
            <option>Neutral</option>
            <option>Stressed</option>
            <option>Overwhelmed</option>
            <option>Exhausted</option>
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="mood-note"
            className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          >
            Optional Note
          </label>

          <textarea
            id="mood-note"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={2}
            placeholder="What may be influencing your mood?"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSavedMessage("");
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveMoodCheckIn}
          className="mood-save-button rounded-lg border border-emerald-400 bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950"
        >
          Save Today’s Check-In
        </button>

        {savedMessage ? (
          <p
            className="text-[11px] font-semibold text-emerald-300"
            role="status"
          >
            {savedMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}