"use client";

import React, { useEffect, useMemo, useState } from "react";
import SectionCard from "../paysplit-ui/SectionCard";
import AddBillForm from "../bills/AddBillForm";
import BillsSection from "../bills/BillsSection";
import FinancialSnapshot from "../bills/FinancialSnapshot";
import PaycheckPlanner from "../bills/PaycheckPlanner";
import AttentionSection from "../bills/AttentionSection";
import { syncBillsToCalendar } from "../lib/billCalendarSync";
import IncomePlanner from "../Components/IncomePlanner";
import {
  getBillAllocations,
} from "../lib/billAllocation";

import {
  INCOME_SOURCES_UPDATED_EVENT,
} from "../lib/incomeStore";

import {
  buildPlannerState,
  type PlannerState,
} from "../lib/PaycheckPlannerStore";


import {
  BILLS_KEY,
  BillItem,
  PAYMENT_HISTORY_KEY,
  PaymentItem,
  wasPaidThisMonth,
  useSyncedLocalStorageState,
} from "../lib/paysplitStore";

import { defaultBills } from "../lib/billDefaults";

import {
  PAYCHECK_OVERRIDES_UPDATED_EVENT,
} from "../lib/paycheckOverrideStore";

import {
  applyFundingRecommendationToBill,
  type AutoFundingRecommendation,
} from "../lib/autoFunding";

import SpendingCushionSettings from "../Components/SpendingCushionSettings";


const ACCOUNTS_KEY = "paysplit_accounts_v1";
const BILL_ACCOUNT_KEY = "paysplit_bill_account_v1";

type Tone = "green" | "yellow" | "red" | "slate";
type Assign = "A" | "B" | "both";
type StatusFilter = "all" | "active" | "scheduled" | "paid";


type BillWithAssign = BillItem & {
  assignTo?: Assign;
  assignedPaycheckId?: string;
};

type AccountType = "cash" | "checking" | "savings" | "card";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color?: "emerald" | "amber" | "rose" | "slate";
  createdAt: number;
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safe);
}

function toNumber(v: string | number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function StatusPill({ tone, text }: { tone: Tone; text: string }) {
  const cls =
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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] " +
        cls
      }
    >
      {text}
    </span>
  );
}

function normalizeAccounts(list: any): Account[] {
  const okType = (t: any): AccountType =>
    t === "cash" || t === "checking" || t === "savings" || t === "card"
      ? t
      : "checking";

  const okColor = (c: any): Account["color"] =>
    c === "emerald" || c === "amber" || c === "rose" || c === "slate"
      ? c
      : "slate";

  return (Array.isArray(list) ? list : []).filter(Boolean).map((a: any) => ({
    id: String(a?.id ?? uid()),
    name: String(a?.name ?? "Account"),
    type: okType(a?.type),
    balance: Number(a?.balance ?? 0),
    color: okColor(a?.color),
    createdAt: Number(a?.createdAt ?? Date.now()),
  }));
}

function normalizeHistory(list: any): PaymentItem[] {
  if (!Array.isArray(list)) return [];

  return list.filter(Boolean).map((x: any) => ({
    id: String(x?.id ?? uid()),
    dateISO:
      typeof x?.dateISO === "string" && x.dateISO.length >= 10
        ? x.dateISO.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    name: String(x?.name ?? "Payment"),
    category: String(x?.category ?? "Bills"),
    amount: Number(x?.amount ?? 0),
    status:
      x?.status === "paid" ||
      x?.status === "scheduled" ||
      x?.status === "unpaid"
        ? x.status
        : "scheduled",
    note: typeof x?.note === "string" ? x.note : "",
    ...(typeof x?.accountId === "string" && x.accountId
      ? { accountId: x.accountId }
      : {}),
    ...(typeof x?.ledgerKey === "string" ? { ledgerKey: x.ledgerKey } : {}),
    ...(typeof x?.billId === "string" ? { billId: x.billId } : {}),
  })) as any;
}


type BillsProps = {
  userStage:
    | "junior_high"
    | "high_school"
    | "adult";
};

