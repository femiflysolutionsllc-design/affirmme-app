"use client";

import React from "react";

type BillStatusTone = "rose" | "amber" | "slate" | "emerald";

type BillStatusCardProps = {
  label: string;
  icon: string;
  count: number;
  amount: string;
  statusText: string;
  emptyText: string;
  tone: BillStatusTone;
};

export default function BillStatusCard({
  label,
  icon,
  count,
  amount,
  statusText,
  emptyText,
  tone,
}: BillStatusCardProps) {
  const accent =
    tone === "rose"
      ? "#F43F7A"
      : tone === "amber"
        ? "#FACC15"
        : tone === "emerald"
          ? "#22C55E"
          : "#60A5FA";

  const hasItems = count > 0;

  return (
    <div
    data-tone={tone}
    className="bills-status-card group relative overflow-hidden rounded-[24px] border-[3px] border-black bg-[#07101F] p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: `7px 7px 0px rgba(0,0,0,.75), 0 0 28px ${accent}44`,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "13px 13px",
        }}
      />

      <div
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-25 blur-3xl"
        style={{ background: accent }}
      />

      <div
        className="relative inline-flex items-center gap-2 rounded-full border-[3px] border-black px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0px_black]"
        style={{ background: accent }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      <div className="relative mt-5">
        <p className="theme-heading text-4xl text-white">
          {count} {count === 1 ? "Bill" : "Bills"}
        </p>

        {hasItems ? (
          <>
            <p className="mt-4 text-2xl font-black text-white">
              {amount}
            </p>

            <p
              className="mt-1 text-xs font-black uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              {statusText}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm font-semibold text-slate-400">
            {emptyText}
          </p>
        )}
      </div>

      <div
        className="absolute bottom-3 right-4 text-3xl opacity-35 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125"
        style={{ color: accent }}
      >
        ✦
      </div>
    </div>
  );
}