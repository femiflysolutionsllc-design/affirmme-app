"use client";

import React, { useState } from "react";
import {
  useProfile,
  type UserStage,
} from "../components/profile/ProfileProvider";
import { useTheme } from "../components/theme/ThemeProvider";
import ProfileOnboarding from "../components/ProfileOnboarding";

// ---------- HOME ----------
import DailyAffirmation from "../components/affirmations/DailyAffirmation";
import WeatherCard from "../components/Study-Planner/WeatherCard";
import TodayScheduleFromCalendar from "../components/Home/TodayScheduleFromCalendar";
import DailySummaryWithQuestions from "../components/Home/DailySummaryWithQuestions";
import WhatChangedPanel from "../components/Home/WhatChangedPanel";
import TodaysPriorities from "../components/TodaysPriorities";
import NextBestStep from "../components/NextBestStep";

// ---------- MIND & MOOD ----------
import MoodCheckIn from "../components/affirmations/MoodCheckIn";
import EmotionCoach from "../components/Home/EmotionCoach";
import TodayWin from "../components/Study-Planner/TodayWin";
import GoalsBoard from "../components/Study-Planner/GoalsBoard";
import StressCheckIn from "../components/Study-Planner/StressCheckIn";
import TriggerCoach from "../components/Study-Planner/TriggerCoach";
import HormoneReflection from "../components/Study-Planner/HormoneReflection";
import MeditationCoach from "../components/Study-Planner/MeditationCoach";
import MoodTrendPanel from "../components/Study-Planner/MoodTrendPanel";
import StressTriggerLog from "../components/Study-Planner/StressTriggerLog";
import HormoneLog from "../components/Study-Planner/HormoneLog";
import HormonePatternHints from "../components/Study-Planner/HormonePatternHints";
import ExtraMeditationSounds from "../components/Study-Planner/ExtraMeditationSounds";

// ---------- STUDY PLANNER ----------
import StudyPlanner from "../components/Study-Planner/StudyPlanner";

// ---------- CALENDAR ----------
import PersonalCalendar from "../components/Study-Planner/PersonalCalendar";

// ---------- EXTRA HOME CARDS ----------
import BibleVerseCard from "../components/BibleVerseCard";
import AstroMoonCard from "../components/AstroMoonCard";

// ---------- PAYSPLIT ----------
import PaySplitApp from "../components/PaySplit/PaySplitApp";

type MainTab =
  | "home"
  | "mind"
  | "study"
  | "calendar"
  | "paysplit";

type MindTab =
  | "overview"
  | "stressTriggers"
  | "hormones"
  | "meditation";

type AppTheme =
  | "comic"
  | "elegant"
  | "classic";

