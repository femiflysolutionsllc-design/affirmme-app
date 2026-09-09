"use client";

import React from "react";
import SectionCard from "../paysplit-ui/SectionCard";
import StatCard from "../paysplit-ui/StatCard";
import MissionCard from "../../ui/MissionCard";
import EmptyState from "../../ui/EmptyState";
import BillStatusCard from "./BillStatusCard";


type TimelineBill = {
  b: {
    id: string;
    name: string;
    amount: number;
    category?: string;
  };
  nextDue: string;
  daysUntil: number;
};

type BillSummary = {
  overdueCount: number;
  dueSoonCount: number;
  upcomingCount: number;
  paidCount: number;

  overdueTotal: number;
  dueSoonTotal: number;
  upcomingTotal: number;
  paidTotal: number;

  timeline: TimelineBill[];
};

type BillsCenterProps = {
  billSummary: BillSummary;
  onOpenBills: () => void;
};

function money(value: number) {
  const safe = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safe);
}

function billIcon(category?: string) {
  const value = (category || "").toLowerCase();

  if (
    value.includes("house") ||
    value.includes("mortgage") ||
    value.includes("rent")
  ) {
    return "🏠";
  }

  if (
    value.includes("utility") ||
    value.includes("electric") ||
    value.includes("water")
  ) {
    return "⚡";
  }

  if (value.includes("car") || value.includes("auto")) {
    return "🚗";
  }

  if (value.includes("phone")) {
    return "📱";
  }

  return "📄";
}

export default function BillsCenter({
  billSummary,
  onOpenBills,
}: BillsCenterProps) {
  return (
    <SectionCard title="Bills Center">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <BillStatusCard
  label="Overdue"
  icon="🚨"
  count={billSummary.overdueCount}
  amount={money(billSummary.overdueTotal)}
  statusText="At Risk"
  emptyText="No overdue bills"
  tone="rose"
/>

<BillStatusCard
  label="Due Soon"
  icon="⚡"
  count={billSummary.dueSoonCount}
  amount={money(billSummary.dueSoonTotal)}
  statusText="Due Soon"
  emptyText="Nothing urgent"
  tone="amber"
/>

<BillStatusCard
  label="Upcoming"
  icon="⭐"
  count={billSummary.upcomingCount}
  amount={money(billSummary.upcomingTotal)}
  statusText="Planned"
  emptyText="No upcoming bills"
  tone="slate"
/>

<BillStatusCard
  label="Paid"
  icon="💵"
  count={billSummary.paidCount}
  amount={money(billSummary.paidTotal)}
  statusText="Completed"
  emptyText="No payments yet"
  tone="emerald"
/>
</div>
      <div className="mt-6">
      <div className="upcoming-bills-panel relative overflow-hidden rounded-[26px] border-[3px] border-black bg-[#101936] p-5 shadow-[8px_8px_0px_rgba(0,0,0,.75)]">
          <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-[#3B82F6] opacity-20 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-wide text-slate-100">
              ✦ Upcoming Bills Calendar
            </p>

            <p className="text-[11px] text-slate-500">
              Next 6 bills
            </p>
          </div>

          {billSummary.timeline.length === 0 ? (
            <EmptyState
              icon="🏆"
              title="Mission Complete"
              description="Every bill is handled. No overdue bills, urgent payments, or financial fires today."
              action={
                <button
                  type="button"
                  onClick={onOpenBills}
                  className="rounded-full border-[3px] border-black bg-[#60A5FA] px-5 py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
                >
                  Add New Bill
                </button>
              }
            />
          ) : (
            <div className="relative mt-3 space-y-3">
              {billSummary.timeline.map(
                ({ b, nextDue, daysUntil }) => (
                  <MissionCard
                    key={b.id}
                    icon={billIcon(b.category)}
                    title={b.name}
                    due={
                      daysUntil === 0
                        ? `Due today • ${nextDue}`
                        : daysUntil < 0
                          ? `${Math.abs(
                              daysUntil
                            )} day(s) overdue • ${nextDue}`
                          : `Due in ${daysUntil} day(s) • ${nextDue}`
                    }
                    amount={money(b.amount)}
                    tone={
                      daysUntil < 0
                        ? "danger"
                        : daysUntil <= 5
                          ? "warning"
                          : "safe"
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}