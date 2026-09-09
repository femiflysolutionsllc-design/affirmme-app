"use client";

import React from "react";

import SectionCard from "../paysplit-ui/SectionCard";

import type {
  CoachMessage,
} from "../lib/coachEngine";

import {
  useProfile,
} from "../../profile/ProfileProvider";

type CoachStyle = {
  icon: string;
  label: string;
  accent: string;
  glow: string;
};

type FinancialHealth = {
  score: number;
  label: string;
};

type NextBillDue = {
  b: {
    name: string;
  };
  daysUntil: number;
} | null;

type PiggySummary = {
  progressPct: number;
};

type FinancialCoachProps = {
  greeting: string;
  onOpenBills: () => void;
  coach: CoachMessage;
  coachStyle: CoachStyle;
  financialHealth: FinancialHealth;
  nextBillDue: NextBillDue;
  piggySummary: PiggySummary;
};

export default function FinancialCoach({
  greeting,
  onOpenBills,
  coach,
  coachStyle,
  financialHealth,
  nextBillDue,
  piggySummary,
}: FinancialCoachProps) {
  const { userName } = useProfile();

  const displayName =
    userName.trim();

  return (
    <SectionCard title="🤖 Financial Coach Brief">
      <div className="financial-coach-shell">
        <p className="theme-heading financial-coach-greeting">
          {greeting}
          {displayName
            ? `, ${displayName}`
            : ""}{" "}
          👋
        </p>

        <div
          className="financial-coach-message"
          style={{
            boxShadow:
              `0 0 28px ${coachStyle.glow}`,
          }}
        >
          <div
            className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                coachStyle.accent,
            }}
          />

          <div className="relative flex items-start gap-4">
            <div
              className="financial-coach-icon"
              style={{
                background:
                  coachStyle.accent,
              }}
            >
              {coachStyle.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="theme-action text-xs font-black uppercase tracking-[0.18em]"
                style={{
                  color:
                    coachStyle.accent,
                }}
              >
                🤖 {coachStyle.label}
              </p>

              <h3 className="theme-heading financial-coach-title">
                {coach.title}
              </h3>

              <p className="financial-coach-copy">
                {coach.message}
              </p>

              <div className="mt-6 space-y-4">
                <div className="coach-detail-card is-status">
                  <p className="coach-detail-label">
                    🟢 Financial Status
                  </p>

                  <p className="coach-detail-value">
                    Financial Health Score:{" "}
                    {financialHealth.score}
                    /100
                  </p>

                  <p className="coach-detail-copy">
                    {financialHealth.label}
                  </p>
                </div>

                <div className="coach-detail-card is-mission">
                  <p className="coach-detail-label">
                    🎯 Today&apos;s Mission
                  </p>

                  <p className="coach-detail-value">
                    {coach.mood ===
                    "danger"
                      ? "Pay every overdue bill."
                      : coach.mood ===
                          "warning"
                        ? "Prepare your upcoming bills."
                        : "Transfer money into Piggy Bank."}
                  </p>
                </div>

                <div className="coach-detail-card is-threat">
                  <p className="coach-detail-label">
                    ⚡ Next Priority
                  </p>

                  <p className="coach-detail-value">
                    {nextBillDue
                      ? `${nextBillDue.b.name} is due in ${nextBillDue.daysUntil} day(s).`
                      : "No urgent financial priorities."}
                  </p>
                </div>

                <div className="coach-detail-card is-future">
                  <p className="coach-detail-label">
                    {displayName
                      ? `🏆 Future ${displayName}`
                      : "🏆 Future You"}
                  </p>

                  <p className="coach-detail-value">
                    {piggySummary.progressPct >=
                    100
                      ? "Savings goal completed!"
                      : `You’re ${
                          100 -
                          piggySummary.progressPct
                        }% away from your savings goal.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenBills}
                className="theme-action financial-coach-button"
              >
                {coach.mood === "danger"
                  ? "Review Overdue Bills"
                  : coach.mood ===
                      "warning"
                    ? "Review Upcoming Bills"
                    : "Open Bills Center"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}