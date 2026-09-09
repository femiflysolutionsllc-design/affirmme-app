"use client";

import React, { useEffect, useMemo, useState } from "react";

type LevelKey =
  | "jr_high"
  | "high_school"
  | "college"
  | "lp"
  | "rn"
  | "bsn"
  | "general";

type MoodTag =
  | "okay"
  | "happy"
  | "focused"
  | "anxious"
  | "overwhelmed"
  | "angry"
  | "sad"
  | "depressed"
  | "tired";

type JournalEntry = {
  id: string;
  createdAt: string;
  levelKey: LevelKey;
  mood: MoodTag;
  stress: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  miniJournal: string;
  talkItOut: string;
  coachResponse: string;
  studyAdjustment: string;
};

const STORAGE_KEY = "affirmme_mind_journal_entries_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashToIndex(seed: string, mod: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return mod === 0 ? 0 : h % mod;
}

function toneLabel(levelKey: LevelKey) {
  switch (levelKey) {
    case "jr_high":
      return "Junior High";
    case "high_school":
      return "High School";
    case "college":
      return "College";
    case "lp":
      return "LPN";
    case "rn":
      return "RN";
    case "bsn":
      return "BSN";
    default:
      return "General";
  }
}

function getPromptOfTheDay(levelKey: LevelKey) {
  const prompts = [
    "What’s the real thing bothering me right now—under the surface?",
    "If I could do ONE tiny thing today to help Future Me, what would it be?",
    "What is one thought I’m believing that might not be 100% true?",
    "What do I need: rest, reassurance, a plan, or a release?",
    "What would I tell my best friend if they felt like this?",
    "What’s one small win I can collect in the next 15 minutes?",
    "What’s a trigger I keep repeating—and what boundary could protect me?",
    "What’s one kind, realistic sentence I can say to myself right now?",
  ];

  // slightly different vibe per level (but still safe + supportive)
  const levelBoost: Record<LevelKey, string[]> = {
    jr_high: [
      "What’s one thing you wish an adult understood about how you feel?",
      "What’s one safe person you can talk to, even a little?",
    ],
    high_school: [
      "What pressure are you carrying that you don’t talk about much?",
      "What would “good enough” look like today?",
    ],
    college: [
      "What’s one priority I can focus on—without doing everything at once?",
      "What boundary would protect my energy this week?",
    ],
    lp: [
      "What’s the next best step—not the perfect step?",
      "What topic needs a simple plan + repetition?",
    ],
    rn: [
      "What’s the highest-yield focus for the next study block?",
      "What’s one clinical concept I can connect to what I’m learning?",
    ],
    bsn: [
      "What’s the concept map for what I’m feeling + what I’m doing next?",
      "What’s one evidence-based coping skill I can actually do right now?",
    ],
    general: [],
  };

  const all = [...prompts, ...(levelBoost[levelKey] ?? [])];
  const idx = hashToIndex(`${todayKey()}|${levelKey}`, all.length);
  return all[idx] ?? prompts[0];
}

function buildStudyAdjustment(levelKey: LevelKey, mood: MoodTag, stress: 1 | 2 | 3 | 4 | 5) {
  // Stress-based base plan
  const base =
    stress >= 4
      ? "Do a SHORT study block (10–20 min), then a reset break. Aim for one small win, not perfection."
      : stress === 3
      ? "Do a focused 25-minute block, then a 5-minute break. Keep it simple."
      : "You can handle a normal study block. Keep momentum with active recall.";

  // Mood-based add-on
  let moodAddon = "";
  if (mood === "depressed" || mood === "sad") {
    moodAddon =
      " Keep the bar low: pick ONE easy topic, use guided notes, and stop after a small win. If this feeling is heavy or lasting, consider reaching out to someone you trust.";
  } else if (mood === "anxious" || mood === "overwhelmed") {
    moodAddon =
      " Reduce choices: pick ONE task. Use a timer. No scrolling, no multitasking. Write a 3-step plan and only do step 1.";
  } else if (mood === "angry") {
    moodAddon =
      " Do a 60-second reset first. Then channel the energy into 10 practice questions or flashcards—quick wins.";
  } else if (mood === "tired") {
    moodAddon =
      " Switch to low-energy mode: review summaries, listen/read, or do 5–10 easy questions. Hydrate and stretch.";
  } else if (mood === "focused" || mood === "happy") {
    moodAddon =
      " Ride the wave: do active recall (practice questions, teach-back, flashcards) for the first 30 minutes.";
  }

  // Nursing-specific nudge
  const nursingNudge =
    levelKey === "lp" || levelKey === "rn" || levelKey === "bsn"
      ? " Nursing tip: prioritize safety, ABCs, and high-yield systems. End with 3 quick NCLEX-style questions."
      : "";

  return `${base}${moodAddon}${nursingNudge}`;
}

