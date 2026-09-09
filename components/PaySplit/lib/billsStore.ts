"use client";

import * as React from "react";

export type BillStatus = "unpaid" | "paid" | "scheduled";

export type BillItem = {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDay: number; // 1-31
  status: BillStatus;
  note?: string;
};

export const BILLS_STORAGE_KEY = "paysplit_bills_v1";

const DEFAULT_BILLS: BillItem[] = [
  { id: "b1", name: "Rent", category: "Housing", amount: 1800, dueDay: 1, status: "unpaid" },
  { id: "b2", name: "Electric", category: "Utilities", amount: 140, dueDay: 15, status: "unpaid" },
  { id: "b3", name: "Phone", category: "Phone", amount: 95, dueDay: 20, status: "scheduled" },
];

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useBillsStore() {
  const [bills, setBills] = React.useState<BillItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_BILLS;
    const parsed = safeParse<any>(window.localStorage.getItem(BILLS_STORAGE_KEY), DEFAULT_BILLS);
    return parsed;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
  }, [bills]);

  return [bills, setBills] as const;
}