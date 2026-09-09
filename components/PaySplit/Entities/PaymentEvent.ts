export type PaymentStatus = "scheduled" | "paid" | "failed" | "skipped";
export type PaymentMethod = "bank" | "card" | "cash" | "other";

export type PaymentEvent = {
  id: string;
  dateISO: string;          // "2025-12-25"
  title: string;            // "Rent"
  category: string;         // "Rent", "Utilities"
  amount: number;           // 1800
  status: PaymentStatus;    // paid, scheduled, etc.
  method: PaymentMethod;    // bank, card, etc.
  notes?: string;
};