"use client";

import React from "react";
import { comicQueen } from "../theme";

type ProgressCardProps = {
  icon?: string;
  title: string;
  subtitle?: string;
  current: number;
  target: number;
  footer?: string;
};

export default function ProgressCard({
  icon = "🎯",
  title,
  subtitle,
  current,
  target,
  footer,
}: ProgressCardProps) {
  const percent =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div
  className="theme-progress-card relative overflow-hidden rounded-[22px] border p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: comicQueen.gradients.card,
        borderColor: `${comicQueen.colors.primary}55`,
        boxShadow: comicQueen.glow.blue,
      }}
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-20"
        style={{ background: comicQueen.colors.primary }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-4xl">{icon}</div>

            <h3 className="mt-4 text-lg font-black uppercase tracking-wide text-white">
              {title}
            </h3>

            {subtitle ? (
              <p
                className="mt-1 text-sm"
                style={{ color: comicQueen.colors.textSecondary }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>

          <div
            className="rounded-full px-3 py-1 text-sm font-black"
            style={{
              background: `${comicQueen.colors.secondary}22`,
              color: comicQueen.colors.secondary,
            }}
          >
            {percent}%
          </div>
        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">
          <div
            className="affirmme-progress-fill h-full rounded-full bg-gradient-to-r from-[#FF3D5A] via-[#F6B7C8] to-[#3B82F6]"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p
          className="mt-3 text-sm font-semibold"
          style={{ color: comicQueen.colors.textSecondary }}
        >
          ${current.toLocaleString()} / ${target.toLocaleString()}
        </p>

        {footer ? (
          <p className="mt-2 text-xs text-slate-400">
            {footer}
          </p>
        ) : null}
      </div>
    </div>
  );
}