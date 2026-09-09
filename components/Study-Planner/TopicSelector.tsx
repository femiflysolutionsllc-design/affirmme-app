// components/Study-Planner/TopicSelector.tsx
"use client";

import React from "react";
import { lpnTopics } from "../data/lpnTopics";
import { usePersistentState } from "../hooks/usePersistentState";

export default function TopicSelector() {
  const [topicId, setTopicId] = usePersistentState<string>(
    "study_topic",
    lpnTopics[0]?.id ?? "w1-fundamentals"
  );

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-50">
        Pick your focus topic
      </h2>
      <p className="text-xs text-slate-400">
        Choose what you want to dial in this week or this study block.
      </p>

      <select
        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
      >
        {lpnTopics.map((t) => (
          <option key={t.id} value={t.id}>
            Week {t.week} — {t.area}
          </option>
        ))}
      </select>
    </section>
  );
}