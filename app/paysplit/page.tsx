// app/paysplit/page.tsx
"use client";

import React from "react";
import PaySplitApp from "../../components/PaySplit/PaySplitApp";
import { usePersistentState } from "../../components/hooks/usePersistentState";

type UserStage =
  | "junior_high"
  | "high_school"
  | "college"
  | "adult";

export default function PaySplitPage() {
  const [userStage, setUserStage] =
    usePersistentState<UserStage>(
      "affirmme_user_stage_v1",
      "adult"
    );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PaySplitApp
        userStage={userStage}
        onUserStageChange={setUserStage}
      />
    </main>
  );
}