"use client";

import React from "react";

// IMPORTANT: replace this import with YOUR PaySplit component path
// Example: import PaySplit from "./PaySplit";
import PaySplit from "./PaySplit";

export default function PaySplitTab() {
  return (
    <section className="space-y-4 text-slate-100">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-emerald-300">PaySplit</h2>
        <p className="text-xs text-slate-400">
          Split expenses cleanly and keep track of who owes what.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <PaySplit />
      </div>
    </section>
  );
}