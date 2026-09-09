"use client";

import React from "react";
import { comicQueen } from "../../theme";

type PageShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function PageShell({
  title,
  subtitle,
  children,
}: PageShellProps) {
  return (
    <div
      className="space-y-5"
      style={{
        background: comicQueen.gradients.page,
        minHeight: "100%",
      }}
    >
      {(title || subtitle) && (
        <header
          className="relative overflow-hidden rounded-[28px] border p-6"
          style={{
            background: comicQueen.gradients.hero,
            borderColor: comicQueen.colors.border,
            boxShadow: comicQueen.glow.rose,
          }}
        >
          {/* comic glow */}
          <div
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-20"
            style={{ background: comicQueen.colors.secondary }}
          />

          <div
            className="absolute left-0 bottom-0 h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg,#ff4d6d,#ff85b3,#4ea1ff)",
            }}
          />

          {title && (
            <h1
              className="relative text-4xl font-black tracking-tight"
              style={{ color: comicQueen.colors.text }}
            >
              {title}
            </h1>
          )}

          {subtitle && (
            <p
              className="relative mt-2 max-w-2xl text-sm"
              style={{ color: comicQueen.colors.textSecondary }}
            >
              {subtitle}
            </p>
          )}
        </header>
      )}

      <main className="space-y-5">
        {children}
      </main>
    </div>
  );
}