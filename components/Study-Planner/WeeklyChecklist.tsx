"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type Item = { id: string; label: string; done: boolean };

const defaultItems: Item[] = [
  { id: "1", label: "Finish at least 3 focused study blocks", done: false },
  { id: "2", label: "Do one NCLEX-style mixed quiz", done: false },
  { id: "3", label: "Move my body 3+ times this week", done: false },
];

export default function WeeklyChecklist() {
  const [items, setItems] = usePersistentState<Item[]>("weekly_checklist", defaultItems);

  const toggleItem = (id: string) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-200">Weekly Checklist</h2>
        <p className="text-xs text-slate-400">
          Keep it realistic. Done is better than perfect.
        </p>
      </header>

      <ul className="space-y-2 text-xs text-slate-100">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleItem(item.id)}
              className="accent-emerald-500"
            />
            <span className={item.done ? "line-through text-slate-500" : ""}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}