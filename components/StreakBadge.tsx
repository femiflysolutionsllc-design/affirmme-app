"use client";

import React, { useEffect } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

function getTodayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function StreakBadge() {
  const [lastDate, setLastDate] = usePersistentState<string | null>(
    "streak_last_date",
    null
  );
  const [streak, setStreak] = usePersistentState<number>("streak_days", 0);

  useEffect(() => {
    const today = getTodayString();

    // First time using the app
    if (!lastDate) {
      setLastDate(today);
      setStreak(1);
      return;
    }

    if (lastDate === today) {
      // already counted today
      return;
    }

    // Calculate gap in days between lastDate and today
    const last = new Date(lastDate);
    const now = new Date(today);
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // came back the very next day → streak++
      setStreak(streak + 1);
    } else {
      // missed at least one day → reset to 1
      setStreak(1);
    }

    setLastDate(today);
  }, [lastDate, setLastDate, streak, setStreak]);

  if (!streak || streak <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
      <span className="text-lg">🔥</span>
      <span>
        {streak} day{streak === 1 ? "" : "s"} showing up
      </span>
    </div>
  );
}