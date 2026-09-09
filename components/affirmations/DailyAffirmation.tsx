"use client";

import React from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type AffirmationCategory = "study" | "resilience" | "stability" | "selfworth" | "goals";

const affirmationBank: Record<AffirmationCategory, string[]> = {
  study: [
    "I am capable of learning, growing, and succeeding in the path I choose.",
    "I learn faster every time I return to the material.",
    "Consistency beats perfection — I show up.",
  ],
  resilience: [
    "My past attempts have prepared me for this comeback.",
    "I am safe to learn, grow, and try again.",
    "I can feel overwhelmed and still move forward.",
  ],
  stability: [
    "I am building a stable, peaceful life for myself and the people I love.",
    "I create order one choice at a time.",
    "I handle today — and that is enough.",
  ],
  selfworth: [
    "I speak to myself with respect and patience.",
    "I deserve love, ease, and support.",
    "I am not behind — I am becoming.",
  ],
  goals: [
    "My goals are real, and I am faithful to the process.",
    "I align my choices with the life I want.",
    "Small steps compound into big change.",
  ],
};

function smartAffirmationFromSplit(split?: any) {
  const a = Number(split?.paycheckA || 0);
  const b = Number(split?.paycheckB || 0);
  const hasTwo = split?.payFrequency !== "monthly";

  if (!a && (!hasTwo || !b)) {
    return "I am creating clarity by putting my numbers in one place. I’m in control.";
  }

  if (current === "I am building a stable, peaceful life for me and my girls.") {
    setCurrent(
      "I am building a stable, peaceful life for myself and the people I love."
    );
  }

  const bills = Array.isArray(split?.bills) ? split.bills : [];
  const totalBills = bills.reduce((s: number, x: any) => s + Number(x?.amount || 0), 0);

  if (totalBills > a + (hasTwo ? b : 0)) {
    return "I face the truth with courage. I can adjust, rebalance, and rise without panic.";
  }

  return "I am building stability on purpose. Small disciplined choices are creating a big future.";
}

function speak(text: string) {
  if (typeof window === "undefined") return;

  const synth = window.speechSynthesis;
  if (!synth) {
    alert("Voice not supported on this device/browser.");
    return;
  }

  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.95;
  synth.speak(u);
}

export default function DailyAffirmation() {
  const [current, setCurrent] = usePersistentState<string>("affirm_current", affirmationBank.study[0]);

  // ✅ must be inside component
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    if (current === "I am capable of succeeding as an LPN and RN.") {
      setCurrent(
        "I am capable of learning, growing, and succeeding in the path I choose."
      );
    }
  }, [current, setCurrent]);

  const handleRandom = () => {
    if (!mounted) return;
  
    let category: AffirmationCategory = "study";
  
    try {
      const raw = window.localStorage.getItem("paysplit_splitbills_v3");
      const split = raw ? JSON.parse(raw) : null;
  
      const a = Number(split?.paycheckA) || 0;
      const b = Number(split?.paycheckB) || 0;
      const hasTwo = split?.payFrequency !== "monthly";
      const total = a + (hasTwo ? b : 0);
  
      if (total <= 0) category = "resilience";
      else if (total < 2000) category = "stability";
      else category = "goals";
    } catch {
      category = "study";
    }
  
    const list = affirmationBank[category] ?? affirmationBank.study;
    const idx = Math.floor(Math.random() * list.length);
    setCurrent(list[idx]);
  };

  const handleSmart = () => {
    if (!mounted) return;
    try {
      const raw = window.localStorage.getItem("paysplit_splitbills_v3");
      const split = raw ? JSON.parse(raw) : null;
      setCurrent(smartAffirmationFromSplit(split));
    } catch {}
  };

  return (
    <section className="home-affirmation-shell rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm space-y-3">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => speak(current)}
          className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400"
        >
          🔊 Read
        </button>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">Morning Affirmation</h2>
          <p className="text-xs text-slate-400">Speak to yourself the way you’d speak to someone you love.</p>
        </div>

        <button
          type="button"
          onClick={handleRandom}
          className="rounded-full border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
        >
          Shuffle
        </button>
      </header>

      <button
        type="button"
        onClick={handleSmart}
        className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400"
      >
        ✨ Smart
      </button>

      <p id="daily-affirmation-text" className="text-base font-medium text-emerald-200">
        {current}
      </p>
    </section>
  );
}