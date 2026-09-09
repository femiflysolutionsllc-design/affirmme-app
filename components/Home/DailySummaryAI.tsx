"use client";

import React, { useMemo, useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type Mode = "morning" | "night";

type CheckIn = {
  sleep: string;
  focus: string;
  timeAvailable: string;
  mainWorry: string;
};

type NightCheckIn = {
  biggestWin: string;
  mood: string;
  stress: string;
  carryOver: string;
  finalThought: string;
};

type DailySummaryAIProps = {
  checkIn?: CheckIn;
  nightCheckIn?: NightCheckIn;
};

type CalendarEvent = {
  id: string;
  date: string;
  time?: string;
  title: string;
  type: string;
};

type Goal = { id: string; text?: string; title?: string; done?: boolean };
type Trigger = { id: string; trigger?: string; situation?: string };

export default function DailySummaryAI({
  checkIn,
  nightCheckIn,
}: DailySummaryAIProps) {
  const [mode, setMode] = useState<Mode>("morning");

  const [goals] = usePersistentState<Goal[]>("mind_goals", []);
  const [triggers] = usePersistentState<Trigger[]>("trigger_plans", []);
  const [todayWin] = usePersistentState<string>("today_win", "");
  const [mood] = usePersistentState<string>("mood_today", "");
  const [stress] = usePersistentState<number>("stress_level", 0);
  const [affirmation] = usePersistentState<string>(
    "affirmation_of_the_day",
    ""
  );
  const [hormonePhase] = usePersistentState<string>(
    "hormone_phase",
    "Unknown"
  );

  // from Study Planner
  const [studyFocus] = usePersistentState<string>(
    "study_today_focus",
    ""
  );

  const [allEvents] = usePersistentState<CalendarEvent[]>(
    "calendar_events_v2",
    []
  );

  const today = new Date().toISOString().slice(0, 10);
  const todaysEvents = useMemo(
    () => allEvents.filter((e) => e.date === today),
    [allEvents, today]
  );

  const mainGoal =
    goals.find((g) => !g.done && (g.text || g.title))?.text ||
    goals.find((g) => !g.done && (g.text || g.title))?.title ||
    "Protect your peace and move one step closer to your degree.";

  function makeMorningSummary() {
    const lines: string[] = [];

    if (!checkIn) {
      return [
        "Good morning. 💛",
        "",
        "You haven’t completed today’s Morning Check-In yet.",
        "",
        "Complete your check-in so AffirmMe can build today’s personalized summary."
      ].join("\n");
    }

    lines.push("Good morning. 💛");
    lines.push("");
    lines.push(
      `✨ Affirmation: "${
        affirmation || "I am rebuilding my life one powerful choice at a time."
      }"`
    );
    lines.push("");

    if (todaysEvents.length > 0) {
      lines.push("📅 Today’s schedule:");
      todaysEvents.forEach((e) => {
        lines.push(
          `• ${e.title}${
            e.time ? ` at ${e.time}` : ""
          } (${e.type || "Event"})`
        );
      });
      lines.push("");
    } else {
      lines.push(
        "📅 Today’s schedule: Not much written yet — you get to shape this day."
      );
      lines.push("");
    }

    lines.push("📚 Study focus today:");
    lines.push(
      `• ${
        studyFocus ||
        "Do one gentle 20–25 minute block on your hardest topic — no perfection, just progress."
      }`
    );
    lines.push("");

    lines.push("🎯 Today’s main focus:");
    lines.push(`• ${mainGoal}`);
    lines.push("");

    const moodText = mood || "not checked in yet";
    lines.push(`💛 Emotional note: You’re waking up feeling ${moodText}.`);

    if (stress >= 7) {
      lines.push(
        "Your stress has been high — build in extra softness: slower pacing, deeper breaths, and no pressure to be perfect."
      );
    } else if (stress <= 3) {
      lines.push(
        "Your stress has been lower — use that to gently move one important thing forward, then rest."
      );
    }

    if (checkIn) {
      lines.push("");
      lines.push("🧭 Based on your check-in:");

      if (checkIn.sleep) {
        lines.push(`• Sleep: ${checkIn.sleep}`);
      }

      if (checkIn.focus) {
        lines.push(`• Focus: ${checkIn.focus}`);
      }

      if (checkIn.timeAvailable) {
        lines.push(`• Time available: ${checkIn.timeAvailable}`);
      }

      if (checkIn.mainWorry) {
        lines.push(`• What’s on your mind: ${checkIn.mainWorry}`);
      }

      lines.push("");

      const sleepLower = checkIn.sleep.toLowerCase();
      const focusLower = checkIn.focus.toLowerCase();

      if (
        sleepLower.includes("poor") ||
        sleepLower.includes("bad") ||
        sleepLower.includes("terrible") ||
        sleepLower.includes("little") ||
        sleepLower.includes("tired")
      ) {
        lines.push(
          "💡 AffirmMe suggestion: Your energy sounds limited today. Protect the essentials, choose one meaningful priority, and give yourself permission to move at a lighter pace."
        );
      } else if (
        focusLower.includes("low") ||
        focusLower.includes("scattered") ||
        focusLower.includes("distracted")
      ) {
        lines.push(
          "💡 AffirmMe suggestion: Keep today simple. Pick one priority, work on it in a short focused block, then reassess before adding more."
        );
      } else {
        lines.push(
          "💡 AffirmMe suggestion: You have room to make progress today. Start with your most important priority before smaller tasks compete for your attention."
        );
      }

      if (checkIn.mainWorry.trim()) {
        lines.push("");
        lines.push(
          `💛 Keep in mind: You said "${checkIn.mainWorry.trim()}". Don’t let that concern quietly run the whole day — give it a specific next step when you can.`
        );
      }
    }

    return lines.join("\n");
  }

  function makeNightSummary() {
    const lines: string[] = [];

    if (!nightCheckIn) {
      return [
        "Good evening. 🌙",
        "",
        "You haven’t completed today’s Night Check-In yet.",
        "",
        "Complete your Night Check-In so AffirmMe can close out the day with you."
      ].join("\n");
    }
  
    lines.push("Good evening. 🌙"); 
    lines.push("");
  
    const biggestWin =
      nightCheckIn?.biggestWin?.trim() ||
      todayWin ||
      "You showed up and made it through today.";
  
    lines.push(`⭐ Today’s win: ${biggestWin}`);
    lines.push("");
  
    const nightMood =
      nightCheckIn?.mood?.trim() ||
      mood ||
      "not checked in";
  
    lines.push(`😌 Tonight you’re feeling: ${nightMood}`);
  
    const nightStress =
      nightCheckIn?.stress?.trim();
  
    if (nightStress) {
      lines.push(`🔥 Stress tonight: ${nightStress}/10`);
    } else {
      lines.push(`🔥 Stress: ${stress}/10`);
    }
  
    lines.push("");
  
    if (nightCheckIn?.carryOver?.trim()) {
      lines.push("📌 Carrying into tomorrow:");
      lines.push(`• ${nightCheckIn.carryOver.trim()}`);
      lines.push("");
    }
  
    if (studyFocus) {
      lines.push("📚 Study reflection:");
      lines.push(
        `• Your focus was "${studyFocus}". Whatever you completed today counts as progress.`
      );
      lines.push("");
    }
  
    if (nightCheckIn?.finalThought?.trim()) {
      lines.push("💭 What’s still on your mind:");
      lines.push(`• ${nightCheckIn.finalThought.trim()}`);
      lines.push("");
    }
  
    const stressNumber = Number(
      nightCheckIn?.stress || stress
    );
  
    if (stressNumber >= 7) {
      lines.push(
        "💛 AffirmMe reflection: Today asked a lot from you. Carry forward only what truly needs your attention tomorrow. The rest can wait."
      );
    } else if (stressNumber >= 4) {
      lines.push(
        "💛 AffirmMe reflection: You carried some pressure today. Give tomorrow a clear starting point, then let yourself close out tonight."
      );
    } else {
      lines.push(
        "💛 AffirmMe reflection: You’re ending the day with some breathing room. Let yourself enjoy that instead of immediately filling the space with tomorrow."
      );
    }
  
    lines.push("");
    lines.push(
      "🌙 Tomorrow does not need everything from you at once. Rest tonight, keep what matters, and begin again from there."
    );
  
    return lines.join("\n");
  }

  function getSummaryText() {
    return mode === "morning" ? makeMorningSummary() : makeNightSummary();
  }

  // 🗣️ Voice version – remove emojis & extra spaces
  function getSpokenSummary() {
    const raw =
      mode === "morning" ? makeMorningSummary() : makeNightSummary();

    // strip emojis we used
    const noEmoji = raw.replace(/[✨📅📚🎯💛⭐😌🔥⚡🌙]/g, "");

    // compress whitespace to sound smoother
    return noEmoji.replace(/\s+/g, " ").trim();
  }

  function speakSummary() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech is not supported in this browser.");
      return;
    }
    const text = getSpokenSummary();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking() {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
  }

  return (
    <section className="space-y-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-950/90 via-slate-950 to-emerald-950/30 p-4 text-sm text-slate-100 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300">
            Daily Summary
          </p>
          <p className="text-[11px] text-slate-400">
            Pulled from your calendar, goals, mood, hormones and study focus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Morning / Night toggle */}
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 text-[11px]">
            <button
              type="button"
              onClick={() => setMode("morning")}
              className={
                "px-2.5 py-1 rounded-full " +
                (mode === "morning"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300")
              }
            >
              Morning
            </button>
            <button
              type="button"
              onClick={() => setMode("night")}
              className={
                "px-2.5 py-1 rounded-full " +
                (mode === "night"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300")
              }
            >
              Night
            </button>
          </div>

          {/* Voice buttons */}
          <div className="inline-flex gap-1">
            <button
              type="button"
              onClick={speakSummary}
              className="rounded-full border border-emerald-400/80 px-2 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/10"
            >
              🔊 Read
            </button>
            <button
              type="button"
              onClick={stopSpeaking}
              className="rounded-full border border-slate-600 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
            >
              ■ Stop
            </button>
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs whitespace-pre-wrap">
        {getSummaryText()}
      </div>
    </section>
  );
}