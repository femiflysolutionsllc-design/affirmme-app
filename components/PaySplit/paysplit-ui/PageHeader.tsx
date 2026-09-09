"use client";

import React from "react";

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header>
      <h2 className="text-lg font-semibold text-emerald-300">{title}</h2>
      {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
    </header>
  );
}