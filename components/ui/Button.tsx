"use client";

import React from "react";
import { comicQueen } from "../theme";

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = {
  children: React.ReactNode;
  tone?: ButtonTone;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export default function Button({
  children,
  tone = "primary",
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  const styles =
    tone === "primary"
      ? {
          background: comicQueen.gradients.button,
          color: comicQueen.colors.text,
          borderColor: `${comicQueen.colors.accent}55`,
          boxShadow: comicQueen.glow.rose,
        }
      : tone === "secondary"
        ? {
            background: `${comicQueen.colors.primary}22`,
            color: comicQueen.colors.text,
            borderColor: `${comicQueen.colors.primary}55`,
            boxShadow: comicQueen.glow.blue,
          }
        : tone === "danger"
          ? {
              background: `${comicQueen.colors.secondary}22`,
              color: comicQueen.colors.text,
              borderColor: `${comicQueen.colors.secondary}55`,
              boxShadow: comicQueen.glow.red,
            }
          : {
              background: "transparent",
              color: comicQueen.colors.textSecondary,
              borderColor: `${comicQueen.colors.textSecondary}33`,
              boxShadow: "none",
            };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={styles}
    >
      {children}
    </button>
  );
}