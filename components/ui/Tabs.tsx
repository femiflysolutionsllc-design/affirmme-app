"use client";

import React from "react";
import { comicQueen } from "../theme";

type TabItem = {
  id: string;
  label: string;
  icon?: string;
};

type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
};

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2 rounded-2xl border p-2"
      style={{
        background: comicQueen.gradients.card,
        borderColor: `${comicQueen.colors.accent}33`,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wide transition-all duration-300"
            style={{
              background: active ? comicQueen.gradients.button : "transparent",
              color: active
                ? comicQueen.colors.text
                : comicQueen.colors.textSecondary,
              boxShadow: active ? comicQueen.glow.rose : "none",
            }}
          >
            {tab.icon ? `${tab.icon} ` : ""}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}