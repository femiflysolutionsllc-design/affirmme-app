"use client";

import React from "react";

type UserStage =
  | "junior_high"
  | "high_school"
  | "college"
  | "adult";

type ProfileOnboardingProps = {
  userName: string;
  userStage: UserStage;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  setUserStage: React.Dispatch<React.SetStateAction<UserStage>>;
};

export default function ProfileOnboarding({
  userName,
  userStage,
  setUserName,
  setUserStage,
}: ProfileOnboardingProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftStage, setDraftStage] =
    React.useState<UserStage>(userStage);

  React.useEffect(() => {
    let savedName = userName.trim();
    let savedStage = userStage;

    try {
      const savedNameRaw = window.localStorage.getItem(
        "affirmme_user_name_v1"
      );

      const savedStageRaw = window.localStorage.getItem(
        "affirmme_user_stage_v1"
      );

      if (savedNameRaw) {
        const parsedName = JSON.parse(savedNameRaw);

        if (typeof parsedName === "string") {
          savedName = parsedName.trim();
        }
      }

      if (savedStageRaw) {
        const parsedStage = JSON.parse(savedStageRaw);

        if (
          parsedStage === "junior_high" ||
          parsedStage === "high_school" ||
          parsedStage === "college" ||
          parsedStage === "adult"
        ) {
          savedStage = parsedStage;
        }
      }
    } catch {
      // Use the current profile values.
    }

    setDraftName(savedName);
    setDraftStage(savedStage);
    setIsOpen(!savedName);
  }, []);

  function saveProfile(event: React.FormEvent) {
    event.preventDefault();

    const cleanName = draftName.trim();

    if (!cleanName) return;

    setUserName(cleanName);
    setUserStage(draftStage);
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="profile-onboarding fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-5">
      <form
        onSubmit={saveProfile}
        className="profile-onboarding-card w-full max-w-md rounded-[28px] border-[3px] border-black bg-[#111933] p-6 text-white shadow-[8px_8px_0px_black]"
      >

<div className="mb-5 flex justify-center">
  <img
    src="/affirmme-logo.jpeg"
    alt="AffirmMe — Build the life you deserve"
    className="w-full max-w-[220px] rounded-[22px] object-contain"
  />
</div>

        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
          ✨ Welcome to AffirmMe
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Let’s personalize your space
        </h1>

        <label className="mt-6 block text-xs font-black uppercase">
          What should AffirmMe call you?
        </label>

        <input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="Enter your name"
          className="mt-2 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-white"
        />

        <label className="mt-5 block text-xs font-black uppercase">
          Profile stage
        </label>

        <select
          value={draftStage}
          onChange={(event) =>
            setDraftStage(event.target.value as UserStage)
          }
          className="mt-2 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-white"
        >
          <option value="junior_high">Junior High</option>
          <option value="high_school">High School</option>
          <option value="college">College</option>
          <option value="adult">Adult</option>
        </select>

        <button
          type="submit"
          disabled={!draftName.trim()}
          className="mt-6 w-full rounded-full border-[3px] border-black bg-emerald-400 px-5 py-3 font-black uppercase text-black shadow-[4px_4px_0px_black] disabled:opacity-50"
        >
          Enter AffirmMe
        </button>
      </form>
    </div>
  );
}
