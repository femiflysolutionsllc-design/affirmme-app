"use client";

import React from "react";
import { BillItem } from "../lib/paysplitStore";

type Assign = "A" | "B" | "both";

type BillWithAssign = BillItem & {
  assignTo?: Assign;
};

type AttentionSectionProps = {
  items: BillWithAssign[];
  dueSoonDays: number;
  onTogglePaid: (bill: BillWithAssign) => void;
  onTakeMeToBill: (billId: string) => void;
};

function money(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeValue);
}

function formatDate(value?: string) {
  if (!value) {
    return "Date not selected";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Date not selected";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getScheduleLabel(bill: BillWithAssign) {
  const frequency = bill.frequency ?? "monthly";

  if (frequency === "semi-monthly") {
    return `Twice Monthly • Days ${bill.dueDay ?? 1} & ${
      bill.secondDueDay ?? 15
    }`;
  }

  if (frequency === "weekly") {
    return `Weekly • Starts ${formatDate(bill.startDate)}`;
  }

  if (frequency === "biweekly") {
    return `Every 2 Weeks • Starts ${formatDate(bill.startDate)}`;
  }

  if (frequency === "one-time") {
    return `One Time • ${formatDate(bill.startDate)}`;
  }

  return `Monthly • Day ${bill.dueDay ?? 1}`;
}

function getAttentionMessage(
  bill: BillWithAssign,
  dueSoonDays: number
) {
  const frequency = bill.frequency ?? "monthly";

  if (
    frequency === "weekly" ||
    frequency === "biweekly" ||
    frequency === "one-time"
  ) {
    return {
      text: "Scheduled payment needs attention",
      className: "text-amber-300",
    };
  }

  const today = new Date().getDate();

  const dueDays =
    frequency === "semi-monthly"
      ? [
          Number(bill.dueDay ?? 1),
          Number(bill.secondDueDay ?? 15),
        ].sort((a, b) => a - b)
      : [Number(bill.dueDay ?? 1)];

  const upcomingDay = dueDays.find((day) => day >= today);

  if (upcomingDay !== undefined) {
    const difference = upcomingDay - today;

    if (difference === 0) {
      return {
        text: "Due today",
        className: "text-rose-300",
      };
    }

    if (difference <= dueSoonDays) {
      return {
        text: `Due in ${difference} day${
          difference === 1 ? "" : "s"
        }`,
        className: "text-amber-300",
      };
    }
  }

  const latestDueDay = dueDays[dueDays.length - 1];
  const overdueDays = Math.max(1, today - latestDueDay);

  return {
    text: `Overdue by ${overdueDays} day${
      overdueDays === 1 ? "" : "s"
    }`,
    className: "text-rose-300",
  };
}

function getAssignmentLabel(bill: BillWithAssign) {
  const assignment = bill.assignTo ?? "A";

  if (assignment === "both") {
    return "Split Between Both Paychecks";
  }

  if (assignment === "B") {
    return "Paycheck B";
  }

  return "Paycheck A";
}

export default function AttentionSection({
  items,
  dueSoonDays,
  onTogglePaid,
  onTakeMeToBill,
}: AttentionSectionProps) {
  const [collapsedBills, setCollapsedBills] = React.useState<
    Set<string>
  >(() => new Set());

  function hideForNow(billId: string) {
    setCollapsedBills((previous) => {
      const next = new Set(previous);
      next.add(billId);
      return next;
    });
  }

  function showAgain(billId: string) {
    setCollapsedBills((previous) => {
      const next = new Set(previous);
      next.delete(billId);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {items.map((bill) => {
        const isCollapsed = collapsedBills.has(bill.id);
        const attention = getAttentionMessage(
          bill,
          dueSoonDays
        );

        if (isCollapsed) {
          return (
            <div
              key={bill.id}
              className="flex flex-col gap-3 rounded-[18px] border-[3px] border-black bg-[#111933] p-4 shadow-[5px_5px_0px_rgba(0,0,0,.75)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase text-white">
                  👁️ {bill.name} — Hidden for now
                </p>

                <p
                  className={`mt-1 text-xs font-bold ${attention.className}`}
                >
                  {attention.text}
                </p>
              </div>

              <button
                type="button"
                onClick={() => showAgain(bill.id)}
                className="shrink-0 rounded-full border-[2px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black] transition hover:-translate-y-0.5"
              >
                Show Again
              </button>
            </div>
          );
        }

        return (
          <div
            key={bill.id}
            className="relative overflow-hidden rounded-[22px] border-[3px] border-black bg-[#111933] p-5 shadow-[6px_6px_0px_rgba(0,0,0,.75)]"
          >
            <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                background:
                  "radial-gradient(circle at center, white 1px, transparent 1px)",
                backgroundSize: "13px 13px",
              }}
            />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-black uppercase text-white">
                    🚨 {bill.name}
                  </p>

                  <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold uppercase text-rose-200">
                    {bill.status}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-300">
                  📅 {getScheduleLabel(bill)}
                </p>

                <p
                  className={`mt-1 text-sm font-black ${attention.className}`}
                >
                  ⚠️ {attention.text}
                </p>

                <p className="mt-3 text-3xl font-black text-white">
                  {money(Number(bill.amount || 0))}
                </p>

                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Assigned to {getAssignmentLabel(bill)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:max-w-[420px] lg:justify-end">
                <button
                  type="button"
                  onClick={() => onTogglePaid(bill)}
                  className="rounded-xl border-[2px] border-black bg-[#22C55E] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black] transition hover:-translate-y-0.5"
                >
                  ✓ Mark Paid
                </button>

                <button
                  type="button"
                  onClick={() => hideForNow(bill.id)}
                  className="rounded-xl border-[2px] border-black bg-slate-200 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black] transition hover:-translate-y-0.5"
                >
                  👁 Hide for Now
                </button>

                <button
                  type="button"
                  onClick={() => onTakeMeToBill(bill.id)}
                  className="rounded-xl border-[2px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black] transition hover:-translate-y-0.5"
                >
                  Take Me to Bill →
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}