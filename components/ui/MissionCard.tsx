"use client";

import React from "react";
import { comicQueen } from "../theme";
import Badge from "./Badge";

type MissionCardProps = {
  icon?: string;
  title: string;
  due: string;
  amount: string;
  tone?: "safe" | "warning" | "danger";
};

export default function MissionCard({
  icon = "📄",
  title,
  due,
  amount,
  tone = "safe",
}: MissionCardProps) {
  const accent =
    tone === "danger"
      ? comicQueen.colors.secondary
      : tone === "warning"
      ? comicQueen.colors.accent
      : comicQueen.colors.primary;

  return (
    <div
  data-tone={tone}
  className="theme-mission-card group relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
      style={{
        borderColor: `${accent}55`,
        background: comicQueen.gradients.card,
        boxShadow:
          tone === "danger"
            ? comicQueen.glow.red
            : tone === "warning"
            ? comicQueen.glow.rose
            : comicQueen.glow.blue,
      }}
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 blur-3xl"
        style={{ background: accent }}
      />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{
              background: `${accent}22`,
              border: `1px solid ${accent}55`,
            }}
          >
            {icon}
          </div>

          <div>
            <p className="text-base font-black uppercase tracking-wide text-white">
              {title}
            </p>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge
                tone={
                  tone === "danger"
                    ? "red"
                    : tone === "warning"
                    ? "gold"
                    : "green"
                }
              >
                {tone === "danger"
                  ? "Critical"
                  : tone === "warning"
                  ? "Due Soon"
                  : "Ready"}
              </Badge>

              <span
                className="text-xs"
                style={{ color: comicQueen.colors.textSecondary }}
              >
                {due}
              </span>
            </div>
          </div>
        </div>

        <div
          className="shrink-0 text-2xl font-black"
          style={{ color: accent }}
        >
          {amount}
        </div>
      </div>
    </div>
  );
}