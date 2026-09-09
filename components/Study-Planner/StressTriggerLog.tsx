"use client";

import React, { useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type StressTriggerEntry = {
  id: string;
  date: string;
  type: "stress" | "trigger";
  title: string;
  whatHappened: string;
  copingPlan: string;
  outcome: string;
};

export default function StressTriggerLog() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [entries, setEntries] = usePersistentState<StressTriggerEntry[]>(
    "stress_trigger_log_v1",
    []
  );

  const [form, setForm] = useState({
    date: todayStr,
    type: "stress" as "stress" | "trigger",
    title: "",
    whatHappened: "",
    copingPlan: "",
    outcome: "",
  });

  function handleChange(
    field: keyof typeof form,
    value: string | "stress" | "trigger"
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    const title = form.title.trim();
    if (!title) return;

    const newEntry: StressTriggerEntry = {
      id: crypto.randomUUID(),
      date: form.date,
      type: form.type,
      title,
      whatHappened: form.whatHappened.trim(),
      copingPlan: form.copingPlan.trim(),
      outcome: form.outcome.trim(),
    };

    setEntries([newEntry, ...entries]);
    setForm({
      date: todayStr,
      type: form.type,
      title: "",
      whatHappened: "",
      copingPlan: "",
      outcome: "",
    });
  }

  function handleDelete(id: string) {
    setEntries(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-3 text-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
        Saved Stress & Trigger Plans
      </p>

      {/* Form */}
      <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/80 p-2">
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Date</label>
            <input
              type="date"
              className="rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Type</label>
            <select
              className="rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
              value={form.type}
              onChange={(e) =>
                handleChange("type", e.target.value as "stress" | "trigger")
              }
            >
              <option value="stress">Stress</option>
              <option value="trigger">Trigger</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">
            Title (ex: &quot;OR conflict&quot; / &quot;Money stress&quot;)
          </label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">
            What happened / what set you off?
          </label>
          <textarea
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
            rows={2}
            value={form.whatHappened}
            onChange={(e) => handleChange("whatHappened", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">
            Plan you want to use next time
          </label>
          <textarea
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
            rows={2}
            value={form.copingPlan}
            onChange={(e) => handleChange("copingPlan", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400">
            Outcome / what you learned (optional)
          </label>
          <textarea
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-1.5 text-[11px]"
            rows={2}
            value={form.outcome}
            onChange={(e) => handleChange("outcome", e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Save entry
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {entries.length === 0 && (
          <p className="text-[11px] text-slate-500">
            Your saved stress & trigger plans will show here so you can revisit
            them before exams, work, or tough days.
          </p>
        )}

        {entries.map((e) => (
          <div
            key={e.id}
            className="space-y-1 rounded-md border border-slate-700 bg-slate-950/80 p-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-100">
                {e.title}
              </p>
              <div className="flex items-center gap-2 text-[10px]">
                <span
                  className={
                    "rounded-full px-2 py-0.5 " +
                    (e.type === "stress"
                      ? "bg-rose-500/15 text-rose-200 border border-rose-400/60"
                      : "bg-amber-500/15 text-amber-200 border border-amber-400/60")
                  }
                >
                  {e.type === "stress" ? "Stress" : "Trigger"}
                </span>
                <span className="text-slate-400">{e.date}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(e.id)}
                  className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-rose-200 hover:bg-rose-500/20"
                >
                  ✕
                </button>
              </div>
            </div>

            {e.whatHappened && (
              <p className="text-[10px] text-slate-300">
                <span className="font-semibold text-slate-200">
                  What happened:{" "}
                </span>
                {e.whatHappened}
              </p>
            )}
            {e.copingPlan && (
              <p className="text-[10px] text-emerald-200">
                <span className="font-semibold text-emerald-300">
                  Plan next time:{" "}
                </span>
                {e.copingPlan}
              </p>
            )}
            {e.outcome && (
              <p className="text-[10px] text-slate-300">
                <span className="font-semibold text-slate-200">
                  Outcome / insight:{" "}
                </span>
                {e.outcome}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}