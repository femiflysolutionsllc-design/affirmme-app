"use client";

import React from "react";
import { comicQueen } from "../theme";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  icon = "✨",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
    className="
    theme-empty-state
    relative
    overflow-hidden
      rounded-[26px]
      border-[3px]
      border-black
      p-8
      text-center
      shadow-[8px_8px_0px_rgba(0,0,0,.65)]
      "
      style={{
        background:
          "linear-gradient(160deg,#18224b 0%,#111933 55%,#0b1023 100%)",
      }}
    >
      {/* Comic dots */}

      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Glow */}

      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-25"
        style={{
          background: comicQueen.colors.primary,
        }}
      />

      {/* Stars */}

      <div className="absolute left-5 top-5 text-pink-300">✦</div>
      <div className="absolute right-5 bottom-5 text-cyan-300">✦</div>

      <div className="relative z-10">

        {/* Emoji */}

        <div className="mb-5 text-6xl drop-shadow-[0_4px_0_rgba(0,0,0,.45)]">
          {icon}
        </div>

        {/* Title */}

        <h3
          className="
          text-4xl
          font-black
          uppercase
          leading-none
          tracking-tight
          text-white
          drop-shadow-[4px_4px_0px_rgba(0,0,0,.45)]
          "
        >
          {title}
        </h3>

        {/* Description */}

        <p
          className="
          mx-auto
          mt-5
          max-w-md
          text-lg
          leading-8
          "
          style={{
            color: comicQueen.colors.textSecondary,
          }}
        >
          {description}
        </p>

        {action && (
          <div className="mt-8">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}