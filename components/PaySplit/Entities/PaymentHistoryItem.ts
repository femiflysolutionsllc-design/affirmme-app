export type PaymentHistoryItem = {
  id: string;
  title: string;          // "Rent"
  amount: number;         // 1800
  dateISO: string;        // "2025-12-01"
  status: "paid" | "unpaid";
  category?: string;      // "Rent", "Utilities"
  method?: string;        // "Zelle", "Card", etc
  note?: string;
};