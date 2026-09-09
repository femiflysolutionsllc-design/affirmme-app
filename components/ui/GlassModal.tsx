"use client";

import React from "react";
import Button from "./Button";
import { comicQueen } from "../theme";

type GlassModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function GlassModal({
  open,
  title,
  children,
  onClose,
}: GlassModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[28px] border p-5"
        style={{
          background: comicQueen.gradients.card,
          borderColor: `${comicQueen.colors.secondary}55`,
          boxShadow: comicQueen.glow.rose,
        }}
      >
        <div
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-25"
          style={{ background: comicQueen.colors.secondary }}
        />

        <div className="relative flex items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-wide text-white">
            {title}
          </h2>

          <Button tone="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="relative mt-4">{children}</div>
      </div>
    </div>
  );
}