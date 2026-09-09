"use client";

import React from "react";

import SectionCard from "../paysplit-ui/SectionCard";
import StatCard from "../paysplit-ui/StatCard";

import type {
  BillItem,
} from "../lib/paysplitStore";

import type {
  PayWindow,
} from "../lib/PaycheckPlannerStore";

import {
  getBillAmountForPayWindow,
} from "../lib/billAllocation";

type FinancialSnapshotProps = {
  payWindowA?: PayWindow | null;
  payWindowB?: PayWindow | null;

  bills?: BillItem[];

  totalBillsAmount: number;

  paidCount: number;
  totalBillsCount: number;
  paidPercent: number;

  unpaidTotal: number;
  remainingCount: number;
};

function money(
  value: number
) {
  const safe =
    Number.isFinite(value)
      ? value
      : 0;

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(safe);
}

export default function FinancialSnapshot({
  payWindowA = null,
  payWindowB = null,
  bills = [],
  totalBillsAmount,
  paidCount,
  totalBillsCount,
  paidPercent,
  unpaidTotal,
  remainingCount,
}: FinancialSnapshotProps) {
  /*
   * ============================================
   * PAY WINDOW RESERVED AMOUNTS
   * ============================================
   */

  function getReservedForWindow(
    window: PayWindow | null
  ) {
    if (!window) {
      return 0;
    }

    return bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        getBillAmountForPayWindow(
          bill,
          window.id
        ),
      0
    );
  }

  const windowAReserved =
    getReservedForWindow(
      payWindowA
    );

  const windowBReserved =
    getReservedForWindow(
      payWindowB
    );

  const windowARemaining =
    payWindowA
      ? payWindowA.totalIncome -
        windowAReserved
      : 0;

  const windowBRemaining =
    payWindowB
      ? payWindowB.totalIncome -
        windowBReserved
      : 0;

  /*
   * ============================================
   * FUNDING STATUS
   * ============================================
   *
   * Funding and payment are different.
   *
   * Funded:
   * Money has been reserved from one
   * or more pay windows.
   *
   * Paid:
   * The obligation has actually been
   * completed / paid.
   */

  function getBillFundedAmount(
    bill: BillItem
  ) {
    const allWindowIds =
      new Set<string>();

    if (payWindowA) {
      allWindowIds.add(
        payWindowA.id
      );
    }

    if (payWindowB) {
      allWindowIds.add(
        payWindowB.id
      );
    }

    for (
      const allocation of
        bill.paycheckAllocations ??
        []
    ) {
      if (
        allocation.paycheckId
      ) {
        allWindowIds.add(
          allocation.paycheckId
        );
      }
    }

    if (
      bill.assignedPaycheckId
    ) {
      allWindowIds.add(
        bill.assignedPaycheckId
      );
    }

    return Array.from(
      allWindowIds
    ).reduce(
      (
        total,
        windowId
      ) =>
        total +
        getBillAmountForPayWindow(
          bill,
          windowId
        ),
      0
    );
  }

  const fundedTotal =
    bills.reduce(
      (
        total,
        bill
      ) => {
        const billAmount =
          Math.max(
            0,
            Number(
              bill.amount || 0
            )
          );

        const fundedAmount =
          Math.min(
            billAmount,
            getBillFundedAmount(
              bill
            )
          );

        return (
          total +
          fundedAmount
        );
      },
      0
    );

  const fundedCount =
    bills.filter(
      (bill) => {
        const billAmount =
          Math.max(
            0,
            Number(
              bill.amount || 0
            )
          );

        const fundedAmount =
          getBillFundedAmount(
            bill
          );

        return (
          billAmount >
            0 &&
          fundedAmount >=
            billAmount -
              0.01
        );
      }
    ).length;

  const fundedPercent =
    totalBillsAmount <= 0
      ? 0
      : Math.round(
          Math.min(
            100,
            Math.max(
              0,
              (
                fundedTotal /
                totalBillsAmount
              ) *
                100
            )
          )
        );

  const leftToFund =
    Math.max(
      0,
      totalBillsAmount -
        fundedTotal
    );

  /*
   * Paid bills should no longer count
   * as "awaiting payment."
   */
  const fundedAwaitingPayment =
    bills.reduce(
      (
        total,
        bill
      ) => {
        if (
          bill.status ===
          "paid"
        ) {
          return total;
        }

        const billAmount =
          Math.max(
            0,
            Number(
              bill.amount || 0
            )
          );

        const fundedAmount =
          Math.min(
            billAmount,
            getBillFundedAmount(
              bill
            )
          );

        return (
          total +
          fundedAmount
        );
      },
      0
    );

  /*
   * ============================================
   * UI
   * ============================================
   */

  return (
    <SectionCard title="Financial Snapshot">
      <div className="grid gap-4 lg:grid-cols-3">
        {payWindowA ? (
          <StatCard
            label={`Pay Window ${payWindowA.half} Remaining`}
            value={money(
              windowARemaining
            )}
            sub={
              payWindowA.label
            }
            tone={
              windowARemaining <
              0
                ? "rose"
                : "emerald"
            }
          />
        ) : (
          <StatCard
            label="Pay Window"
            value="Off"
            tone="slate"
          />
        )}

        {payWindowB ? (
          <StatCard
            label={`Pay Window ${payWindowB.half} Remaining`}
            value={money(
              windowBRemaining
            )}
            sub={
              payWindowB.label
            }
            tone={
              windowBRemaining <
              0
                ? "rose"
                : "emerald"
            }
          />
        ) : (
          <StatCard
            label="Next Pay Window"
            value="Off"
            tone="slate"
          />
        )}

        <StatCard
          label="Bills / Obligations"
          value={money(
            totalBillsAmount
          )}
          sub={`${totalBillsCount} bill${
            totalBillsCount ===
            1
              ? ""
              : "s"
          } total`}
          tone="slate"
        />

        <StatCard
          label="Bills Paid"
          value={`${paidCount} / ${totalBillsCount}`}
          sub={`${paidPercent}% paid`}
          tone={
            paidPercent >=
            100
              ? "emerald"
              : paidPercent >=
                  50
                ? "amber"
                : "slate"
          }
        />
      </div>

      {/* FUNDING PROGRESS */}

      <div className="financial-progress-block mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Funding Progress
          </p>

          <p className="text-xs font-black text-white">
            {fundedPercent}%
          </p>
        </div>

        <div className="financial-progress-track h-5 w-full overflow-hidden rounded-full border-[3px] border-black bg-[#080A16] shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
          <div
            className="h-full bg-[#22C55E]"
            style={{
              width: `${fundedPercent}%`,
            }}
          />
        </div>
      </div>

      {/* PAYMENT PROGRESS */}

      <div className="financial-progress-block mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Payment Progress
          </p>

          <p className="text-xs font-black text-white">
            {paidPercent}%
          </p>
        </div>

        <div className="financial-progress-track h-5 w-full overflow-hidden rounded-full border-[3px] border-black bg-[#080A16] shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
          <div
            className="h-full bg-[#22C55E]"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  paidPercent
                )
              )}%`,
            }}
          />
        </div>
      </div>

      {/* SUMMARY MESSAGE */}

      <div className="financial-summary-message mt-5 rounded-2xl border-[3px] border-black bg-[#111933] p-4 shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
        {leftToFund >
        0.01 ? (
          <p className="text-sm font-bold text-slate-300">
            {money(
              leftToFund
            )}{" "}
            left to fund ·{" "}
            {money(
              fundedAwaitingPayment
            )}{" "}
            already reserved ·{" "}
            {remainingCount} bill
            {remainingCount ===
            1
              ? ""
              : "s"}{" "}
            still unpaid
          </p>
        ) : unpaidTotal >
          0.01 ? (
          <p className="text-sm font-bold text-slate-300">
            ✅ All obligations are funded ·{" "}
            {money(
              unpaidTotal
            )}{" "}
            awaiting payment ·{" "}
            {remainingCount} bill
            {remainingCount ===
            1
              ? ""
              : "s"}{" "}
            still unpaid
          </p>
        ) : (
          <p className="text-sm font-black text-emerald-300">
            🎉 All bills are funded and paid.
          </p>
        )}
      </div>
    </SectionCard>
  );
}