"use client";

import React, { useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type Goal = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

function suggestPlan(text: string): string[] {
  const t = text.toLowerCase();

  if (t.includes("nclex")) {
    return [
      "Break content into daily blocks (e.g. med-surg, OB, peds, psych).",
      "Do 30–60 practice questions a day and fully review rationales.",
      "Once a week, simulate a mini exam and review weak systems.",
    ];
  }

  if (t.includes("work out") || t.includes("gym") || t.includes("weight")) {
    return [
      "Pick 3–4 workout days and put them in your calendar.",
      "Choose a simple split (upper/lower or full-body) and repeat weekly.",
      "Track reps/weights so you can see small wins and progress.",
    ];
  }

  if (t.includes("money") || t.includes("debt") || t.includes("savings")) {
    return [
      "List all bills and minimums so you see the full picture.",
      "Create a simple weekly spending limit and stick it on your fridge/phone.",
      "Set up an automatic transfer, even if it’s small, for savings or debt.",
    ];
  }

  // default generic plan
  return [
    "Break this goal into 3 tiny steps you could do in under 30 minutes.",
    "Schedule the first step on your calendar within the next 48 hours.",
    "Ask yourself each Sunday: 'What’s the next small move toward this?' and update.",
  ];
}

export default function GoalsBoard() {
  const [goals, setGoals] = usePersistentState<Goal[]>("mind_goals", []);
  const [newGoal, setNewGoal] = useState("");
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const handleAddGoal = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;

    const goal: Goal = {
      id: crypto.randomUUID(),
      text: trimmed,
      done: false,
      createdAt: new Date().toISOString(),
    };

    setGoals([...goals, goal]);
    setNewGoal("");
  };

  const toggleDone = (id: string) => {
    setGoals(
      goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
    if (activePlanId === id) setActivePlanId(null);
  };

  return (
    <div className="space-y-4">
      {/* Add goal */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Add a new goal
        </label>
        <div className="flex gap-2">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Example: Pass NCLEX by June, lose 10 lbs, save $2,000..."
            className="flex-1 rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <button
            onClick={handleAddGoal}
            className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Add
          </button>
        </div>
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {goals.length === 0 && (
          <p className="text-xs text-slate-500">
            No goals yet. Add one above and let the planner break it down with
            you.
          </p>
        )}

        {goals.map((goal) => {
          const isActive = activePlanId === goal.id;
          const plan = suggestPlan(goal.text);

          return (
            <div
              key={goal.id}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleDone(goal.id)}
                  className={`mt-0.5 h-4 w-4 rounded border text-xs flex items-center justify-center ${
                    goal.done
                      ? "border-emerald-400 bg-emerald-500 text-slate-950"
                      : "border-slate-500 text-slate-500"
                  }`}
                >
                  {goal.done && "✓"}
                </button>

                <div className="flex-1 space-y-1">
                  <p
                    className={`text-sm ${
                      goal.done
                        ? "text-slate-400 line-through"
                        : "text-slate-100"
                    }`}
                  >
                    {goal.text}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Added {new Date(goal.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setActivePlanId(isActive ? null : goal.id)
                  }
                  className="rounded-full border border-emerald-400 px-2 py-1 text-[10px] font-medium text-emerald-300 hover:bg-emerald-500/10"
                >
                  {isActive ? "Hide plan" : "AI plan"}
                </button>

                <button
                  onClick={() => removeGoal(goal.id)}
                  className="text-[10px] text-slate-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>

              {isActive && (
                <div className="mt-1 rounded-md bg-slate-950/80 border border-slate-800 p-2">
                  <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                    Suggested plan
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    {plan.map((step, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-slate-200"
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Use this as a guide and tweak it to match your real life.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}