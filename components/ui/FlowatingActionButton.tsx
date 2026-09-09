"use client";

import React from "react";
import { comicQueen } from "../theme";

type FloatingActionButtonProps = {
  label?: string;
  icon?: string;
  onClick?: () => void;
};

export default function FloatingActionButton({
  label = "Add",
  icon = "＋",
  onClick,
}: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{
        background: comicQueen.gradients.button,
        borderColor: `${comicQueen.colors.accent}66`,
        boxShadow: comicQueen.glow.rose,
      }}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}