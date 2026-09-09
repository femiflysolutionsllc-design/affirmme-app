"use client";

import React, { useMemo, useState } from "react";

type Verse = {
  reference: string;
  text: string;
};

const VERSES: Verse[] = [
  {
    reference: "Jeremiah 29:11",
    text: "“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
  },
  {
    reference: "Psalm 46:5",
    text: "God is within her, she will not fall; God will help her at break of day.",
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding.",
  },
  {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him.",
  },
];

function getTodayIndex(max: number): number {
  const today = new Date();
  const key = today.getFullYear() * 1000 + (today.getMonth() + 1) * 32 + today.getDate();
  return key % max;
}

export default function BibleVerseCard() {
  const [index, setIndex] = useState(() => getTodayIndex(VERSES.length));

  const verse = useMemo(() => VERSES[index], [index]);

  function shuffleVerse() {
    if (VERSES.length <= 1) return;
    let next = index;
    while (next === index) {
      next = Math.floor(Math.random() * VERSES.length);
    }
    setIndex(next);
  }

  return (
    <div className="home-bible-shell flex h-full flex-col justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold tracking-wide text-emerald-300">
        📖 Bible Verse of the Day
        </p>
        <p className="text-[11px] text-slate-400">
          A quick scripture touchpoint to steady your heart before you study.
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-[11px]">
        <p className="text-[11px] leading-relaxed text-slate-100">
          {verse.text}
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
          {verse.reference}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px]">
        <button
          type="button"
          onClick={shuffleVerse}
          className="rounded-full border border-emerald-500/60 bg-slate-950 px-3 py-1 font-semibold text-emerald-300 hover:bg-emerald-500/10"
        >
          Shuffle verse
        </button>
        <span className="text-[10px] text-slate-500">
          Let this sit with you for today. 💛
        </span>
      </div>
    </div>
  );
}