// PaySplit/Entities/Bill.tsx

export type BillCategory =
  | "rent"
  | "utilities"
  | "internet"
  | "phone"
  | "groceries"
  | "subscriptions"
  | "debt"
  | "other";

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 - 31
  category: BillCategory;
  isActive: boolean;
  notes?: string;
};

export function makeBill(partial: Partial<Bill> = {}): Bill {
  return {
    id: partial.id ?? crypto.randomUUID(),
    name: partial.name ?? "New Bill",
    amount: partial.amount ?? 0,
    dueDay: partial.dueDay ?? 1,
    category: partial.category ?? "other",
    isActive: partial.isActive ?? true,
    notes: partial.notes,
  };
}

export function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}