"use client";

import React from "react";

type StatCardMode = "comic" | "classic";

type StatCardTone = "emerald" | "amber" | "rose" | "slate";

type StatCardProps = {
  title?: string;
  label?: string;
  value: string | number;
  sub?: string;
  tone?: StatCardTone;
  mode?: StatCardMode;
};

export default function StatCard({
  title,
  label,
  value,
  sub,
  tone = "emerald",
  mode = "comic",
}: StatCardProps) {
  const displayLabel = label || title || "Statistic";

  const accent =
    tone === "emerald"
      ? "#22C55E"
      : tone === "amber"
        ? "#FACC15"
        : tone === "rose"
          ? "#F43F7A"
          : "#60A5FA";

  const icon =
    tone === "emerald"
      ? "💵"
      : tone === "amber"
        ? "⚡"
        : tone === "rose"
          ? "🚨"
          : "⭐";

  if (mode === "classic") {
    return (
      <div
  data-tone={tone}
  className="theme-stat-card rounded-2xl border border-slate-800 bg-slate-950/90 p-5"
>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {displayLabel}
        </p>

        <p className="mt-3 break-words text-3xl font-bold text-white">
          {value}
        </p>

        {sub ? (
          <p className="mt-2 text-sm text-slate-400">
            {sub}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
    data-tone={tone}
    className="
      theme-stat-card
      group
        relative
        overflow-hidden
        rounded-[24px]
        border-[3px]
        border-black
        bg-[#07101f]
        p-5
        shadow-[7px_7px_0px_rgba(0,0,0,.65)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[10px_10px_0px_rgba(0,0,0,.75)]
      "
      style={{
        boxShadow: `7px 7px 0px rgba(0,0,0,.75), 0 0 28px ${accent}55`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "13px 13px",
        }}
      />

      <div
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />

      <div
        className="relative mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-black"
        style={{
          background: accent,
          boxShadow: "4px 4px 0px rgba(0,0,0,.75)",
        }}
      >
        <span>{icon}</span>
        <span>{displayLabel}</span>
      </div>

      <p className="relative break-words text-[clamp(2rem,3vw,3.4rem)] font-black leading-none text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
        {value}
      </p>

      {sub ? (
        <p className="relative mt-3 text-sm font-semibold text-slate-300">
          {sub}
        </p>
      ) : null}

      <div
        className="absolute bottom-3 right-4 text-3xl opacity-40 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125"
        style={{ color: accent }}
      >
        ✦
      </div>
    </div>
  );
}