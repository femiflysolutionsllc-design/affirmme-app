"use client";
import React from "react";

export default function SoftCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-sm font-semibold text-emerald-200">{title}</h3>}
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}