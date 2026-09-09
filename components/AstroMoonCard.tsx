"use client";

import React, { useMemo, useState } from "react";

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const ZODIAC_EMOJIS: Record<ZodiacSign, string> = {
  Aries: "🐏",
  Taurus: "🐂",
  Gemini: "👯",
  Cancer: "🦀",
  Leo: "🦁",
  Virgo: "🌾",
  Libra: "⚖️",
  Scorpio: "🦂",
  Sagittarius: "🏹",
  Capricorn: "🐐",
  Aquarius: "🏺",
  Pisces: "🐟",
};

const SIGN_MESSAGES: Record<ZodiacSign, string> = {
  Aries: "Channel your fire into one focused task instead of ten at once.",
  Taurus: "Slow, grounded steps toward your goal are still powerful.",
  Gemini: "Use your curiosity to review notes, ask questions, and rewrite in your own words.",
  Cancer: "Protect your energy today and study in a cozy, safe-feeling space.",
  Leo: "Let yourself be proud of small wins — they stack into big ones.",
  Virgo: "One clean plan and one priority list can calm your mind before you study.",
  Libra: "Balance is your superpower — blend rest, work, and self-kindness.",
  Scorpio: "Transform intense emotions into fuel and channel them toward what matters most.",
  Sagittarius: "Think of study as a journey — each session is one more step forward.",
  Capricorn: "Your discipline is a gift. Even a short, focused session is a win.",
  Aquarius: "Try a slightly different study method today and see what clicks.",
  Pisces: "Let your intuition guide you: what topic is quietly asking for your attention?",
};

// Simple moon-phase approximation (not astronomical-precise but good enough for vibes)
function getMoonPhase(today = new Date()) {
  // Reference new moon: Jan 6, 2000
  const reference = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const diffMs = today.getTime() - reference.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  const cycle = 29.53058867;
  const phase = ((days % cycle) + cycle) % cycle;

  if (phase < 1.5)
    return { label: "New Moon", emoji: "🌑", tip: "Good for setting intentions quietly and starting fresh." };
  if (phase < 6.5)
    return { label: "Waxing Crescent", emoji: "🌒", tip: "Take small, consistent steps toward your study goals." };
  if (phase < 9.5)
    return { label: "First Quarter", emoji: "🌓", tip: "Time to push through resistance and stay committed." };
  if (phase < 13.5)
    return { label: "Waxing Gibbous", emoji: "🌔", tip: "Refine your plan, review, and polish your understanding." };
  if (phase < 16.5)
    return { label: "Full Moon", emoji: "🌕", tip: "Notice emotions; release self-doubt and celebrate progress." };
  if (phase < 20.5)
    return { label: "Waning Gibbous", emoji: "🌖", tip: "Share what you know — teaching someone else cements learning." };
  if (phase < 24)
    return { label: "Last Quarter", emoji: "🌗", tip: "Let go of what’s not working in your routine and adjust." };
  return { label: "Waning Crescent", emoji: "🌘", tip: "Rest, reflect, and prepare your energy for the next cycle." };
}

export default function AstroMoonCard() {
  const [sign, setSign] = useState<ZodiacSign>("Scorpio"); // default; can be anything

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const moon = useMemo(() => getMoonPhase(today), [today]);
  const signMessage = SIGN_MESSAGES[sign];

  return (
    <div className="home-astrology-shell flex h-full flex-col justify-between">
    <div className="flex items-start justify-between gap-4">
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <div className="home-astrology-emblem flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-400/50 bg-gradient-to-br from-indigo-400 via-purple-500 to-fuchsia-500 text-lg text-white shadow-[0_0_18px_rgba(168,85,247,.45)]">
        ✦
      </div>

      <p className="text-[11px] font-semibold tracking-wide text-emerald-300">
        Astrology & Moon Cycle
      </p>
    </div>

    <p className="text-[11px] text-slate-400">
      Soft, mystical check-in — use it as gentle guidance, not pressure. ✨
    </p>
  </div>
</div>

      {/* Moon phase */}
      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-[11px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Today · {dateLabel}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-slate-100">
              {moon.emoji} {moon.label}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-200">{moon.tip}</p>
      </div>

  {/* Zodiac section */}
  <div className="astro-zodiac-panel mt-3 rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-[11px]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Your sign
          </label>
          <select
            className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-100"
            value={sign}
            onChange={(e) => setSign(e.target.value as ZodiacSign)}
          >
            {ZODIAC_SIGNS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-slate-200">{signMessage}</p>
        <p className="mt-2 text-[10px] text-slate-500">
          Take what resonates, leave the rest. Your choices matter more than the stars. 💫
        </p>

        <span
  className="astro-zodiac-art"
  aria-hidden="true"
>
  {ZODIAC_EMOJIS[sign]}
</span>
      </div>
    </div>
  );
}