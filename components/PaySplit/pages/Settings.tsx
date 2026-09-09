"use client";

import React from "react";
import { usePaySplitStore } from "../store";

type UserStage =
  | "junior_high"
  | "high_school"
  | "college"
  | "adult";

type SettingsProps = {
  userStage: UserStage;
  onUserStageChange?: (stage: UserStage) => void;
};

export default function Settings({
  userStage,
  onUserStageChange,
}: SettingsProps) {
  const { store, actions } = usePaySplitStore();
  const s = store.settings;

  const levelDetails = {
    junior_high: {
      icon: "🎒",
      title: "Junior High",
      description:
        "Simple money lessons focused on allowance, saving, school expenses, and learning how bills work.",
      examples: ["Allowance", "School supplies", "Games", "Savings goals"],
    },
    high_school: {
      icon: "🎓",
      title: "High School",
      description:
        "Introduces income, part-time work, transportation, phone bills, saving, and responsible spending.",
      examples: ["Part-time income", "Phone bill", "Car savings", "Activities"],
    },
    college: {
      icon: "📚",
      title: "College",
      description:
        "Supports more advanced budgeting for tuition, rent, food, transportation, subscriptions, and personal bills.",
      examples: ["Tuition", "Rent", "Groceries", "Transportation"],
    },
    adult: {
      icon: "💼",
      title: "Working Adult",
      description:
        "Supports full budgeting for paychecks, housing, utilities, debt, transportation, savings, and family expenses.",
      examples: ["Paychecks", "Mortgage / Rent", "Utilities", "Debt", "Savings"],
    },
  };

  const selectedLevel =
  levelDetails[userStage] ?? levelDetails.high_school;

  return (
    <div className="space-y-6">
      {/* Settings header */}
      <section className="paysplit-settings-hero-shell relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-6 shadow-[8px_8px_0px_black]">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "radial-gradient(circle at center, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative">
          <div className="inline-flex rounded-full border-[3px] border-black bg-[#F43F7A] px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[5px_5px_0px_black]">
            ⚙️ PaySplit Settings
          </div>

          <h2 className="mt-5 text-3xl font-black uppercase text-white drop-shadow-[4px_4px_0px_black] sm:text-4xl">
            Make PaySplit Fit You
          </h2>

          <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-300">
            Adjust PaySplit based on the student&apos;s age and experience with
            money. The app can stay simple for younger users and become more
            detailed as they grow.
          </p>
        </div>
      </section>

      {/* PaySplit access */}
      <section className="paysplit-access-shell rounded-[28px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]">
        <div className="inline-flex rounded-full border-[3px] border-black bg-[#FACC15] px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[5px_5px_0px_black]">
          💰 PaySplit Access
        </div>

        <div className="mt-5 rounded-[22px] border-[3px] border-black bg-[#080A16] p-5 shadow-[5px_5px_0px_black]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black uppercase text-white">
                Use PaySplit
              </p>

              <p className="mt-2 max-w-xl text-sm font-semibold text-slate-400">
                Turn the financial section on or off. This is useful when a
                younger student is not ready to manage bills yet.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={s.usePaySplit}
                onChange={(event) =>
                  actions.updateSettings({
                    usePaySplit: event.target.checked,
                  })
                }
                className="h-5 w-5 accent-emerald-500"
              />

              <span
                className={
                  "rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_black] " +
                  (s.usePaySplit
                    ? "bg-[#22C55E] text-black"
                    : "bg-[#F43F7A] text-white")
                }
              >
                {s.usePaySplit ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Student level */}
      <section className="financial-learning-level-shell rounded-[28px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]">
        <div className="inline-flex rounded-full border-[3px] border-black bg-[#60A5FA] px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[5px_5px_0px_black]">
          🎓 Financial Learning Level
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-300">
        PaySplit uses the AffirmMe profile stage to adjust wording, recommendations, examples, financial lessons, and future Jarvis coaching.
        </p>

        <div className="mt-5">
          <label className="text-xs font-black uppercase text-slate-300">
            AffirmMe Profile Stage
          </label>

          <select
  className="mt-2 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-bold text-white"
  value={userStage}
  onChange={(event) =>
    onUserStageChange?.(
      event.target.value as UserStage
    )
  }
>
  <option value="junior_high">Junior High</option>
  <option value="high_school">High School</option>
<option value="college">College</option>
<option value="adult">Adult</option>
</select>
        </div>

        <div className="mt-5 rounded-[24px] border-[3px] border-black bg-[#0A1024] p-5 shadow-[6px_6px_0px_black]">
          <div className="flex items-start gap-4">
            <div className="rounded-[18px] border-[3px] border-black bg-[#FACC15] p-3 text-3xl shadow-[4px_4px_0px_black]">
              {selectedLevel.icon}
            </div>

            <div>
              <p className="text-xl font-black uppercase text-white">
                {selectedLevel.title} Mode
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-300">
                {selectedLevel.description}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedLevel.examples.map((example) => (
              <span
                key={example}
                className="rounded-full border-[3px] border-black bg-[#111933] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_black]"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Future controls */}
      <section className="future-controls-shell rounded-[28px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]">
        <div className="inline-flex rounded-full border-[3px] border-black bg-[#F43F7A] px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[5px_5px_0px_black]">
        🚀 Coming in V2
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4 shadow-[4px_4px_0px_black]">
            <p className="text-sm font-black uppercase text-[#FACC15]">
              🔐 Parent Mode
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              A PIN could protect important settings for Junior High users.
            </p>
          </div>

          <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4 shadow-[4px_4px_0px_black]">
            <p className="text-sm font-black uppercase text-[#60A5FA]">
              👀 Simple View
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Hide advanced tools until the student is ready for them.
            </p>
          </div>

          <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4 shadow-[4px_4px_0px_black]">
            <p className="text-sm font-black uppercase text-emerald-300">
              🔔 Money Reminders
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Remind users about allowance, paychecks, bills, and savings.
            </p>
          </div>
        </div>
      </section>

      {/*
        ROOMMATE SETTINGS RESERVED FOR LATER

        The original store fields remain available:
        - s.enableRoommate
        - s.roommateName

        We are intentionally not showing roommate controls in Settings.
        Shared expenses can later be handled inside Bills without making
        "roommate" part of the user's main profile.
      */}
    </div>
  );
}