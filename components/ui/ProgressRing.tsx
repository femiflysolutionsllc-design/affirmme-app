"use client";

import React from "react";
import { comicQueen } from "../theme";

type ProgressRingProps = {
  value: number;
  size?: number;
  label?: string;
};

export default function ProgressRing({
  value,
  size = 96,
  label,
}: ProgressRingProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (safeValue / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
        className="affirmme-progress-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,.12)"
          strokeWidth={stroke}
          fill="none"
        />

        <circle
        className="affirmme-progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={comicQueen.colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="absolute text-center">
        <p className="text-lg font-black text-white">{safeValue}%</p>
        {label ? <p className="text-[10px] text-slate-400">{label}</p> : null}
      </div>
    </div>
  );
}