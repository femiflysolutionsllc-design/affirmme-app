"use client";

import React from "react";
import { comicQueen } from "../theme";

type NotificationToastProps = {
  title: string;
  message?: string;
  tone?: "success" | "warning" | "danger" | "info";
};

export default function NotificationToast({
  title,
  message,
  tone = "info",
}: NotificationToastProps) {
  const color =
    tone === "success"
      ? "#22C55E"
      : tone === "warning"
        ? comicQueen.colors.accent
        : tone === "danger"
          ? comicQueen.colors.secondary
          : comicQueen.colors.primary;

  return (
    <div
      className="fixed right-5 top-5 z-[120] max-w-sm rounded-2xl border p-4 shadow-xl"
      style={{
        background: comicQueen.gradients.card,
        borderColor: `${color}55`,
        boxShadow: `0 0 24px ${color}33`,
      }}
    >
      <p className="text-sm font-black uppercase tracking-wide text-white">
        {title}
      </p>

      {message ? (
        <p className="mt-1 text-xs text-slate-400">
          {message}
        </p>
      ) : null}
    </div>
  );
}