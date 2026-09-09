"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type StudentLevel = "junior_high" | "high_school" | "college";

export type Account = {
  id: string;
  name: string;           // "Chase Checking"
  type: "cash" | "checking" | "savings" | "prepaid";
  balance: number;
  color?: string;         // optional UI hint later
  createdAt: string;      // ISO
};

export type TxnType = "bill" | "transfer" | "deposit" | "spending" | "piggybank";

export type Transaction = {
  id: string;
  date: string;           // ISO YYYY-MM-DD
  type: TxnType;
  accountId?: string;     // which account paid/spent
  amount: number;         // positive number
  direction: "out" | "in";
  label: string;          // "Rent" / "Starbucks" / "Moved to Piggy Bank"
  billId?: string;        // optional tie-in later
  note?: string;
};

export type AppSettings = {
  usePaySplit: boolean;     // user can turn it off (student friendly)
  studentLevel: StudentLevel;

  // roommate settings
  roommateEnabled: boolean;
  roommateName: string;
  yourName: string;

  // UI preferences
  showDollarSigns: boolean; // helpful for younger students
};

export type PaySplitStore = {
  accounts: Account[];
  transactions: Transaction[];
  settings: AppSettings;

  addAccount: (a: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;

  updateSettings: (patch: Partial<AppSettings>) => void;
};

const STORAGE_KEY = "paysplit_store_v1";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  usePaySplit: true,
  studentLevel: "college",
  roommateEnabled: false,
  roommateName: "Roommate",
  yourName: "Me",
  showDollarSigns: true,
};

const DEFAULT_DATA = {
  accounts: [
    {
      id: "a1",
      name: "Cash",
      type: "cash" as const,
      balance: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  transactions: [] as Transaction[],
  settings: DEFAULT_SETTINGS,
};

const Ctx = createContext<PaySplitStore | null>(null);

export function PaySplitProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_DATA;
    return safeParse<typeof DEFAULT_DATA>(window.localStorage.getItem(STORAGE_KEY), DEFAULT_DATA);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const api: PaySplitStore = useMemo(() => {
    return {
      accounts: data.accounts,
      transactions: data.transactions,
      settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },

      addAccount(a) {
        const next: Account = {
          id: uid(),
          createdAt: new Date().toISOString(),
          balance: Number(a.balance || 0),
          name: a.name.trim() || "New account",
          type: a.type ?? "checking",
          color: a.color,
        };
        setData((prev: any) => ({ ...prev, accounts: [next, ...(prev.accounts ?? [])] }));
      },

      updateAccount(id, patch) {
        setData((prev: any) => ({
          ...prev,
          accounts: (prev.accounts ?? []).map((x: Account) =>
            x.id === id ? { ...x, ...patch, balance: Number((patch as any).balance ?? x.balance) } : x
          ),
        }));
      },

      deleteAccount(id) {
        setData((prev: any) => ({
          ...prev,
          accounts: (prev.accounts ?? []).filter((x: Account) => x.id !== id),
          transactions: (prev.transactions ?? []).filter((t: Transaction) => t.accountId !== id),
        }));
      },

      addTransaction(t) {
        const next: Transaction = {
          id: uid(),
          date: t.date,
          type: t.type,
          accountId: t.accountId,
          amount: Math.abs(Number(t.amount || 0)),
          direction: t.direction,
          label: t.label.trim() || "Transaction",
          billId: t.billId,
          note: t.note,
        };

        // apply to account balance immediately
        setData((prev: any) => {
          const accounts: Account[] = prev.accounts ?? [];
          const txns: Transaction[] = prev.transactions ?? [];

          const updatedAccounts = accounts.map((acc) => {
            if (!next.accountId || acc.id !== next.accountId) return acc;
            const delta = next.direction === "out" ? -next.amount : next.amount;
            return { ...acc, balance: Number(acc.balance || 0) + delta };
          });

          return { ...prev, accounts: updatedAccounts, transactions: [next, ...txns] };
        });
      },

      deleteTransaction(id) {
        // NOTE: We won’t “reverse” balances automatically here (safe for students).
        // If you want reversal later, we can add it.
        setData((prev: any) => ({
          ...prev,
          transactions: (prev.transactions ?? []).filter((t: Transaction) => t.id !== id),
        }));
      },

      updateSettings(patch) {
        setData((prev: any) => ({
          ...prev,
          settings: { ...DEFAULT_SETTINGS, ...(prev.settings ?? {}), ...patch },
        }));
      },
    };
  }, [data]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePaySplitStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePaySplitStore must be used inside PaySplitProvider");
  return v;
}