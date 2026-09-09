"use client";

import React, { useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type TriggerPlan = {
  id: string;
  trigger: string;
  body: string;
  nextTime: string;
  createdAt: string;
};

function aiSuggestions(trigger: string): string[] {
  const t = trigger.toLowerCase();

  if (!t.trim()) {
    return [
      "Start by naming the trigger clearly. The more specific you are, the easier it is to build a plan.",
    ];
  }

  if (t.includes("school") || t.includes("exam") || t.includes("test") || t.includes("quiz")) {
    return [
      "Separate your worth from one exam. Remind yourself: 'One score does not erase my skills or experience.'",
      "Do a body reset before studying (walk, stretch, or shower) so your nervous system is calmer.",
      "Break study into tiny blocks (15–25 minutes) and celebrate completing each block instead of waiting for perfection.",
    ];
  }

  if (t.includes("work") || t.includes("hospital") || t.includes("manager") || t.includes("charge")) {
    return [
      "Identify what is in your control (your tone, boundaries, when you walk away) and what is not.",
      "Practice one sentence you can use next time, like: 'I hear you, but I need a moment to regroup before we continue.'",
      "After a hard shift, give yourself a 10-minute decompression ritual (music, dark room, stretching) before doing anything else.",
    ];
  }

  if (t.includes("money") || t.includes("bill") || t.includes("rent") || t.includes("debt")) {
    return [
      "Write down the actual numbers so your brain sees facts instead of just fear.",
      "Pick one tiny financial action (call one company, set up a $10 payment, or check one account) instead of spiraling about all of it.",
      "Remind yourself that solving money stress is a process, not something you fix in a single day.",
    ];
  }

  if (t.includes("relationship") || t.includes("text") || t.includes("ghost") || t.includes("ignored")) {
    return [
      "Pause before responding. If you feel activated, wait until your body feels 30–40% calmer before you write or call.",
      "Ask yourself, 'What do I actually want and need here?' instead of only reacting to their behavior.",
      "Consider protecting your emotional energy by matching effort and keeping your standards, even if that means less access to you.",
    ];
  }

  if (t.includes("family") || t.includes("kids") || t.includes("daughter") || t.includes("son") || t.includes("mom") || t.includes("dad")) {
    return [
      "Notice if old family patterns are being replayed and remind yourself you’re allowed to respond differently now.",
      "Ground yourself before reacting: 5 slow breaths, feel your feet on the floor, relax your jaw and shoulders.",
      "Decide one boundary or limit that protects your peace and practice saying it calmly ahead of time.",
    ];
  }

  // Default generic guidance
  return [
    "Name what you’re feeling in your body (tightness, racing heart, nausea) so your brain understands you’re not 'crazy' — your body is reacting.",
    "Choose one nervous-system reset (breathing, walking, stretching, music, shower) before trying to 'solve' anything.",
    "Write one sentence of how Future You wants to respond next time, and re-read it when you feel this trigger again.",
  ];
}

export default function TriggerCoach() {
  const [trigger, setTrigger] = useState("");
  const [body, setBody] = useState("");
  const [nextTime, setNextTime] = useState("");

  const [plans, setPlans] = usePersistentState<TriggerPlan[]>(
    "trigger_plans",
    []
  );

  const handleSave = () => {
    if (!trigger.trim() && !nextTime.trim() && !body.trim()) return;

    const plan: TriggerPlan = {
      id: crypto.randomUUID(),
      trigger: trigger.trim(),
      body: body.trim(),
      nextTime: nextTime.trim(),
      createdAt: new Date().toISOString(),
    };

    setPlans([plan, ...plans]);

    setTrigger("");
    setBody("");
    setNextTime("");
  };

  return (
    <div className="space-y-4">
      {/* current trigger form */}
      <div className="space-y-2">
      <div className="trigger-coach-heading flex items-start gap-3">
  <span
    className="zaryx-coach-avatar grid h-12 w-12 shrink-0 place-items-center rounded-full border text-lg font-black"
    aria-hidden="true"
  >
    Z
  </span>

  <div>
    <h2 className="text-base font-bold text-slate-100">
      Zaryx Trigger Coach
    </h2>

    <p className="mt-1 text-xs text-slate-400">
      Capture what happened, notice how your body reacted, and decide
      how Future You wants to respond. Zaryx will help you build a plan.
    </p>
  </div>
</div>

        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              What triggered me?
            </label>
            <textarea
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              rows={2}
              className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="Example: Supervisor’s tone, running late, conflict with family..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              How did my body react?
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="Example: Tight chest, jaw clenching, fast heart rate, headache..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              What can I do next time?
            </label>
            <textarea
              value={nextTime}
              onChange={(e) => setNextTime(e.target.value)}
              rows={2}
              className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="Example: Step away for 5 minutes, grounding exercise, text a safe friend..."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-1 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Save trigger plan
        </button>
      </div>

      {/* saved triggers */}
      {plans.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-300">
            Saved triggers & responses
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {plans.map((p) => {
              const suggestions = aiSuggestions(p.trigger);

              return (
                <div
                  key={p.id}
                  className="rounded-md bg-slate-900/70 border border-slate-800 p-2 space-y-1"
                >
                  <p className="text-[10px] text-slate-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                  {p.trigger && (
                    <p className="text-[11px] text-slate-100">
                      <span className="font-semibold text-emerald-300">
                        Trigger:
                      </span>{" "}
                      {p.trigger}
                    </p>
                  )}
                  {p.body && (
                    <p className="text-[11px] text-slate-100">
                      <span className="font-semibold text-emerald-300">
                        Body:
                      </span>{" "}
                      {p.body}
                    </p>
                  )}
                  {p.nextTime && (
                    <p className="text-[11px] text-slate-100">
                      <span className="font-semibold text-emerald-300">
                        Next time:
                      </span>{" "}
                      {p.nextTime}
                    </p>
                  )}

                  {/* AI suggestions */}
                  <div className="mt-2 rounded-md bg-slate-950/80 border border-slate-800 p-2">
                    <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                    Zaryx guidance for this trigger
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {suggestions.map((s, idx) => (
                        <li key={idx} className="text-[11px] text-slate-200">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}