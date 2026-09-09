"use client";

import React from "react";

export type StudentLevel = "junior_high" | "high_school" | "college" | "working_adult";
export type SplitMode = "self" | "roommate";
export type PayFrequency = "biweekly" | "semimonthly" | "monthly";

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  category: string;
  paid?: boolean;
  paidAt?: string; // ISO date
  paidFromAccountId?: string;
};

export type Account = {
  id: string;
  name: string;         // "Chase", "Cash", "Debit Card", "Savings"
  type: "checking" | "savings" | "cash" | "card";
  balance: number;
  notes?: string;
};

export type Txn = {
  id: string;
  ts: string; // ISO timestamp
  accountId: string;
  type: "income" | "expense";
  amount: number; // positive number
  label: string;  // "Rent", "Electric"
  billId?: string;
  category?: string;
};

export type PaySplitSettings = {
  usePaySplit: boolean;          // onboarding toggle
  studentLevel: StudentLevel;
  enableRoommate: boolean;
  roommateName: string;
};

export type PaySplitStore = {
  // settings
  settings: PaySplitSettings;

  // split bills settings (you already have these inside SplitBills page,
  // but we store shared things here for dashboard + history + accounts)
  mode: SplitMode;
  payFrequency: PayFrequency;

  // data
  bills: Bill[];
  accounts: Account[];
  txns: Txn[];
};

export const STORAGE_KEY = "paysplit_app_v1";

export function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(safe);
}

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const DEFAULT_STORE: PaySplitStore = {
  settings: {
    usePaySplit: true,
    studentLevel: "high_school",
    enableRoommate: false,
    roommateName: "Roommate",
  },

  mode: "self",
  payFrequency: "biweekly",

  bills: [
    { id: "b1", name: "Rent", amount: 1800, dueDay: 1, category: "Housing", paid: false },
    { id: "b2", name: "Electric", amount: 140, dueDay: 15, category: "Utilities", paid: false },
    { id: "b3", name: "Phone", amount: 95, dueDay: 20, category: "Phone", paid: false },
  ],

  accounts: [
    { id: "a1", name: "Checking", type: "checking", balance: 0 },
    { id: "a2", name: "Cash", type: "cash", balance: 0 },
  ],

  txns: [],
};

export function usePaySplitStore() {
  const [store, setStore] = React.useState<PaySplitStore>(() => {
    if (typeof window === "undefined") return DEFAULT_STORE;
    const raw = safeParse<PaySplitStore>(window.localStorage.getItem(STORAGE_KEY), DEFAULT_STORE);

    // normalize (in case older localStorage is missing fields)
    return {
      ...DEFAULT_STORE,
      ...raw,
      settings: { ...DEFAULT_STORE.settings, ...(raw as any).settings },
      bills: Array.isArray((raw as any).bills) ? (raw as any).bills : DEFAULT_STORE.bills,
      accounts: Array.isArray((raw as any).accounts) ? (raw as any).accounts : DEFAULT_STORE.accounts,
      txns: Array.isArray((raw as any).txns) ? (raw as any).txns : DEFAULT_STORE.txns,
    };
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  // ---- Actions ----

  function addAccount(p: Omit<Account, "id">) {
    setStore((prev) => ({ ...prev, accounts: [{ ...p, id: uid() }, ...prev.accounts] }));
  }

  function updateAccount(id: string, patch: Partial<Account>) {
    setStore((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }

  function deleteAccount(id: string) {
    setStore((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
      txns: prev.txns.filter((t) => t.accountId !== id),
    }));
  }

  function recordTxn(t: Omit<Txn, "id" | "ts">) {
    const tx: Txn = { ...t, id: uid(), ts: new Date().toISOString() };

    setStore((prev) => {
      const accounts = prev.accounts.map((a) => {
        if (a.id !== tx.accountId) return a;
        const delta = tx.type === "income" ? tx.amount : -tx.amount;
        return { ...a, balance: Number(a.balance || 0) + delta };
      });

      return { ...prev, accounts, txns: [tx, ...prev.txns] };
    });
  }

  // The “make bills mark paid” wiring:
  function markBillPaid(billId: string, accountId: string) {
    setStore((prev) => {
      const bill = prev.bills.find((b) => b.id === billId);
      if (!bill) return prev;

      // if already paid, do nothing
      if (bill.paid) return prev;

      const now = new Date();
      const paidAt = now.toISOString().slice(0, 10);

      const updatedBills = prev.bills.map((b) =>
        b.id === billId ? { ...b, paid: true, paidAt, paidFromAccountId: accountId } : b
      );

      // create a txn (expense)
      const tx: Txn = {
        id: uid(),
        ts: now.toISOString(),
        accountId,
        type: "expense",
        amount: Number(bill.amount || 0),
        label: bill.name,
        billId: bill.id,
        category: bill.category,
      };

      const updatedAccounts = prev.accounts.map((a) => {
        if (a.id !== accountId) return a;
        return { ...a, balance: Number(a.balance || 0) - Number(bill.amount || 0) };
      });

      return { ...prev, bills: updatedBills, accounts: updatedAccounts, txns: [tx, ...prev.txns] };
    });
  }

  function markBillUnpaid(billId: string) {
    setStore((prev) => ({
      ...prev,
      bills: prev.bills.map((b) =>
        b.id === billId ? { ...b, paid: false, paidAt: undefined, paidFromAccountId: undefined } : b
      ),
    }));
  }

  function updateSettings(patch: Partial<PaySplitSettings>) {
    setStore((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }

  return {
    store,
    setStore,
    actions: {
      addAccount,
      updateAccount,
      deleteAccount,
      recordTxn,
      markBillPaid,
      markBillUnpaid,
      updateSettings,
    },
  };
}

// ---- Dashboard helpers ----

export function getBillStatusColor(daysUntilDue: number, paid?: boolean) {
  if (paid) return "text-emerald-300";
  if (daysUntilDue < 0) return "text-rose-300";      // overdue
  if (daysUntilDue <= 3) return "text-amber-300";    // due soon
  return "text-slate-200";                           // normal upcoming
}

export function daysUntilDue(dueDay: number) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = new Date(y, m, now.getDate());

  // assume bill belongs to this month; if already passed, treat as next month due
  const thisMonthDue = new Date(y, m, dueDay);
  const due = thisMonthDue < today ? new Date(y, m + 1, dueDay) : thisMonthDue;

  const ms = due.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}