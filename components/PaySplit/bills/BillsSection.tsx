"use client";

import React from "react";
import AllocationPanel from "./AllocationPanel";

import {
  type BillItem,
  type PaycheckAllocation,
} from "../lib/paysplitStore";

import type {
  PlannerPaycheck,
  PayWindow,
} from "../lib/PaycheckPlannerStore";

import CurrencyInput from "../paysplit-ui/CurrencyInput";

import {
  getBillAllocations,
} from "../lib/billAllocation";

type Tone = "green" | "yellow" | "red" | "slate";
type Assign = "A" | "B" | "both";

type BillWithAssign = BillItem & {
  assignTo?: Assign;
};

type Account = {
  id: string;
  name: string;
};

type BillsSectionProps = {
  title: string;
  items: BillWithAssign[];
  tone: Tone;
  paychecks: PlannerPaycheck[];
payWindows: PayWindow[];
  dueSoonDays: number;
  accounts: Account[];
  billAccount: Record<string, string>;

  onUpdateBill: (
    id: string,
    patch: Partial<BillWithAssign>
  ) => void;

  onSelectAccount: (
    billId: string,
    accountId: string
  ) => void;

  onTogglePaid: (
    bill: BillWithAssign
  ) => void;
  
  onToggleAllocationPaid: (
    bill: BillWithAssign,
    allocationId: string
  ) => void;
  onSetScheduled: (bill: BillWithAssign) => void;
  onDeleteBill: (id: string) => void;
};

const BILL_CATEGORIES = [
  "Mortgage",
  "Rent",
  "HOA",
  "Electricity",
  "Water",
  "Gas Utility",
  "Internet",
  "Cable",
  "Phone",
  "Car Payment",
  "Car Insurance",
  "Gas",
  "Tolls",
  "Maintenance",
  "Transportation",
  "Credit Card",
  "Student Loan",
  "Personal Loan",
  "Medical Debt",
  "Other Debt",
  "Groceries",
  "Medical",
  "Childcare",
  "Education",
  "Pet Care",
  "Insurance",
  "Gym",
  "Streaming",
  "Subscriptions",
  "Entertainment",
  "Personal",
  "Savings",
  "Other",
] as const;

function getCategoryIcon(category: string) {
  switch (category) {
    case "Mortgage":
    case "Rent":
    case "HOA":
      return "🏠";

    case "Electricity":
      return "⚡";

    case "Water":
      return "💧";

    case "Gas Utility":
      return "🔥";

    case "Internet":
      return "🌐";

    case "Cable":
      return "📺";

    case "Phone":
      return "📱";

    case "Car Payment":
      return "🚗";

    case "Car Insurance":
      return "🛡️";

    case "Gas":
      return "⛽";

    case "Tolls":
      return "🛣️";

    case "Maintenance":
      return "🔧";

    case "Transportation":
      return "🚌";

    case "Credit Card":
      return "💳";

    case "Student Loan":
      return "🎓";

    case "Personal Loan":
      return "💰";

    case "Medical Debt":
      return "🏥";

    case "Other Debt":
      return "📄";

    case "Groceries":
      return "🛒";

    case "Medical":
      return "🩺";

    case "Childcare":
      return "👶";

    case "Education":
      return "📚";

    case "Pet Care":
      return "🐾";

    case "Insurance":
      return "📋";

    case "Gym":
      return "💪";

    case "Streaming":
      return "🎬";

    case "Subscriptions":
      return "📦";

    case "Entertainment":
      return "🎉";

    case "Savings":
      return "🏦";

    case "Personal":
      return "✨";

    default:
      return "📝";
  }
}


function clamp(
  value: number,
  minimum: number,
  maximum: number
) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}


function StatusPill({
  tone,
  text,
}: {
  tone: Tone;
  text: string;
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : tone === "yellow"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
        : tone === "red"
          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
          : "border-slate-700 bg-slate-900/50 text-slate-200";

  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase " +
        toneClass
      }
    >
      {text}
    </span>
  );
}

function money(value: number) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeValue);
}

