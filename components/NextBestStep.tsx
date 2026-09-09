"use client";

import React, { useMemo } from "react";
import { usePersistentState } from "./hooks/usePersistentState";

type CalendarEvent = {
  id: string;
  date: string;
  time?: string;
  title: string;
  type?: string;
  prepMinutes?: number;
};

type MorningAnswers = {
  sleep: string;
  focus: string;
  timeAvailable: string;
  mainWorry: string;
};

type DailyCheckInRecord = {
  date: string;

  morning?: {
    answers: MorningAnswers;
    generatedAt: number;
  };
};

type NextStep = {
  title: string;
  detail: string;
  reason: string;
  tone: "blue" | "amber" | "emerald";
};

function getLocalDateString(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NextBestStep() {
  const now = new Date();
  const today = getLocalDateString(now);

  const [events] =
    usePersistentState<CalendarEvent[]>(
      "calendar_events_v2",
      []
    );

  const [savedCheckIn] =
    usePersistentState<DailyCheckInRecord | null>(
      `daily_checkin_${today}`,
      null
    );

  const nextStep = useMemo<NextStep>(() => {
    const morning =
      savedCheckIn?.morning?.answers;

    const currentTime =
      `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

    const upcomingEvents = (events || [])
      .filter(
        (event) =>
          event.date === today &&
          (!event.time ||
            event.time >= currentTime)
      )
      .sort((first, second) =>
        (first.time || "").localeCompare(
          second.time || ""
        )
      );

    const nextEvent = upcomingEvents[0];

    /*
     * Calendar commitment gets first attention.
     */
    if (nextEvent?.time) {
      const [hours, minutes] =
        nextEvent.time
          .split(":")
          .map(Number);

      const eventDate = new Date(now);

      eventDate.setHours(
        hours,
        minutes,
        0,
        0
      );

      /*
       * V1 preparation buffer:
       * recommend getting ready / leaving
       * 40 minutes before the event.
       *
       * Later this can be replaced by
       * real travel + traffic data.
       */
      const prepMinutes =
  Math.max(
    0,
    Number(
      nextEvent.prepMinutes ?? 0
    )
  );

const prepDate = new Date(
  eventDate.getTime() -
    prepMinutes * 60 * 1000
);

      return {
        title: `Prepare for ${nextEvent.title}`,
        detail:
  prepMinutes > 0
    ? `Your next event is at ${formatTime(
        eventDate
      )}. Aim to be ready or leave around ${formatTime(
        prepDate
      )}.`
    : `Your next event is at ${formatTime(
        eventDate
      )}. No prep or travel buffer is set yet.`,
      reason:
      prepMinutes > 0
        ? `You gave yourself ${prepMinutes} minutes before this event.`
        : "Add prep or travel time to the calendar event if you want AffirmMe to help you plan when to get ready or leave.",
        tone: "blue",
      };
    }

    /*
     * Low energy becomes the recommendation
     * when there is no upcoming timed event.
     */
    if (
      morning?.sleep === "poor" ||
      morning?.focus === "low"
    ) {
      return {
        title: "Protect your energy",
        detail:
          "Choose one important task and keep the rest of today lighter.",
        reason:
          "Your morning check-in suggests your energy or focus needs some protection today.",
        tone: "amber",
      };
    }

    /*
     * Default recommendation.
     */
    return {
      title: "Move one thing forward",
      detail:
        "Choose the most important unfinished thing and give it one focused block.",
      reason:
        "You don't need to tackle everything at once to make today count.",
      tone: "emerald",
    };
  }, [
    events,
    savedCheckIn,
    today,
  ]);

  function toneClasses() {
    if (nextStep.tone === "blue") {
      return "border-blue-500/30 bg-blue-500/10";
    }

    if (nextStep.tone === "amber") {
      return "border-amber-500/30 bg-amber-500/10";
    }

    return "border-emerald-500/30 bg-emerald-500/10";
  }

  return (
    <section
      className={
        "home-next-step-shell rounded-2xl border p-4 " +
        toneClasses()
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
        ✨ Your Next Best Step
      </p>

      <h3 className="mt-2 text-sm font-black text-white">
        {nextStep.title}
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-200">
        {nextStep.detail}
      </p>

      <p className="mt-2 text-[11px] text-slate-400">
        {nextStep.reason}
      </p>
    </section>
  );
}