"use client";

import React from "react";
import SectionCard from "../paysplit-ui/SectionCard";
import StatCard from "../paysplit-ui/StatCard";

type BillSummary = {
  upcomingTotal: number;
  dueSoonTotal: number;
  overdueTotal: number;
  paidCount: number;
  upcomingCount: number;
  dueSoonCount: number;
  overdueCount: number;
};

type FinancialHealth = {
  score: number;
  label: string;
};

type NextBillDue = {
  b: {
    name: string;
    amount: number;
  };
  daysUntil: number;
} | null;

type MonthlyProgress = {
  percent: number;
  total: number;
};

type MonthlyCommandCenterProps = {
  billSummary: BillSummary;
  financialHealth: FinancialHealth;
  accountsTotal: number;
  safeToSpend: number;
  nextBillDue: NextBillDue;
  monthlyProgress: MonthlyProgress;
};

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safe);
}

export default function MonthlyCommandCenter({
  billSummary,
  financialHealth,
  accountsTotal,
  safeToSpend,
  nextBillDue,
  monthlyProgress,
}: MonthlyCommandCenterProps) {
  const totalRemaining =
    billSummary.upcomingTotal +
    billSummary.dueSoonTotal +
    billSummary.overdueTotal;

  const totalBills =
    billSummary.paidCount +
    billSummary.upcomingCount +
    billSummary.dueSoonCount +
    billSummary.overdueCount;

  const progressWidth = Math.min(
    100,
    Math.max(
      0,
      (billSummary.paidCount / Math.max(1, totalBills)) * 100
    )
  );

  return (
    <SectionCard title="Monthly Command Center">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div
          className="
          monthly-feature-card is-cover
          group relative overflow-hidden rounded-[24px] border-[3px]
            border-black bg-[#07101f] p-6
            shadow-[7px_7px_0px_rgba(0,0,0,.75)]
            transition-all duration-300 hover:-translate-y-1
            xl:col-span-2
          "
          style={{
            boxShadow:
              "7px 7px 0px rgba(0,0,0,.75), 0 0 30px rgba(59,130,246,.45)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              background:
                "radial-gradient(circle at center, white 1px, transparent 1px)",
              backgroundSize: "13px 13px",
            }}
          />

          <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#60A5FA] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
            💼 Left To Cover
          </div>

          <p className="relative mt-3 text-5xl font-black tracking-tight text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
            {money(Math.max(0, totalRemaining))}
          </p>

          <p className="relative mt-3 text-sm font-semibold text-slate-300">
            {billSummary.paidCount} paid •{" "}
            {billSummary.upcomingCount +
              billSummary.dueSoonCount +
              billSummary.overdueCount}{" "}
            remaining
          </p>

          <div className="relative mt-6 h-4 overflow-hidden rounded-full border-2 border-black bg-[#1A2245]">
            <div
              className="h-full bg-[#22C55E]"
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          <div className="absolute bottom-4 right-5 text-4xl opacity-40">
            ✦
          </div>
        </div>

        <div
          className="
          monthly-feature-card is-health
          group relative overflow-hidden rounded-[24px] border-[3px]
            border-black bg-[#07101f] p-6
            shadow-[7px_7px_0px_rgba(0,0,0,.75)]
            transition-all duration-300 hover:-translate-y-1
            xl:col-span-2
          "
          style={{
            boxShadow:
              "7px 7px 0px rgba(0,0,0,.75), 0 0 30px rgba(244,63,122,.45)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              background:
                "radial-gradient(circle at center, white 1px, transparent 1px)",
              backgroundSize: "13px 13px",
            }}
          />

          <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#F472B6] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
            ⭐ Financial Health
          </div>

          <p className="relative text-5xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
            {financialHealth.score}/100
          </p>

          <p
            className="relative mt-3 text-lg font-black"
            style={{
              color:
                financialHealth.score >= 80
                  ? "#22C55E"
                  : financialHealth.score >= 60
                    ? "#FACC15"
                    : "#F43F5E",
            }}
          >
            {financialHealth.label}
          </p>

          <div className="absolute bottom-4 right-5 text-4xl opacity-40">
            ⭐
          </div>
        </div>

        <StatCard
          label="Available Cash"
          value={money(accountsTotal)}
          tone="emerald"
        />

        <StatCard
          label="Safe To Spend"
          value={money(safeToSpend)}
          sub="Available after all remaining bills are covered"
          tone={safeToSpend > 0 ? "emerald" : "rose"}
        />

        <StatCard
          label="Next Bill Due"
          value={nextBillDue ? nextBillDue.b.name : "None"}
          sub={
            nextBillDue
              ? `${nextBillDue.daysUntil} day(s) • ${money(
                  nextBillDue.b.amount
                )}`
              : "Add a bill to begin tracking due dates"
          }
          tone={nextBillDue ? "amber" : "emerald"}
        />

        <StatCard
          label="Monthly Progress"
          value={`${monthlyProgress.percent}%`}
          sub={`${billSummary.paidCount} of ${monthlyProgress.total} bills paid`}
          tone={monthlyProgress.percent >= 75 ? "emerald" : "amber"}
        />
      </div>
    </SectionCard>
  );
}