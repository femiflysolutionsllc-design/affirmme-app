"use client";

import React from "react";
import { comicQueen } from "../theme";

type BadgeTone = "blue" | "rose" | "gold" | "green" | "red" | "slate";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

export default function Badge({ children, tone = "blue" }: BadgeProps) {
  const color =
    tone === "rose"
      ? comicQueen.colors.secondary
      : tone === "gold"
        ? comicQueen.colors.accent
        : tone === "green"
          ? "#22C55E"
          : tone === "red"
            ? "#EF4444"
            : tone === "slate"
              ? comicQueen.colors.textSecondary
              : comicQueen.colors.primary;

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide"
      style={{
        color,
        borderColor: `${color}55`,
        background: `${color}18`,
        boxShadow: `0 0 14px ${color}22`,
      }}
    >
      {children}
    </span>
  );
}