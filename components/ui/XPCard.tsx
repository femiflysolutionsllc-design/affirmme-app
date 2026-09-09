"use client";

import React from "react";
import ProgressRing from "./ProgressRing";
import { comicQueen } from "../theme";

type XPCardProps = {
  level?: number;
  xp: number;
  nextLevelXp: number;
  title?: string;
  subtitle?: string;
};

export default function XPCard({
  level = 1,
  xp,
  nextLevelXp,
  title = "Hero Level",
  subtitle = "Complete missions to level up.",
}: XPCardProps) {
  const percent =
    nextLevelXp > 0 ? Math.min(100, Math.round((xp / nextLevelXp) * 100)) : 0;

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border p-5"
      style={{
        background: comicQueen.gradients.card,
        borderColor: `${comicQueen.colors.accent}55`,
        boxShadow: comicQueen.glow.rose,
      }}
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-20"
        style={{ background: comicQueen.colors.secondary }}
      />

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-black text-white">
            Level {level}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {subtitle}
          </p>

          <p className="mt-3 text-xs font-semibold text-slate-300">
            {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
          </p>
        </div>

        <ProgressRing value={percent} label="XP" />
      </div>
    </div>
  );
}