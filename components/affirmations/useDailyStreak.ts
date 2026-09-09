"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "affirmme_daily_streak_v1";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type StreakState = { lastCheckIn: string | null; streak: number };

export function useDailyStreak() {
  const [state, setState] = useState<StreakState>({ lastCheckIn: null, streak: 0 });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const isToday = useMemo(() => state.lastCheckIn === today(), [state.lastCheckIn]);

  function checkInToday() {
    const t = today();
    if (state.lastCheckIn === t) return;

    // simple streak logic: if lastCheckIn was yesterday -> +1 else reset to 1
    const last = state.lastCheckIn ? new Date(state.lastCheckIn) : null;
    const now = new Date(t);
    const diffDays =
      last ? Math.round((now.getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24)) : null;

    const nextStreak = diffDays === 1 ? state.streak + 1 : 1;
    setState({ lastCheckIn: t, streak: nextStreak });
  }

  return { streak: state.streak, isToday, checkInToday };
}