"use client";

import React, { useState } from "react";
import { PaySplitProvider } from "./paysplit-store";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import Accounts from "./pages/Accounts";
import PaymentHistory from "./pages/PaymentHistory";
import PiggyBank from "./pages/PiggyBank";
import Settings from "./pages/Settings";

export type PaySplitView =
  | "dashboard"
  | "bills"
  | "piggybank"
  | "history"
  | "accounts"
  | "settings";

function MenuBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "paysplit-nav-button " +
        (active ? "is-active" : "")
      }
    >
      {label}
    </button>
  );
}

type UserStage =
  | "junior_high"
  | "high_school"
  | "college"
  | "adult";

  type PaySplitAppProps = {
    userStage: UserStage;
    userName?: string;
    onUserStageChange?: (stage: UserStage) => void;
  };
  
  export default function PaySplitApp({
    userStage,
    userName = "Friend",
    onUserStageChange,
  }: PaySplitAppProps) {
  const [view, setView] = useState<PaySplitView>("dashboard");
  console.log("PaySplit user stage:", userStage);

  return (
    <PaySplitProvider>
      <div className="paysplit-shell">
      <aside className="paysplit-sidebar">
      <p className="theme-accent paysplit-sidebar-title">
            PaySplit
          </p>

          <div className="paysplit-nav-list">
            <MenuBtn label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
            <MenuBtn label="Bills" active={view === "bills"} onClick={() => setView("bills")} />
            <MenuBtn label="Piggy Bank" active={view === "piggybank"} onClick={() => setView("piggybank")} />
            <MenuBtn label="Payment History" active={view === "history"} onClick={() => setView("history")} />
            <MenuBtn label="Accounts" active={view === "accounts"} onClick={() => setView("accounts")} />
            <MenuBtn label="Settings" active={view === "settings"} onClick={() => setView("settings")} />
          </div>
        </aside>

        <section className="paysplit-content">
        {view === "dashboard" && (
  <Dashboard
  onNavigate={setView}
  userName={userName}
/>
)}
          {view === "bills" && (
  <Bills userStage={userStage} />
)}
          {view === "piggybank" && <PiggyBank />}
          {view === "history" && <PaymentHistory />}
          {view === "accounts" && <Accounts />}
          {view === "settings" && (
  <Settings
    userStage={userStage}
    onUserStageChange={onUserStageChange}
  />
)}
        </section>
      </div>
    </PaySplitProvider>
  );
}