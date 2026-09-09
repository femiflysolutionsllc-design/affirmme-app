// PaySplit/Entities/PaymentHistory.tsx

export type PaymentHistoryItem = {
  id: string;
  dateISO: string; // "2025-12-24"
  amount: number;
  note?: string;
  billId?: string;
  method?: "cash" | "zelle" | "venmo" | "cashapp" | "card" | "bank";
};

export function makePaymentHistoryItem(
  partial: Partial<PaymentHistoryItem> = {}
): PaymentHistoryItem {
  return {
    id: partial.id ?? crypto.randomUUID(),
    dateISO: partial.dateISO ?? new Date().toISOString().slice(0, 10),
    amount: partial.amount ?? 0,
    note: partial.note,
    billId: partial.billId,
    method: partial.method,
  };
}