export default function Page() {
  const [activeTab, setActiveTab] =
    useState<MainTab>("home");

  const [mindTab, setMindTab] =
    useState<MindTab>("overview");

  const {
    userName,
    setUserName,
    userStage,
    setUserStage,
  } = useProfile();

  const {
    appTheme,
    setAppTheme,
  } = useTheme();

  React.useEffect(() => {
    document.documentElement.dataset.theme =
      appTheme;
  }, [appTheme]);

  return (
    <main className="theme-page">
      <ProfileOnboarding
        userName={userName}
        userStage={userStage}
        setUserName={setUserName}
        setUserStage={setUserStage}
      />

<div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
  {/* APP HEADER */}
  <header className="app-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="comic-profile-emblem" aria-label="User profile">
      <div className="comic-profile-avatar">
        {userName.trim().charAt(0).toUpperCase() || "A"}
      </div>

      <span className="comic-profile-label">
        Your Hero
      </span>
    </div>

    <div>
      <h1 className="app-brand-title text-2xl font-semibold">
        <span className="app-brand-name">
          AffirmMe
        </span>

  <span className="app-brand-subtitle">
    {" · Study & Mind Hub"}
  </span>
</h1>

            <p className="text-xs text-slate-400">
              Your affirmations, mood, study roadmap,
              and calendar all in one place.
            </p>
          </div>

          <div className="app-profile-controls flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              Name

              <input
                type="text"
                value={userName}
                onChange={(event) =>
                  setUserName(event.target.value)
                }
                placeholder="Your name"
                className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white"
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              Profile stage

              <select
                value={userStage}
                onChange={(event) =>
                  setUserStage(
                    event.target.value as UserStage
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white"
              >
                <option value="junior_high">
                  Junior High
                </option>

                <option value="high_school">
                  High School
                </option>

                <option value="college">
                  College
                </option>

                <option value="adult">
                  Adult
                </option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              Theme

              <select
                value={appTheme}
                onChange={(event) =>
                  setAppTheme(
                    event.target.value as AppTheme
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white"
              >
                <option value="comic">
                  Comic Hero
                </option>

                <option value="elegant">
                  Elegant
                </option>

                <option value="classic">
                  Classic
                </option>
              </select>
            </label>
          </div>
        </header>

        {/* MAIN TABS */}
        <nav className="app-main-nav">
          {[
            { id: "home", label: "Home" },
            { id: "mind", label: "Mind & Mood" },
            { id: "study", label: "Study Planner" },
            { id: "calendar", label: "Calendar" },
            { id: "paysplit", label: "PaySplit" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id as MainTab)
              }
              className={
                "app-main-nav-button " +
                (activeTab === tab.id
                  ? "is-active"
                  : "")
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="space-y-4">
            <header className="home-command-header rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                ✨ AffirmMe Daily Command Center
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Good Morning
                {userName.trim()
                  ? `, ${userName.trim()}`
                  : ""}{" "}
                👋
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Let’s see what your day looks like
                and what needs your attention.
              </p>
            </header>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="home-affirmation-panel rounded-2xl border border-emerald-500/25 bg-slate-950/90 p-4 shadow-lg shadow-emerald-500/10">
                  <DailyAffirmation />
                </div>
              </div>

              <div className="home-weather-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                <WeatherCard />
              </div>
            </section>

            <div className="home-checkin-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
              <DailySummaryWithQuestions />
            </div>

            <TodaysPriorities />

            <NextBestStep />

            <section className="grid gap-4 md:grid-cols-2">
              <div className="home-bible-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                <BibleVerseCard />
              </div>

              <div className="home-astrology-panel rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                <AstroMoonCard />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <TodayScheduleFromCalendar />
              <WhatChangedPanel />
            </section>
          </div>
        )}

        {/* MIND & MOOD */}
        {activeTab === "mind" && (
          <div className="mind-page-shell space-y-4">
            <header className="mind-page-header">
              <h2 className="text-lg font-semibold text-emerald-300">
                Mind & Mood
              </h2>

              <p className="text-xs text-slate-400">
                Stay in control of your mind before
                you study — notice, soothe, and plan
                your next best step.
              </p>
            </header>

            <nav className="mind-subnav flex gap-2 rounded-full bg-slate-900/80 p-1 text-[11px]">
              {[
                {
                  id: "overview",
                  label: "Overview",
                },
                {
                  id: "stressTriggers",
                  label: "Stress & Triggers",
                },
                {
                  id: "hormones",
                  label: "Hormones",
                },
                {
                  id: "meditation",
                  label: "Meditation",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setMindTab(
                      tab.id as MindTab
                    )
                  }
                  className={
                    "mind-subnav-button flex-1 rounded-full px-3 py-1.5 font-medium transition " +
                    (mindTab === tab.id
                      ? "is-active bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* OVERVIEW */}
            {mindTab === "overview" && (
              <div className="mind-overview-shell space-y-4">
                <section className="mind-overview-grid grid gap-4 md:grid-cols-2">
                  <div className="mind-affirmation-card space-y-3 rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                      Mindset Affirmation
                    </p>

                    <p className="text-[12px] text-slate-100">
                      I am learning to be in control
                      of my mind. My thoughts can get
                      loud, but I choose calm,
                      clarity, and one step at a time.
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Before you study, breathe and
                      remind yourself: you are not
                      your past; you are the one
                      choosing your next move.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="mind-mood-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                      <MoodCheckIn />
                    </div>

                    <div className="mind-emotion-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                      <EmotionCoach />
                    </div>
                  </div>
                </section>

                <section className="mind-reflection-grid grid gap-4 md:grid-cols-2">
                  <div className="mind-reflection-card space-y-3 rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                      Reflection · Today&apos;s Win
                      &amp; Next Move
                    </p>

                    <TodayWin />

                    <div className="mind-reflection-prompt mt-2 rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-[11px]">
                      <p className="font-semibold text-slate-100">
                        What can I do differently
                        tomorrow?
                      </p>

                      <p className="mt-1 text-slate-400">
                        Use this space in your journal
                        or notes to write one gentle
                        adjustment — not perfection,
                        just progress.
                      </p>
                    </div>
                  </div>

                  <div className="mind-goals-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                      Goals · Small Steps &amp; Big
                      Vision
                    </p>

                    <GoalsBoard />
                  </div>
                </section>

                <section className="mind-insights-grid grid gap-4 md:grid-cols-2">
                  <div className="mind-trend-card">
                    <MoodTrendPanel />
                  </div>

                  <div className="mind-meditation-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                    <MeditationCoach />
                  </div>
                </section>
              </div>
            )}

            {/* STRESS & TRIGGERS */}
            {mindTab === "stressTriggers" && (
              <div className="mind-stress-shell space-y-4">
                <section className="mind-stress-grid grid gap-4 md:grid-cols-2">
                  <div className="mind-stress-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                    <StressCheckIn />
                  </div>

                  <div className="mind-trigger-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                    <TriggerCoach />
                  </div>
                </section>
              </div>
            )}

            {/* HORMONES */}
            {mindTab === "hormones" && (
              <div className="mind-hormones-shell space-y-4">
                <section className="mind-hormone-reflection-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                  <HormoneReflection />
                </section>

                <section className="mind-hormone-log-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                  <HormoneLog />
                </section>

                <div className="mind-hormone-hints-card">
                  <HormonePatternHints />
                </div>
              </div>
            )}

            {/* MEDITATION */}
            {mindTab === "meditation" && (
              <div className="mind-meditation-shell space-y-4">
                <section className="mind-meditation-coach-card rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                  <MeditationCoach />
                </section>

                <div className="mind-meditation-sounds-card">
                  <ExtraMeditationSounds />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STUDY PLANNER */}
        {activeTab === "study" && (
          <div className="study-page-shell space-y-4">
            <header className="study-page-header">
              <h2 className="text-lg font-semibold text-emerald-300">
                Study Planner
              </h2>

              <p className="text-xs text-slate-400">
                Quick cheat sheets and key notes:
                your roadmap, focus blocks, and
                subject breakdowns in one place.
              </p>
            </header>

            <section className="study-content-shell rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
              <StudyPlanner />
            </section>
          </div>
        )}

        {/* CALENDAR */}
        {activeTab === "calendar" && (
          <div className="calendar-page-shell space-y-4">
            <PersonalCalendar />
          </div>
        )}

        {/* PAYSPLIT */}
        {activeTab === "paysplit" && (
          <PaySplitApp
            userStage={userStage}
            userName={userName}
            onUserStageChange={setUserStage}
          />
        )}
      </div>
    </main>
  );
}

