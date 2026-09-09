"use client";

import * as React from "react";

/* =========================
   Types
========================= */

export type SplitMode = "self" | "roommate";
export type PayFrequency = "biweekly" | "semimonthly" | "monthly";

export type SplitBill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  paid?: boolean;
};

export type SplitPlan = {
  billId: string;
  assignTo: "A" | "B" | "both";
  splitType: "equal" | "custom";
  yourSharePct: number;
};

export type SelfCareBucket = {
  id: string;
  label: string;
  budget: number;
};

export type PaycheckSchedule = {
  biweeklyAnchorA: string;
  biweeklyAnchorB: string;
  semiDay1: number;
  semiDay2: number;
  monthlyDay: number;
};

export type SplitState = {
  mode: SplitMode;
  payFrequency: PayFrequency;

  paycheckA: number;
  paycheckB: number;

  paycheckADate: string;
  paycheckBDate: string;

  schedule: PaycheckSchedule;
  useScheduleDates: boolean;

  bills: SplitBill[];
  plans: SplitPlan[];

  selfCareLabel: string;
  selfCareBudget: number;
  selfCareBuckets: SelfCareBucket[];
};

/* =========================
   Constants
========================= */

export const SPLITBILLS_KEY = "paysplit_splitbills_v3";

/* =========================
   Helpers (LOCAL ONLY)
========================= */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/* =========================
   LocalStorage Hook
========================= */

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useSyncedLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initial;
    return safeParse(window.localStorage.getItem(key), initial);
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/* =========================
   Defaults
========================= */

export function defaultSplitBillsState(): SplitState {
  return {
    mode: "self",
    payFrequency: "biweekly",
    paycheckA: 0,
    paycheckB: 0,
    paycheckADate: "",
    paycheckBDate: "",
    schedule: {
      biweeklyAnchorA: "",
      biweeklyAnchorB: "",
      semiDay1: 1,
      semiDay2: 15,
      monthlyDay: 1,
    },
    useScheduleDates: true,
    bills: [],
    plans: [],
    selfCareLabel: "Self-Care",
    selfCareBudget: 0,
    selfCareBuckets: [],
  };
}

/* =========================
   Bills Store Compatibility
========================= */

export const BILLS_KEY = "paysplit_bills_v1";
export const PAYMENT_HISTORY_KEY =
  "paysplit_payment_history_v1";
export const BILLS_UPDATED_EVENT =
  "paysplit-bills-updated";  

export type BillStatus =
  | "paid"
  | "scheduled"
  | "unpaid";

export type BillFrequency =
  | "monthly"
  | "semi-monthly"
  | "biweekly"
  | "weekly"
  | "one-time";

  export type PaycheckAllocation = {
    paycheckId: string;
    amount: number;
  
    /**
     * Tracks whether this specific paycheck portion
     * has been paid.
     */
    paid?: boolean;
  
    /**
     * Date and time this portion was marked paid.
     */
    paidAt?: string;
  };

export type BillItem = {
  id: string;
  name: string;
  amount: number;
  category: string;
  status: BillStatus;

  /**
   * Older saved bills may not contain this yet.
   * Missing frequency will later be interpreted as monthly.
   */
  frequency?: BillFrequency;

  /**
   * Used for monthly and semi-monthly bills.
   */
  dueDay?: number;
  secondDueDay?: number;

  /**
   * Used for weekly, biweekly, and one-time bills.
   * Format: YYYY-MM-DD
   */
  startDate?: string;

  /**
   * Optional ending date for recurring schedules.
   * Format: YYYY-MM-DD
   */
  endDate?: string;

  /**
   * Legacy single-paycheck assignment.
   * Keep this temporarily so older saved bills still work.
   */
  assignedPaycheckId?: string;

  /**
   * New split-paycheck assignment.
   * Each entry represents the amount of this bill assigned
   * to a specific paycheck.
   */
  paycheckAllocations?: PaycheckAllocation[];

  note?: string;
  paidAt?: string;
  updatedAt?: number;
};

export function loadBills(): BillItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawBills =
      window.localStorage.getItem(
        BILLS_KEY
      );

    if (!rawBills) {
      return [];
    }

    const parsedBills =
      JSON.parse(rawBills);

    return Array.isArray(parsedBills)
      ? (parsedBills as BillItem[])
      : [];
  } catch {
    return [];
  }
}

export function wasPaidThisMonth(paidAt?: string) {
  if (!paidAt) return false;

  const paidDate = new Date(paidAt);
  const now = new Date();

  return (
    paidDate.getFullYear() === now.getFullYear() &&
    paidDate.getMonth() === now.getMonth()
  );
}

export type PaymentItem = {
  id: string;
  dateISO: string;
  name: string;
  category: string;
  amount: number;
  status: "paid" | "scheduled" | "unpaid";
  note?: string;
  accountId?: string;
  ledgerKey?: string;
  billId?: string;
};