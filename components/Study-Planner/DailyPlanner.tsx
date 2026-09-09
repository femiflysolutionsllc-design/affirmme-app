"use client";

import React, { useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type StudyBlock = {
  id: string;
  topic: string;
  duration: string;
};

export default function DailyPlanner() {
  const [blocks, setBlocks] = usePersistentState<StudyBlock[]>("study_blocks", []);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("45 min");

  const handleAdd = () => {
    if (!topic.trim()) return;
    const newBlock: StudyBlock = {
      id: Date.now().toString(),
      topic: topic.trim(),
      duration,
    };
    setBlocks([...blocks, newBlock]);
    setTopic("");
  };

  const handleDelete = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-200">Study Blocks</h2>
        <p className="text-xs text-slate-400">
          Plan 1–3 focused blocks instead of trying to do everything.
        </p>
      </header>

      <div className="flex gap-2 text-xs">
        <input
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Topic (e.g., Fluids & Electrolytes)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <select
          className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option>30 min</option>
          <option>45 min</option>
          <option>60 min</option>
          <option>90 min</option>
        </select>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-emerald-500 px-3 py-2 font-medium text-slate-900 hover:bg-emerald-400"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2 text-xs text-slate-100">
        {blocks.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
          >
            <span>{b.topic}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{b.duration}</span>
              <button
                type="button"
                onClick={() => handleDelete(b.id)}
                className="text-[11px] text-slate-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
        {blocks.length === 0 && (
          <p className="text-[11px] text-slate-500">
            No blocks yet — add your first focus block above.
          </p>
        )}
      </ul>
    </section>
  );
}