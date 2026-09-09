"use client";

import React, { useState, useEffect } from "react";

export default function TodayWin() {
  const [win, setWin] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("today_win");
    if (saved) setWin(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setWin(value);
    window.localStorage.setItem("today_win", value);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-amber-300">Today&apos;s Win</h2>
        <p className="text-xs text-slate-400">
          What is one thing you&apos;re proud of today?
        </p>
      </header>

      <textarea
        value={win}
        onChange={handleChange}
        rows={3}
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950/80 p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="I showed up for myself by..."
      />
    </section>
  );
}