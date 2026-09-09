export type Payment = {
  id: string;
  billId?: string;
  title: string;
  amount: number;
  dateISO: string; // "2025-12-24"
  method?: string; // "Zelle", "Cash", etc
  notes?: string;
};