export default function Bills({
  userStage,
}: BillsProps) {
  const [bills, setBills] = useSyncedLocalStorageState<BillWithAssign[]>(
    BILLS_KEY,
    defaultBills() as BillWithAssign[]
  );

  useEffect(() => {
    syncBillsToCalendar(bills);
  }, [bills]);

  const [history, setHistory] = useSyncedLocalStorageState<PaymentItem[]>(
    PAYMENT_HISTORY_KEY,
    []
  );

  const [accountsRaw, setAccountsRaw] = useSyncedLocalStorageState<any[]>(
    ACCOUNTS_KEY,
    []
  );

  const [billAccount, setBillAccount] = useSyncedLocalStorageState<
    Record<string, string>
  >(BILL_ACCOUNT_KEY, {});

  const [planner, setPlanner] = useState<PlannerState>(() =>
  buildPlannerState()
);

useEffect(() => {
  function refreshPlanner() {
    setPlanner(
      buildPlannerState()
    );
  }

  refreshPlanner();

  window.addEventListener(
    INCOME_SOURCES_UPDATED_EVENT,
    refreshPlanner
  );

  window.addEventListener(
    PAYCHECK_OVERRIDES_UPDATED_EVENT,
    refreshPlanner
  );

  window.addEventListener(
    "storage",
    refreshPlanner
  );

  return () => {
    window.removeEventListener(
      INCOME_SOURCES_UPDATED_EVENT,
      refreshPlanner
    );

    window.removeEventListener(
      PAYCHECK_OVERRIDES_UPDATED_EVENT,
      refreshPlanner
    );

    window.removeEventListener(
      "storage",
      refreshPlanner
    );
  };
}, []);

const hasTwoPaychecks = planner.hasTwoPaychecks;

const paycheckA =
  planner.paycheckA?.amount ?? 0;

const paycheckB =
  planner.paycheckB?.amount ?? 0;

  const [search, setSearch] = useState("");
  const [dueSoonDays, setDueSoonDays] = useState(5);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const accounts = useMemo(() => normalizeAccounts(accountsRaw), [accountsRaw]);

  React.useEffect(() => {
    setHistory((prev) => normalizeHistory(prev));
    setAccountsRaw((prev) => normalizeAccounts(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setBills((previousBills) =>
      previousBills.map((bill) => {
        const needsMonthlyReset =
          bill.status === "paid" &&
          !wasPaidThisMonth(bill.paidAt);
  
        if (!needsMonthlyReset) {
          return bill;
        }
  
        return {
          ...bill,
          status: "unpaid" as const,
          updatedAt: Date.now(),
        };
      })
    );
  
    // Run once when the Bills page loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    let aBills = 0;
    let bBills = 0;

    for (const bill of bills) {
      if (bill.status === "paid") continue;

      const amount = toNumber(bill.amount);
      const assignTo = bill.assignTo ?? "A";

      if (assignTo === "A") aBills += amount;
      if (assignTo === "B") bBills += amount;

      if (assignTo === "both") {
        aBills += amount / 2;
        bBills += amount / 2;
      }
    }

    return {
      aBills,
      bBills,
      aAfter: toNumber(paycheckA) - aBills,
      bAfter: (hasTwoPaychecks ? toNumber(paycheckB) : 0) - bBills,
    };
  }, [bills, paycheckA, paycheckB, hasTwoPaychecks]);

  const filteredBills = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bills.filter((b) => {
      if (!q) return true;

      return (
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        String(b.dueDay).includes(q)
      );
    });
  }, [bills, search]);

  const paidBills = filteredBills.filter((b) => b.status === "paid");
  const unpaidBills = filteredBills.filter((b) => b.status !== "paid");
  const scheduledBills = unpaidBills.filter((b) => b.status === "scheduled");
  const activeBills = unpaidBills.filter((b) => b.status !== "scheduled");

  const managerBills =
    statusFilter === "paid"
      ? paidBills
      : statusFilter === "scheduled"
        ? scheduledBills
        : statusFilter === "active"
          ? activeBills
          : filteredBills;

          const today = new Date().getDate();

          const attentionBills = useMemo(() => {
            return bills
              .filter((bill) => {
                if (bill.status === "paid") return false;
          
                const dueDay = Number(bill.dueDay || 1);
                const daysUntilDue = dueDay - today;
          
                // Includes overdue bills and bills due within the selected window.
                return daysUntilDue <= dueSoonDays;
              })
              .sort((firstBill, secondBill) => {
                return (
                  Number(firstBill.dueDay || 1) -
                  Number(secondBill.dueDay || 1)
                );
              });
          }, [bills, dueSoonDays, today]);

          const attentionTotal = useMemo(() => {
            return attentionBills.reduce(
              (total, bill) => total + Number(bill.amount || 0),
              0
            );
          }, [attentionBills]);

  const totalBillsAmount = bills.reduce(
    (sum, b) => sum + Number(b.amount || 0),
    0
  );

  const totalBillsCount = bills.length;

  const paidPercent =
    totalBillsCount === 0
      ? 0
      : Math.round(
          (bills.filter((b) => b.status === "paid").length /
            totalBillsCount) *
            100
        );

  const unpaidTotal = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const paidCount = bills.filter((b) => b.status === "paid").length;
  const remainingCount = bills.filter((b) => b.status !== "paid").length;

  const availableCash =
    Number(totals.aAfter || 0) +
    (hasTwoPaychecks ? Number(totals.bAfter || 0) : 0);

  function safeAssign(a: Assign): Assign {
    if (!hasTwoPaychecks && a === "B") return "A";
    return a;
  }

  function updateBill(id: string, patch: Partial<BillWithAssign>) {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;

        const nextAssign = patch.assignTo ? safeAssign(patch.assignTo) : b.assignTo;

        return {
          ...b,
          ...patch,
          assignTo: nextAssign,
          updatedAt: Date.now(),
        };
      })
    );
  }

  function applyAutoFundingRecommendation(
    billId: string,
    recommendation: AutoFundingRecommendation
  ) {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) {
          return bill;
        }
  
        const updatedBill =
          applyFundingRecommendationToBill({
            bill,
            recommendation,
          });
  
        return {
          ...updatedBill,
          updatedAt: Date.now(),
        };
      })
    );
  }

  function updateManualBillAllocation(
    billId: string,
    payWindowId: string,
    amount: number
  ) {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) {
          return bill;
        }
  
        const safeAmount = Math.max(
          0,
          Number(amount || 0)
        );
  
        const allocationMap = new Map(
          (bill.paycheckAllocations ?? []).map(
            (allocation) => [
              allocation.paycheckId,
              {
                ...allocation,
                amount: Math.max(
                  0,
                  Number(allocation.amount || 0)
                ),
              },
            ]
          )
        );
  
        if (safeAmount <= 0) {
          allocationMap.delete(payWindowId);
        } else {
          const existing =
            allocationMap.get(payWindowId);
  
          allocationMap.set(payWindowId, {
            paycheckId: payWindowId,
            amount: safeAmount,
            paid: existing?.paid,
            paidAt: existing?.paidAt,
          });
        }
  
        const nextAllocations =
          Array.from(
            allocationMap.values()
          ).filter(
            (allocation) =>
              allocation.amount > 0
          );
  
        return {
          ...bill,
  
          paycheckAllocations:
            nextAllocations,
  
          assignedPaycheckId:
            nextAllocations.length === 1
              ? nextAllocations[0].paycheckId
              : undefined,
  
          updatedAt: Date.now(),
        };
      })
    );
  }

  function deleteBill(id: string) {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }

  function addBill(newBill: Omit<BillWithAssign, "id" | "updatedAt">) {
    const bill: BillWithAssign = {
      ...(newBill as any),
      id: uid(),
      updatedAt: Date.now(),
      assignTo: newBill.assignTo ?? "A",
    };

    setBills((prev) => [bill, ...prev]);
  }

  function applyAccountDelta(accountId: string, delta: number) {
    if (!accountId) return;

    setAccountsRaw((prev) =>
      normalizeAccounts(prev).map((a) =>
        a.id === accountId
          ? { ...a, balance: Number(a.balance || 0) + delta }
          : a
      )
    );
  }

  function ledgerExists(ledgerKey: string) {
    const items = normalizeHistory(history) as any[];
    return items.some((x) => String(x?.ledgerKey || "") === ledgerKey);
  }

  function pushHistory(entry: PaymentItem & { ledgerKey?: string; billId?: string }) {
    setHistory((prev) => [entry as any, ...normalizeHistory(prev)]);
  }

  function toggleAllocationPaid(
    bill: BillWithAssign,
    allocationId: string
  ) {
    const accountId =
      billAccount[bill.id] ?? "";
  
    const today =
      toISODate(new Date());
  
    const allocations =
      getBillAllocations(bill);
  
    const selectedAllocation =
      allocations.find(
        (allocation) =>
          allocation.paycheckId ===
          allocationId
      );
  
    if (!selectedAllocation) {
      return;
    }
  
    const willBePaid =
      !selectedAllocation.paid;
  
    const selectedAmount =
      Number(
        selectedAllocation.amount || 0
      );
  
    const updatedAllocations =
      allocations.map(
        (allocation) =>
          allocation.paycheckId ===
          allocationId
            ? {
                ...allocation,
                paid: willBePaid,
                paidAt: willBePaid
                  ? today
                  : "",
              }
            : allocation
      );
  
    pushHistory({
      id: uid(),
      dateISO: today,
      name: bill.name,
      category:
        bill.category || "Bills",
      amount: willBePaid
        ? selectedAmount
        : -Math.abs(
            selectedAmount
          ),
      status: "paid",
      note: willBePaid
        ? `Paid allocation ${allocationId}`
        : `Payment reversed for ${allocationId}`,
      ...(accountId
        ? { accountId }
        : {}),
      ledgerKey:
        `bill:${bill.id}:allocation:${allocationId}:${
          willBePaid
            ? "pay"
            : "reversal"
        }:${Date.now()}`,
      billId: bill.id,
    } as any);
  
    if (
      accountId &&
      selectedAmount > 0
    ) {
      applyAccountDelta(
        accountId,
        willBePaid
          ? -selectedAmount
          : selectedAmount
      );
    }
  
    const allAllocationsPaid =
      updatedAllocations.every(
        (allocation) =>
          allocation.paid
      );
  
    updateBill(
      bill.id,
      {
        paycheckAllocations:
          updatedAllocations,
  
        status: allAllocationsPaid
          ? ("paid" as any)
          : ("unpaid" as any),
  
        paidAt:
          allAllocationsPaid
            ? today
            : "",
      }
    );
  }

  function togglePaid(bill: BillWithAssign) {
    const accountId = billAccount[bill.id] ?? "";
    const today = toISODate(new Date());
  
    const allocations = getBillAllocations(bill);
  
    /*
     * Older bills without paycheck allocations
     * continue using the original full-bill behavior.
     */
    if (allocations.length === 0) {
      const amount = Number(bill.amount || 0);
  
      if (bill.status !== "paid") {
        const ledgerKey =
          `bill:${bill.id}:full-payment:${Date.now()}`;
  
        pushHistory({
          id: uid(),
          dateISO: today,
          name: bill.name,
          category: bill.category || "Bills",
          amount,
          status: "paid",
          note: "Full bill paid via Bills",
          ...(accountId ? { accountId } : {}),
          ledgerKey,
          billId: bill.id,
        } as any);
  
        if (accountId && amount > 0) {
          applyAccountDelta(accountId, -amount);
        }
  
        updateBill(bill.id, {
          status: "paid" as any,
          paidAt: today,
        });
  
        return;
      }
  
      const reversalKey =
        `bill:${bill.id}:full-reversal:${Date.now()}`;
  
      pushHistory({
        id: uid(),
        dateISO: today,
        name: bill.name,
        category: bill.category || "Bills",
        amount: -Math.abs(amount),
        status: "paid",
        note: "Full bill payment reversed",
        ...(accountId ? { accountId } : {}),
        ledgerKey: reversalKey,
        billId: bill.id,
      } as any);
  
      if (accountId && amount > 0) {
        applyAccountDelta(accountId, amount);
      }
  
      updateBill(bill.id, {
        status: "unpaid" as any,
        paidAt: "",
      });
  
      return;
    }
  

    function getAllocationLabel(
      paycheckId: string
    ) {
      const paycheck = planner.allPaychecks.find(
        (item) => item.id === paycheckId
      );
  
      if (!paycheck) {
        return "Saved paycheck";
      }
  
      const date = new Intl.DateTimeFormat(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      ).format(
        new Date(`${paycheck.payDate}T00:00:00`)
      );
  
      return `${paycheck.name} • ${date}`;
    }
  
    const paymentChoices = allocations
      .map((allocation, index) => {
        const paymentStatus = allocation.paid
          ? "PAID"
          : "UNPAID";
  
        const formattedAmount =
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(allocation.amount);
  
        return `${index + 1}. ${getAllocationLabel(
          allocation.paycheckId
        )} — ${formattedAmount} — ${paymentStatus}`;
      })
      .join("\n");
  
    const selection = window.prompt(
      `Choose the paycheck portion to update:\n\n${paymentChoices}\n\nEnter a number from 1 to ${allocations.length}.\nEnter ALL to update the entire bill.`,
      "1"
    );
  
    if (!selection) {
      return;
    }
  
    const normalizedSelection =
      selection.trim().toUpperCase();
  
    /*
     * Mark or unmark every allocation.
     */
    if (normalizedSelection === "ALL") {
      const shouldMarkPaid = allocations.some(
        (allocation) => !allocation.paid
      );
  
      let accountChange = 0;
  
      const updatedAllocations = allocations.map(
        (allocation) => {
          if (
            Boolean(allocation.paid) ===
            shouldMarkPaid
          ) {
            return allocation;
          }
  
          const amount = Number(
            allocation.amount || 0
          );
  
          if (shouldMarkPaid) {
            pushHistory({
              id: uid(),
              dateISO: today,
              name: bill.name,
              category: bill.category || "Bills",
              amount,
              status: "paid",
              note: `Paid from ${getAllocationLabel(
                allocation.paycheckId
              )}`,
              ...(accountId ? { accountId } : {}),
              ledgerKey:
                `bill:${bill.id}:allocation:${allocation.paycheckId}:pay:${Date.now()}`,
              billId: bill.id,
            } as any);
  
            accountChange -= amount;
          } else {
            pushHistory({
              id: uid(),
              dateISO: today,
              name: bill.name,
              category: bill.category || "Bills",
              amount: -Math.abs(amount),
              status: "paid",
              note: `Payment reversed for ${getAllocationLabel(
                allocation.paycheckId
              )}`,
              ...(accountId ? { accountId } : {}),
              ledgerKey:
                `bill:${bill.id}:allocation:${allocation.paycheckId}:reversal:${Date.now()}`,
              billId: bill.id,
            } as any);
  
            accountChange += amount;
          }
  
          return {
            ...allocation,
            paid: shouldMarkPaid,
            paidAt: shouldMarkPaid ? today : "",
          };
        }
      );
  
      if (accountId && accountChange !== 0) {
        applyAccountDelta(
          accountId,
          accountChange
        );
      }
  
      updateBill(bill.id, {
        paycheckAllocations:
          updatedAllocations,
        status: shouldMarkPaid
          ? ("paid" as any)
          : ("unpaid" as any),
        paidAt: shouldMarkPaid ? today : "",
      });
  
      return;
    }
  
    const selectedIndex =
      Number(normalizedSelection) - 1;
  
    if (
      !Number.isInteger(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex >= allocations.length
    ) {
      alert(
        `Enter a number from 1 to ${allocations.length}, or enter ALL.`
      );
  
      return;
    }
  
    const selectedAllocation =
      allocations[selectedIndex];
  
    const willBePaid =
      !selectedAllocation.paid;
  
    const selectedAmount = Number(
      selectedAllocation.amount || 0
    );
  
    const updatedAllocations =
      allocations.map((allocation, index) =>
        index === selectedIndex
          ? {
              ...allocation,
              paid: willBePaid,
              paidAt: willBePaid
                ? today
                : "",
            }
          : allocation
      );
  
    pushHistory({
      id: uid(),
      dateISO: today,
      name: bill.name,
      category: bill.category || "Bills",
      amount: willBePaid
        ? selectedAmount
        : -Math.abs(selectedAmount),
      status: "paid",
      note: willBePaid
        ? `Paid from ${getAllocationLabel(
            selectedAllocation.paycheckId
          )}`
        : `Payment reversed for ${getAllocationLabel(
            selectedAllocation.paycheckId
          )}`,
      ...(accountId ? { accountId } : {}),
      ledgerKey:
        `bill:${bill.id}:allocation:${selectedAllocation.paycheckId}:${
          willBePaid ? "pay" : "reversal"
        }:${Date.now()}`,
      billId: bill.id,
    } as any);
  
    if (accountId && selectedAmount > 0) {
      applyAccountDelta(
        accountId,
        willBePaid
          ? -selectedAmount
          : selectedAmount
      );
    }
  
    const allAllocationsPaid =
      updatedAllocations.every(
        (allocation) => allocation.paid
      );
  
    updateBill(bill.id, {
      paycheckAllocations:
        updatedAllocations,
      status: allAllocationsPaid
        ? ("paid" as any)
        : ("unpaid" as any),
      paidAt: allAllocationsPaid
        ? today
        : "",
    });
  }

  function setScheduled(bill: BillWithAssign) {
    updateBill(bill.id, { status: "scheduled" as any });
  }

  function takeMeToBill(billId: string) {
    setStatusFilter("all");
    setSearch("");
  
    setTimeout(() => {
      const element = document.getElementById(`bill-${billId}`);
  
      if (!element) return;
  
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  
      element.classList.add(
        "ring-4",
        "ring-[#FACC15]",
        "ring-offset-4",
        "ring-offset-black"
      );
  
      setTimeout(() => {
        element.classList.remove(
          "ring-4",
          "ring-[#FACC15]",
          "ring-offset-4",
          "ring-offset-black"
        );
      }, 1800);
    }, 150);
  }

            return (
              <div className="space-y-6">
                <header className="bills-page-header relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-6 shadow-[8px_8px_0px_rgba(0,0,0,.75)]">
                  <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                      background:
                        "radial-gradient(circle at center, white 1px, transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />
          
                  <div className="relative inline-flex rotate-[-1deg] rounded-full border-[3px] border-black bg-[#FACC15] px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-black shadow-[5px_5px_0px_black]">
                    🧾 Bills Command Center
                  </div>
          
                  <h2 className="relative mt-5 text-5xl font-black uppercase leading-none text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,.75)]">
                    Bills + Paycheck Planner
                  </h2>
          
                  <p className="relative mt-3 max-w-2xl text-base font-semibold text-slate-300">
                    Plan bills by paycheck, track due dates, and mark payments in one
                    place.
                  </p>
                </header>
          
                <FinancialSnapshot
  payWindowA={planner.payWindowA}
  payWindowB={planner.payWindowB}
  bills={bills}
  totalBillsAmount={totalBillsAmount}
  paidCount={paidCount}
  totalBillsCount={totalBillsCount}
  paidPercent={paidPercent}
  unpaidTotal={unpaidTotal}
  remainingCount={remainingCount}
/>

<SectionCard
  title="✨ Today's Focus"
  subtitle={
    attentionBills.length > 0
      ? `${attentionBills.length} bill${
          attentionBills.length === 1 ? "" : "s"
        } need attention • ${money(attentionTotal)} remaining`
      : "You are all caught up. No bills need attention right now."
  }
>
  {attentionBills.length > 0 ? (
    <AttentionSection
    items={attentionBills}
    dueSoonDays={dueSoonDays}
    onTogglePaid={togglePaid}
    onTakeMeToBill={takeMeToBill}
  />
  ) : (
    <div className="bills-caught-up-card rounded-[24px] border-[3px] border-black bg-[#111933] p-6 text-center shadow-[6px_6px_0px_rgba(0,0,0,.75)]">
      <p className="text-4xl">🎉</p>

      <p className="mt-3 text-2xl font-black uppercase text-white">
        You’re All Caught Up!
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-300">
        No bills need your attention right now.
      </p>
    </div>
  )}
</SectionCard>

<IncomePlanner userStage={userStage} />

<SpendingCushionSettings />

<PaycheckPlanner
  bills={bills}
  paychecks={planner.allPaychecks}
  payWindowA={planner.payWindowA}
  payWindowB={planner.payWindowB}
  allPayWindows={planner.allPayWindows}
  onApplyFundingRecommendation={
    applyAutoFundingRecommendation
  }
    onUpdateBillAllocation={
      updateManualBillAllocation 
  }
/>

<SectionCard
  title="Add Bill"
  subtitle="Create a new mission and assign it to your paycheck."
>
  <AddBillForm
    payWindows={
      planner.allPayWindows
    }
    onAdd={(bill) =>
      addBill(bill)
    }
  />
</SectionCard>


                <SectionCard
                 title="Manage Bills"
                 subtitle="Search, filter, edit, and organize all of your bills."
                >
                  <div className="manage-bills-controls grid gap-5 sm:grid-cols-2">
                    <div className="relative rounded-[22px] border-[3px] border-black bg-[#111933] p-4 shadow-[6px_6px_0px_rgba(0,0,0,.75)]">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15]">
                        🔎 Search
                      </label>
          
                      <input
                        className="mt-3 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                        placeholder="Search by name, category, due day..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
          
                    <div className="relative rounded-[22px] border-[3px] border-black bg-[#111933] p-4 shadow-[6px_6px_0px_rgba(0,0,0,.75)]">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-[#60A5FA]">
                        ⏰ Due Soon Window
                      </label>
          
                      <input
                        inputMode="numeric"
                        className="mt-3 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                        value={String(dueSoonDays)}
                        onChange={(event) =>
                          setDueSoonDays(
                            clamp(Number(event.target.value || 5), 1, 30)
                          )
                        }
                      />
                    </div>
                  </div>
          
                  <div className="manage-bills-filters mt-6 flex flex-wrap gap-3">
                    {[
                      {
                        id: "all",
                        label: "All",
                        count: filteredBills.length,
                      },
                      {
                        id: "active",
                        label: "Active",
                        count: activeBills.length,
                      },
                      {
                        id: "scheduled",
                        label: "Scheduled",
                        count: scheduledBills.length,
                      },
                      {
                        id: "paid",
                        label: "Paid",
                        count: paidBills.length,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setStatusFilter(tab.id as StatusFilter)
                        }
                        className={
                          "rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0px_black] transition hover:-translate-y-1 " +
                          (statusFilter === tab.id
                            ? "bg-[#F43F7A] text-white"
                            : "bg-[#FACC15] text-black")
                        }
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
          
                  <div className="mt-6">
                    <BillsSection
                      title={
                        statusFilter === "all"
                          ? "All Bills"
                          : statusFilter === "active"
                            ? "Active Bills"
                            : statusFilter === "scheduled"
                              ? "Scheduled Bills"
                              : "Paid Bills"
                      }
                      items={managerBills}
                      paychecks={planner.allPaychecks}
                      payWindows={planner.allPayWindows}
                      tone={
                        statusFilter === "paid"
                          ? "green"
                          : statusFilter === "scheduled"
                            ? "yellow"
                            : "slate"
                      }
                      dueSoonDays={dueSoonDays}
                      accounts={accounts}
                      billAccount={billAccount}
                      onUpdateBill={updateBill}
                      onSelectAccount={(billId, accountId) =>
                        setBillAccount((previous) => ({
                          ...previous,
                          [billId]: accountId,
                        }))
                      }
                      onTogglePaid={togglePaid}
                      onToggleAllocationPaid={
                        toggleAllocationPaid
                      }
                      onSetScheduled={setScheduled}
                      onDeleteBill={deleteBill}
                    />
                  </div>
                </SectionCard>
              </div>
            );
          }