function formatScheduleDate(value?: string) {
  if (!value) {
    return "Date not selected";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "Date not selected";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getScheduleLabel(
  bill: BillWithAssign
) {
  const frequency =
    bill.frequency ?? "monthly";

  if (frequency === "semi-monthly") {
    return `📅 Twice Monthly • Days ${
      bill.dueDay ?? 1
    } & ${bill.secondDueDay ?? 15}`;
  }

  if (frequency === "weekly") {
    return `📅 Weekly • Starts ${formatScheduleDate(
      bill.startDate
    )}`;
  }

  if (frequency === "biweekly") {
    return `📅 Every 2 Weeks • Starts ${formatScheduleDate(
      bill.startDate
    )}`;
  }

  if (frequency === "one-time") {
    return `📅 One Time • ${formatScheduleDate(
      bill.startDate
    )}`;
  }

  return `📅 Monthly • Day ${
    bill.dueDay ?? 1
  }`;
}

function getDueStatus(
  bill: BillWithAssign,
  dueSoonDays: number
) {
  if (bill.status === "paid") {
    return {
      label: "Paid",
      color: "text-green-500",
    };
  }

  const frequency =
    bill.frequency ?? "monthly";

  if (frequency === "weekly") {
    return {
      label: "Repeats every week",
      color: "text-slate-400",
    };
  }

  if (frequency === "biweekly") {
    return {
      label: "Repeats every 2 weeks",
      color: "text-slate-400",
    };
  }

  if (frequency === "semi-monthly") {
    return {
      label: "Two payments each month",
      color: "text-slate-400",
    };
  }

  if (frequency === "one-time") {
    return {
      label: `Scheduled for ${formatScheduleDate(
        bill.startDate
      )}`,
      color: "text-slate-400",
    };
  }

  const dueDay = Number(
    bill.dueDay ?? 1
  );

  const today = new Date().getDate();
  const difference = dueDay - today;

  if (difference < 0) {
    const overdueDays = Math.abs(difference);

    return {
      label: `Overdue by ${overdueDays} day${
        overdueDays === 1 ? "" : "s"
      }`,
      color: "text-red-500",
    };
  }

  if (difference <= dueSoonDays) {
    return {
      label:
        difference === 0
          ? "Due Today"
          : `Due in ${difference} day${
              difference === 1 ? "" : "s"
            }`,
      color: "text-amber-400",
    };
  }

  return {
    label: `Due in ${difference} days`,
    color: "text-slate-400",
  };
}


export default function BillsSection({
  title,
  items,
  tone,
  paychecks,
  payWindows,
  dueSoonDays,
  accounts,
  billAccount,
  onUpdateBill,
  onSelectAccount,
  onTogglePaid,
  onToggleAllocationPaid,
  onSetScheduled,
  onDeleteBill,
}: BillsSectionProps) {
  const accent =
    tone === "green"
      ? "#22C55E"
      : tone === "yellow"
        ? "#FACC15"
        : tone === "red"
          ? "#F43F7A"
          : "#60A5FA";

  return (
    <section className="bills-section-shell relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-5 shadow-[8px_8px_0px_rgba(0,0,0,.75)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div
          className="inline-flex rotate-[-1deg] items-center gap-2 rounded-full border-[3px] border-black px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[5px_5px_0px_black]"
          style={{
            backgroundColor: accent,
          }}
        >
          ✦ {title}
        </div>

        <div className="rounded-full border-[3px] border-black bg-white px-3 py-1 text-sm font-black text-black shadow-[4px_4px_0px_black]">
          {items.length}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="relative mt-5 rounded-[24px] border-[3px] border-black bg-[#111933] p-6 text-center shadow-[6px_6px_0px_rgba(0,0,0,.75)]">
          <p className="text-3xl">🏆</p>

          <p className="mt-3 text-2xl font-black uppercase text-white">
            Nothing Here
          </p>

          <p className="mt-2 text-sm text-slate-300">
            This section is clear right now.
          </p>
        </div>
      ) : (
        <div className="relative mt-5 space-y-4">
          {items.map((bill) => {
            const dueStatus = getDueStatus(
              bill,
              dueSoonDays
            );

            const billAllocations =
            getBillAllocations(bill);
          
          const allocatedTotal =
            billAllocations.reduce(
              (total, allocation) =>
                total +
                Number(allocation.amount || 0),
              0
            );
          
          const paidTotal =
            billAllocations.reduce(
              (total, allocation) =>
                total +
                (allocation.paid
                  ? Number(allocation.amount || 0)
                  : 0),
              0
            );
          
          const remainingTotal = Math.max(
            0,
            Number(bill.amount || 0) -
              paidTotal
          );
          
          const hasPartialPayment =
            paidTotal > 0 &&
            remainingTotal > 0;
          
          const allAllocationsPaid =
            billAllocations.length > 0 &&
            billAllocations.every(
              (allocation) => allocation.paid
            );
          
          const displayStatus =
            allAllocationsPaid
              ? "paid"
              : hasPartialPayment
                ? "partially paid"
                : bill.status;
          
          const displayTone: Tone =
            allAllocationsPaid
              ? "green"
              : hasPartialPayment
                ? "yellow"
                : tone;

            return (
              <details
                key={bill.id}
                id={`bill-${bill.id}`}
                className="group relative overflow-hidden rounded-[24px] border-[3px] border-black bg-[#111933] shadow-[7px_7px_0px_rgba(0,0,0,.75)]"
              >
                <summary className="relative grid cursor-pointer list-none gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-2xl font-black uppercase text-white">
                        {getCategoryIcon(
                          bill.category
                        )}{" "}
                        {bill.name}
                      </p>

                      <StatusPill
                        tone={displayTone}
                        text={displayStatus}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">
                        {getCategoryIcon(
                          bill.category
                        )}{" "}
                        {bill.category}
                      </span>

                      <span className="text-sm font-semibold text-slate-400">
                        {getScheduleLabel(
                          bill
                        )}
                      </span>
                    </div>

                    <p
                      className={
                        "mt-1 text-sm font-semibold " +
                        dueStatus.color
                      }
                    >
                      {dueStatus.label}
                    </p>
                  </div>

                  <p className="text-4xl font-black text-white">
                    {money(
                      Number(
                        bill.amount || 0
                      )
                    )}
                  </p>

                  <span className="w-fit rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]">
                    <span className="group-open:hidden">
                      ▼ Open
                    </span>

                    <span className="hidden group-open:inline">
                      ▲ Close
                    </span>
                  </span>
                </summary>

                <div className="relative border-t-[3px] border-black p-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0">
                    
                    <AllocationPanel
  bill={bill}
  paychecks={paychecks}
  payWindows={payWindows}
  onUpdateBill={onUpdateBill}
  onToggleAllocationPaid={
    onToggleAllocationPaid
  }
/>

                      <div className="mt-4">
                        {accounts.length > 0 ? (
                          <>
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-300">
                              Pay from account
                            </label>

                            <select
                              className="mt-2 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100"
                              value={
                                billAccount[
                                  bill.id
                                ] ?? ""
                              }
                              onChange={(
                                event
                              ) =>
                                onSelectAccount(
                                  bill.id,
                                  event.target
                                    .value
                                )
                              }
                            >
                              <option value="">
                                — Not linked —
                              </option>

                              {accounts.map(
                                (account) => (
                                  <option
                                    key={
                                      account.id
                                    }
                                    value={
                                      account.id
                                    }
                                  >
                                    {
                                      account.name
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">
                            Add an account in
                            Accounts to link
                            spending.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[22px] border-[3px] border-black bg-[#080A16] p-4 shadow-[5px_5px_0px_rgba(0,0,0,.75)]">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
                        ⚡ Actions
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onTogglePaid(bill)
                          }
                          className={
                            "rounded-xl border-[2px] border-black px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_black] " +
                            (bill.status ===
                            "paid"
                              ? "bg-[#FACC15] text-black"
                              : "bg-[#22C55E] text-black")
                          }
                        >
                          {bill.status ===
                          "paid"
                            ? "Mark Unpaid"
                            : "Mark Paid"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onSetScheduled(
                              bill
                            )
                          }
                          className="rounded-xl border-[2px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
                        >
                          Scheduled
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onDeleteBill(
                              bill.id
                            )
                          }
                          className="rounded-xl border-[2px] border-black bg-[#F43F7A] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_black]"
                        >
                          Delete
                        </button>
                      </div>

                      <details className="mt-4 rounded-[18px] border-[2px] border-black bg-[#111933] p-4">
                        <summary className="cursor-pointer text-xs font-black uppercase text-white">
                          Edit Bill
                        </summary>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-bold text-slate-300">
                              Name
                            </label>

                            <input
                              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                              value={bill.name}
                              onChange={(
                                event
                              ) =>
                                onUpdateBill(
                                  bill.id,
                                  {
                                    name: event
                                      .target
                                      .value,
                                  }
                                )
                              }
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-300">
                              Category
                            </label>

                            <select
                              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                              value={
                                bill.category
                              }
                              onChange={(
                                event
                              ) =>
                                onUpdateBill(
                                  bill.id,
                                  {
                                    category:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                            >
                              {BILL_CATEGORIES.map(
                                (category) => (
                                  <option
                                    key={
                                      category
                                    }
                                    value={
                                      category
                                    }
                                  >
                                    {category}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-300">
                              Amount
                            </label>

                            <CurrencyInput
                              value={Number(
                                bill.amount || 0
                              )}
                              onChange={(
                                value
                              ) =>
                                onUpdateBill(
                                  bill.id,
                                  {
                                    amount:
                                      value,
                                  }
                                )
                              }
                              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-300">
                              Due day
                            </label>

                            <input
                              inputMode="numeric"
                              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                              value={String(
                                bill.dueDay ??
                                  1
                              )}
                              onChange={(
                                event
                              ) =>
                                onUpdateBill(
                                  bill.id,
                                  {
                                    dueDay:
                                      clamp(
                                        Number(
                                          event
                                            .target
                                            .value ||
                                            1
                                        ),
                                        1,
                                        31
                                      ),
                                  }
                                )
                              }
                            />
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}