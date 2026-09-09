// components/PaySplit/lib/billDefaults.ts

export type BillStatus = "unpaid" | "scheduled" | "paid";

export type BillItem = {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDay: number;
  status: BillStatus;
  note?: string;
  paidAt?: string;
  updatedAt: number;
};

export function defaultBills(): BillItem[] {
  return [];
  // later we’ll put your real default list here if you want
}