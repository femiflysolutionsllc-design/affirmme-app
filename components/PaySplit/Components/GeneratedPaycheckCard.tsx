"use client";

import React from "react";

import type { GeneratedPaycheck } from "../lib/incomeStore";
import type { BillItem } from "../lib/paysplitStore";
import {
  getBillAmountForPaycheck,
} from "../lib/billAllocation";
import {
  setPaycheckOverride,
} from "../lib/paycheckOverrideStore";

type AssignedBill = BillItem & {
  assignedPaycheckId?: string;
};

type GeneratedPaycheckCardProps = {
  paycheck: GeneratedPaycheck;
  assignedBills?: AssignedBill[];
};

function money(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeValue);
}

function formatPayDate(dateISO: string) {
  const [year, month, day] = dateISO.split("-").map(Number);

  if (!year || !month || !day) {
    return dateISO;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatFrequency(
  frequency: GeneratedPaycheck["frequency"]
) {
  if (frequency === "semimonthly") {
    return "Semi-Monthly";
  }

  if (frequency === "biweekly") {
    return "Biweekly";
  }

  return (
    frequency.charAt(0).toUpperCase() +
    frequency.slice(1)
  );
}

function calculateAllocationPercent(
  income: number,
  bills: number
) {
  if (income <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((bills / income) * 100)
  );
}

function getAllocationStatus(
  percent: number,
  remaining: number
) {
  if (remaining < 0 || percent >= 100) {
    return {
      label: "Over Budget",
      color: "#F43F5E",
    };
  }

  if (percent >= 90) {
    return {
      label: "Needs Attention",
      color: "#F43F5E",
    };
  }

  if (percent >= 70) {
    return {
      label: "Getting Tight",
      color: "#FACC15",
    };
  }

  return {
    label: "On Track",
    color: "#22C55E",
  };
}

function getCoachMessage(
  remaining: number,
  allocationPercent: number
) {
  if (remaining < 0) {
    return `This paycheck is over budget by ${money(
      Math.abs(remaining)
    )}. Try moving part of a bill to another paycheck.`;
  }

  if (allocationPercent >= 90) {
    return `You have ${money(
      remaining
    )} left after bills. Keep extra spending limited until your next paycheck.`;
  }

  if (allocationPercent >= 70) {
    return `You still have ${money(
      remaining
    )} available. Your budget is getting tight, so spend carefully.`;
  }

  return `Great job! You have ${money(
    remaining
  )} remaining after your assigned bills.`;
}

export default function GeneratedPaycheckCard({
  paycheck,
  assignedBills = [],
}: GeneratedPaycheckCardProps) {
  const [showBills, setShowBills] =
    React.useState(false);

    const [hoursWorked, setHoursWorked] =
    React.useState<string>(
      paycheck.hoursWorked != null
        ? String(paycheck.hoursWorked)
        : ""
    );
  
  const [week1Hours, setWeek1Hours] =
    React.useState<string>(
      paycheck.week1Hours != null
        ? String(paycheck.week1Hours)
        : ""
    );
  
  const [week2Hours, setWeek2Hours] =
    React.useState<string>(
      paycheck.week2Hours != null
        ? String(paycheck.week2Hours)
        : ""
    );

  const [adjustmentValues, setAdjustmentValues] =
  React.useState<Record<string, number>>(
    paycheck.adjustmentValues ?? {}
  );

  const [
    showEstimateBreakdown,
    setShowEstimateBreakdown,
  ] = React.useState(false);

  const [
    isPayEstimateEditing,
    setIsPayEstimateEditing,
  ] = React.useState(false);

  const effectiveIncome =
  paycheck.manualAmountOverride ??
  paycheck.estimatedNetPay ??
  paycheck.amount;

  const billsForThisPaycheck = assignedBills
    .map((bill) => ({
      bill,
      allocatedAmount: getBillAmountForPaycheck(
        bill,
        paycheck.id
      ),
    }))
    .filter((item) => item.allocatedAmount > 0);

  const totalBillsAssigned =
    billsForThisPaycheck.reduce(
      (total, item) =>
        total + item.allocatedAmount,
      0
    );

    const remaining =
    effectiveIncome - totalBillsAssigned;

    const allocationPercent =
    calculateAllocationPercent(
      effectiveIncome,
      totalBillsAssigned
    );

  const allocationStatus = getAllocationStatus(
    allocationPercent,
    remaining
  );

  const coachMessage = getCoachMessage(
    remaining,
    allocationPercent
  );

  const [actualDeposit, setActualDeposit] =
  React.useState(
    paycheck.manualAmountOverride ?? 0
  );

  const estimatedFederalWithholding =
  paycheck.estimatedFederalWithholding ?? 0;

const estimatedSavedDeductions =
  Math.max(
    0,
    (paycheck.estimatedDeductions ?? 0) -
      (paycheck.estimatedFica ?? 0) -
      estimatedFederalWithholding
  );

  return (
    <article className="relative overflow-hidden rounded-[26px] border-[3px] border-black bg-[#111933] shadow-[7px_7px_0px_rgba(0,0,0,.75)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "13px 13px",
        }}
      />

      <div className="relative">
        <header className="flex flex-col gap-3 border-b-[3px] border-black bg-[#25388f] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
              Upcoming Paycheck
            </p>

            <h3 className="mt-1 break-words text-xl font-black uppercase text-white">
              🏢 {paycheck.incomeSourceName}
            </h3>
          </div>

          <span className="w-fit rounded-full border-[2px] border-black bg-[#60A5FA] px-3 py-1 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]">
            {formatFrequency(paycheck.frequency)}
          </span>
        </header>

        {paycheck.payType === "hourly" && (
  <p className="mt-1 text-[10px] font-semibold text-slate-400">
    {typeof paycheck.manualAmountOverride === "number"
      ? "Actual paycheck"
      : typeof paycheck.estimatedNetPay === "number"
        ? "Estimated take-home"
        : "Saved estimate"}
  </p>
)}

        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-[2px] border-black bg-[#080A16] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                💵 Income
              </p>

              <p className="mt-2 text-2xl font-black text-white">
              {money(effectiveIncome)}
              </p>
            </div>

            <div className="rounded-2xl border-[2px] border-black bg-[#080A16] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                📅 Pay Date
              </p>

              <p className="mt-2 font-black text-white">
                {formatPayDate(paycheck.dateISO)}
              </p>
            </div>
          </div>

          {paycheck.payType === "hourly" && (
  <section className="rounded-2xl border-[3px] border-black bg-[#16245f] p-4 shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
          ⏱ Hourly Paycheck Estimate
        </p>

        <p className="mt-1 text-sm font-black text-white">
          Estimated Take-Home:{" "}
          <span className="text-emerald-300">
            {money(
              paycheck.estimatedNetPay ?? 0
            )}
          </span>
        </p>

        <p className="mt-1 text-[10px] font-semibold text-slate-400">
          {paycheck.hoursWorked ?? 0} hours
          {" • "}
          Gross{" "}
          {money(
            paycheck.estimatedGrossPay ?? 0
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          setIsPayEstimateEditing(
            (current) => !current
          )
        }
        className="w-fit rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
      >
        {isPayEstimateEditing
          ? "▲ Close Pay Editor"
          : "✏️ Edit Pay Estimate"}
      </button>
    </div>

    {isPayEstimateEditing && (
      <div className="mt-4">  

    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <div>
        <label className="mb-1 block text-[10px] font-black uppercase text-slate-300">
          Total Hours
        </label>

        <input
          type="number"
          min="0"
          step="0.25"
          value={hoursWorked}
onChange={(event) =>
  setHoursWorked(event.target.value)
}
          className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-black uppercase text-slate-300">
          Week 1 Hours
        </label>

        <input
          type="number"
          min="0"
          step="0.25"
          value={week1Hours}
onChange={(event) =>
  setWeek1Hours(event.target.value)
}
          className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-black uppercase text-slate-300">
          Week 2 Hours
        </label>

        <input
          type="number"
          min="0"
          step="0.25"
          value={week2Hours}
onChange={(event) =>
  setWeek2Hours(event.target.value)
}
          className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
        />
      </div>
    </div>

    {(paycheck.payAdjustments ?? []).length > 0 && (
  <div className="mt-4 space-y-3">
    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-200">
      🌙 Pay Adjustments This Check
    </p>

    {(paycheck.payAdjustments ?? [])
      .filter(
        (adjustment) =>
          adjustment.active !== false
      )
      .map((adjustment) => (
        <div
          key={adjustment.id}
          className="rounded-xl border-2 border-black bg-[#111933] p-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">
                {adjustment.name ||
                  "Pay Adjustment"}
              </p>

              <p className="text-xs font-semibold text-slate-400">
                {adjustment.type === "hourly"
                  ? `+$${adjustment.amount}/hr`
                  : `+$${adjustment.amount} flat`}
              </p>
            </div>

            {adjustment.type === "hourly" ? (
              <div className="w-full sm:w-40">
                <label className="mb-1 block text-[9px] font-black uppercase text-slate-400">
                  Eligible Hours
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={
                    adjustmentValues[
                      adjustment.id
                    ] ?? 0
                  }
                  onChange={(event) =>
                    setAdjustmentValues(
                      (current) => ({
                        ...current,
                        [adjustment.id]:
                          Number(
                            event.target.value
                          ) || 0,
                      })
                    )
                  }
                  className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 font-bold text-black"
                />
              </div>
            ) : (
              <div className="w-full sm:w-40">
                <label className="mb-1 block text-[9px] font-black uppercase text-slate-400">
                  Amount This Check
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    adjustmentValues[
                      adjustment.id
                    ] ??
                    adjustment.amount
                  }
                  onChange={(event) =>
                    setAdjustmentValues(
                      (current) => ({
                        ...current,
                        [adjustment.id]:
                          Number(
                            event.target.value
                          ) || 0,
                      })
                    )
                  }
                  className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 font-bold text-black"
                />
              </div>
            )}
          </div>
        </div>
      ))}
  </div>
)}

  <div className="mt-4 grid gap-3 sm:grid-cols-3">
  <div className="rounded-xl border-2 border-black bg-[#080A16] p-3">
    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
      Estimated Gross
    </p>

    <p className="mt-1 text-lg font-black text-white">
      {money(
        paycheck.estimatedGrossPay ?? 0
      )}
    </p>
  </div>

  <div className="rounded-xl border-2 border-black bg-[#080A16] p-3">
    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
      Estimated Deductions
    </p>

    <p className="mt-1 text-lg font-black text-rose-300">
      -
      {money(
        paycheck.estimatedDeductions ?? 0
      )}
    </p>
  </div>

  <div className="rounded-xl border-2 border-black bg-emerald-400 p-3 text-black">
    <p className="text-[10px] font-black uppercase tracking-wide">
      Estimated Take-Home
    </p>

    <p className="mt-1 text-lg font-black">
      {money(
        paycheck.estimatedNetPay ?? 0
      )}
    </p>
  </div>
</div>

<div className="mt-3">
  <button
    type="button"
    onClick={() =>
      setShowEstimateBreakdown(
        (current) => !current
      )
    }
    className="rounded-xl border-2 border-black bg-[#60A5FA] px-3 py-2 text-[10px] font-black uppercase text-black shadow-[3px_3px_0px_black]"
  >
    {showEstimateBreakdown
      ? "▲ Hide Estimate Breakdown"
      : "▼ View Estimate Breakdown"}
  </button>

  {showEstimateBreakdown && (
    <div className="mt-3 space-y-2 rounded-xl border-2 border-black bg-[#080A16] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-300">
          Social Security
        </span>

        <span className="text-xs font-black text-rose-300">
          -
          {money(
            paycheck.estimatedSocialSecurity ??
              0
          )}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-300">
          Medicare
        </span>

        <span className="text-xs font-black text-rose-300">
          -
          {money(
            paycheck.estimatedMedicare ?? 0
          )}
        </span>
      </div>

      {(paycheck.estimatedAdditionalMedicare ??
        0) > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300">
            Additional Medicare
          </span>

          <span className="text-xs font-black text-rose-300">
            -
            {money(
              paycheck
                .estimatedAdditionalMedicare ??
                0
            )}
          </span>
        </div>
      )}

{estimatedFederalWithholding > 0 && (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs font-semibold text-slate-300">
      Federal Income Tax
    </span>

    <span className="text-xs font-black text-rose-300">
      -{money(estimatedFederalWithholding)}
    </span>
  </div>
)}

{estimatedSavedDeductions > 0 && (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs font-semibold text-slate-300">
      Saved deductions
    </span>

    <span className="text-xs font-black text-rose-300">
      -{money(estimatedSavedDeductions)}
    </span>
  </div>
)}

      <div className="flex items-center justify-between gap-3 border-t border-slate-700 pt-2">
        <span className="text-xs font-black uppercase text-white">
          Total Estimated Deductions
        </span>

        <span className="text-sm font-black text-rose-300">
          -
          {money(
            paycheck.estimatedDeductions ??
              0
          )}
        </span>
      </div>
    </div>
  )}
</div>

<div className="mt-4 rounded-xl border-2 border-black bg-[#111933] p-4">
  <label className="mb-2 block text-[10px] font-black uppercase tracking-wide text-blue-200">
    💳 Actual Deposit
  </label>

  <div className="flex flex-col gap-3 sm:flex-row">
    <div className="relative flex-1">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-black text-black">
        $
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={actualDeposit}
        onChange={(event) =>
          setActualDeposit(
            Number(event.target.value) || 0
          )
        }
        placeholder="Enter actual paycheck deposit"
        className="w-full rounded-xl border-2 border-black bg-white py-2 pl-8 pr-3 font-bold text-black"
      />
    </div>

    <button
      type="button"
      onClick={() => {
        setPaycheckOverride(
          paycheck.id,
          {
            manualAmountOverride:
              actualDeposit,
          }
        );
      }}
      className="rounded-xl border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
    >
      Save Actual Paycheck
    </button>
  </div>

  <p className="mt-2 text-[10px] font-semibold text-slate-400">
    Once saved, this amount becomes the paycheck amount used for budgeting and bill allocations.
  </p>
</div>

    <button
      type="button"
      onClick={() => {
        setPaycheckOverride(
          paycheck.id,
          {
            hoursWorked:
              hoursWorked === ""
                ? undefined
                : Number(hoursWorked),
        
            week1Hours:
              week1Hours === ""
                ? undefined
                : Number(week1Hours),
        
            week2Hours:
              week2Hours === ""
                ? undefined
                : Number(week2Hours),
        
            adjustmentValues,
          }
        );
      }}
      className="mt-4 rounded-xl border-[3px] border-black bg-emerald-400 px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
    >
      Update Pay Estimate
    </button>
    </div>
    )}
  </section>
)}

          <section className="rounded-2xl border-[3px] border-black bg-[#080A16] p-4 shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">
                    🧾 Assigned Bills
                  </p>

                  <span className="rounded-full border-[2px] border-black bg-[#FACC15] px-3 py-1 text-xs font-black text-black">
                    {billsForThisPaycheck.length}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-400">
                  Total assigned:{" "}
                  <span className="font-black text-white">
                    {money(totalBillsAssigned)}
                  </span>
                </p>
              </div>

              {billsForThisPaycheck.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowBills(
                      (current) => !current
                    )
                  }
                  aria-expanded={showBills}
                  className="w-fit rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black] transition hover:-translate-y-1"
                >
                  {showBills
                    ? "▲ Hide Bills"
                    : "▼ View Bills"}
                </button>
              )}
            </div>

            {billsForThisPaycheck.length === 0 ? (
              <div className="mt-4 rounded-xl border-[2px] border-dashed border-slate-600 p-4 text-center">
                <p className="text-sm font-semibold text-slate-400">
                  No bills have been assigned to this
                  paycheck yet.
                </p>
              </div>
            ) : (
              showBills && (
                <div className="mt-4 space-y-3">
                  {billsForThisPaycheck.map(
                    ({ bill, allocatedAmount }) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between gap-4 rounded-xl border-[2px] border-black bg-[#111933] p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-white">
                            {bill.name}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {bill.category || "Bill"}

                            {bill.paycheckAllocations &&
                            bill.paycheckAllocations
                              .length > 1
                              ? " • Split portion"
                              : ""}
                          </p>
                        </div>

                        <p className="shrink-0 font-black text-rose-300">
                          -{money(allocatedAmount)}
                        </p>
                      </div>
                    )
                  )}

                  <div className="flex items-center justify-between border-t-2 border-slate-700 pt-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Total Bills
                    </p>

                    <p className="font-black text-white">
                      {money(totalBillsAssigned)}
                    </p>
                  </div>
                </div>
              )
            )}
          </section>

          <div className="rounded-2xl border-[2px] border-black bg-[#080A16] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              💰 Remaining
            </p>

            <p
              className={
                "mt-2 text-2xl font-black " +
                (remaining < 0
                  ? "text-rose-300"
                  : allocationPercent >= 70
                    ? "text-amber-300"
                    : "text-emerald-300")
              }
            >
              {money(remaining)}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase text-slate-300">
              <span>📊 Allocation</span>
              <span>{allocationPercent}%</span>
            </div>

            <div
              className="h-4 overflow-hidden rounded-full border-[2px] border-black bg-[#080A16]"
              role="progressbar"
              aria-label={`${paycheck.incomeSourceName} allocation`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(
                allocationPercent,
                100
              )}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    allocationPercent,
                    100
                  )}%`,
                  backgroundColor:
                    allocationStatus.color,
                }}
              />
            </div>

            <p
              className="mt-2 text-xs font-black uppercase"
              style={{
                color: allocationStatus.color,
              }}
            >
              {allocationStatus.label}
            </p>
          </div>

          <div className="rounded-2xl border-[3px] border-black bg-[#60A5FA] p-4 text-black shadow-[4px_4px_0px_black]">
            <p className="text-xs font-black uppercase tracking-[0.16em]">
              ✨ AffirmMe Insight
            </p>

            <p className="mt-2 text-sm font-bold leading-relaxed">
              {coachMessage}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}