function buildCoachResponse(levelKey: LevelKey, mood: MoodTag, stress: 1 | 2 | 3 | 4 | 5, miniJournal: string) {
  const tone =
    levelKey === "jr_high"
      ? "gentle"
      : levelKey === "high_school"
      ? "encouraging"
      : levelKey === "college"
      ? "grounded"
      : levelKey === "lp" || levelKey === "rn" || levelKey === "bsn"
      ? "clinical"
      : "supportive";

  const stressLine =
    stress >= 4
      ? "Your nervous system is loud right now."
      : stress === 3
      ? "You’re in the middle zone—manageable with structure."
      : "You’re relatively steady right now.";

  const moodLine =
    mood === "depressed"
      ? "That heavy, low-energy feeling deserves care, not criticism."
      : mood === "sad"
      ? "Sad doesn’t mean you’re failing—just that you’re human."
      : mood === "anxious"
      ? "Anxiety loves uncertainty—so we’ll shrink the task."
      : mood === "overwhelmed"
      ? "Overwhelm means too many tabs are open in your brain."
      : mood === "angry"
      ? "Anger can be a signal that a boundary got crossed."
      : mood === "tired"
      ? "Your body is asking for gentleness."
      : "Let’s use this moment well.";

  const action =
    stress >= 4
      ? "Do this now: inhale 4, hold 4, exhale 6 — repeat 5 times. Then choose ONE 10-minute task."
      : "Pick ONE small next step and do it for 10–25 minutes. Then stop and reassess.";

  const reflection =
    miniJournal.trim().length > 0
      ? "I read your journal—thank you for being real with yourself."
      : "If you can, write 3–5 sentences. It helps your brain un-clench.";

  if (tone === "clinical") {
    return `${stressLine} ${moodLine} ${reflection} Plan: ${action}`;
  }

  if (tone === "gentle") {
    return `${stressLine} ${moodLine} You’re not alone. ${action}`;
  }

  return `${stressLine} ${moodLine} ${action}`;
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function MindMoodAddOns({ levelKey }: { levelKey: string }) {
  const normalized = (levelKey || "general") as LevelKey;
  const finalLevel: LevelKey = ([
    "jr_high",
    "high_school",
    "college",
    "lp",
    "rn",
    "bsn",
    "general",
  ] as LevelKey[]).includes(normalized)
    ? normalized
    : "general";

  const prompt = useMemo(() => getPromptOfTheDay(finalLevel), [finalLevel]);

  const [mood, setMood] = useState<MoodTag>("okay");
  const [stress, setStress] = useState<1 | 2 | 3 | 4 | 5>(3);

  // 3–5 sentence journal + “talk it out”
  const [miniJournal, setMiniJournal] = useState("");
  const [talkItOut, setTalkItOut] = useState("");

  // saved entries
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [resetSeconds, setResetSeconds] = useState<number>(0);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    setEntries(safeParse<JournalEntry[]>(raw, []));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (resetSeconds <= 0) return;
    const t = setInterval(() => setResetSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resetSeconds]);

  const studyAdjustment = useMemo(
    () => buildStudyAdjustment(finalLevel, mood, stress),
    [finalLevel, mood, stress]
  );

  const coachResponse = useMemo(
    () => buildCoachResponse(finalLevel, mood, stress, miniJournal),
    [finalLevel, mood, stress, miniJournal]
  );

  function saveEntry() {
    const entry: JournalEntry = {
      id: uid(),
      createdAt: new Date().toISOString(),
      levelKey: finalLevel,
      mood,
      stress,
      prompt,
      miniJournal: miniJournal.trim(),
      talkItOut: talkItOut.trim(),
      coachResponse,
      studyAdjustment,
    };
    setEntries((prev) => [entry, ...prev]);
    setMiniJournal("");
    setTalkItOut("");
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function startReset60() {
    setResetSeconds(60);
  }

  return (
    <div className="space-y-3">
      {/* JOURNAL + COACH CARD */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-emerald-200">
              Journal + Coach ({toneLabel(finalLevel)})
            </h4>
            <p className="mt-1 text-[11px] text-slate-400">
              Prompt of the day: <span className="text-slate-200">{prompt}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={startReset60}
            className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400"
          >
            {resetSeconds > 0 ? `Reset: ${resetSeconds}s` : "60s Reset"}
          </button>
        </div>

        {/* Mood + stress controls */}
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-[11px] font-semibold text-slate-200">Mood tag</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["okay","happy","focused","anxious","overwhelmed","angry","sad","depressed","tired"] as MoodTag[]).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setMood(tag)}
                  className={`rounded-full border px-3 py-1 text-[11px] ${
                    mood === tag
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-[11px] font-semibold text-slate-200">
              Stress level (1 calm → 5 overwhelmed)
            </p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStress(n as 1 | 2 | 3 | 4 | 5)}
                  className={`h-9 w-9 rounded-full border text-[12px] ${
                    stress === n
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mini journal */}
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] font-semibold text-slate-200">
            Mini journal (3–5 sentences)
          </p>
          <textarea
            value={miniJournal}
            onChange={(e) => setMiniJournal(e.target.value)}
            placeholder="Write 3–5 sentences. Example: “I feel ___ because ___. My body feels ___. I need ___. My next step is ___.”"
            className="mt-2 h-24 w-full resize-none rounded-md border border-emerald-500/30 bg-slate-900/80 p-2 text-[11px] text-slate-100 outline-none"
          />
          <div className="mt-2 text-[11px] text-slate-400">
            Tip: keep it simple and honest. This is private and saved on your device.
          </div>
        </div>

        {/* Talk it out */}
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-slate-200">Talk it out (voice-ready)</p>
            <button
              type="button"
              onClick={() => setTalkItOut((t) => (t.trim() ? t : miniJournal))}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400"
            >
              Copy mini journal →
            </button>
          </div>
          <textarea
            value={talkItOut}
            onChange={(e) => setTalkItOut(e.target.value)}
            placeholder="Type like you’re talking. Later, we’ll connect mic-to-text here."
            className="mt-2 h-24 w-full resize-none rounded-md border border-emerald-500/30 bg-slate-900/80 p-2 text-[11px] text-slate-100 outline-none"
          />
        </div>

        {/* Coach response */}
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
          <p className="text-[11px] font-semibold text-emerald-200">Coach response</p>
          <p className="mt-1 text-[11px] text-slate-100">{coachResponse}</p>
        </div>

        {/* Study adjustment */}
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] font-semibold text-slate-200">Mood → study adjustment</p>
          <p className="mt-1 text-[11px] text-slate-100">{studyAdjustment}</p>
        </div>

        {/* Save */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={saveEntry}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Save journal entry
          </button>

          <span className="text-[11px] text-slate-400">
            Multiple entries supported ✅
          </span>
        </div>
      </div>

      {/* SAVED ENTRIES */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <h4 className="text-sm font-semibold text-emerald-200">Saved journal entries</h4>
        <p className="mt-1 text-[11px] text-slate-400">
          Tap an entry to review what you wrote and what the coach suggested.
        </p>

        {entries.length === 0 ? (
          <p className="mt-3 text-[11px] text-slate-400">No entries yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {entries.slice(0, 20).map((e) => (
              <details
                key={e.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
              >
                <summary className="cursor-pointer text-[11px] text-slate-200">
                  <span className="font-semibold">{new Date(e.createdAt).toLocaleString()}</span>
                  <span className="ml-2 text-slate-400">
                    • mood: {e.mood} • stress: {e.stress} • {toneLabel(e.levelKey)}
                  </span>
                </summary>

                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">Prompt</p>
                    <p className="text-[11px] text-slate-100">{e.prompt}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">Mini journal</p>
                    <p className="text-[11px] text-slate-100 whitespace-pre-wrap">{e.miniJournal || "—"}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">Talk it out</p>
                    <p className="text-[11px] text-slate-100 whitespace-pre-wrap">{e.talkItOut || "—"}</p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                    <p className="text-[11px] font-semibold text-emerald-200">Coach response</p>
                    <p className="mt-1 text-[11px] text-slate-100 whitespace-pre-wrap">{e.coachResponse}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-200">Study adjustment</p>
                    <p className="text-[11px] text-slate-100 whitespace-pre-wrap">{e.studyAdjustment}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteEntry(e.id)}
                    className="rounded-xl border border-rose-500/40 bg-rose-950/20 px-3 py-1 text-[11px] text-rose-200 hover:border-rose-400"
                  >
                    Delete entry
                  </button>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}