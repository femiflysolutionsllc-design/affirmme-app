export type AutomatedPayment = {
  id: string;
  name: string;
  amount: number;
  dayOfMonth?: number;     // 1-31 (if monthly)
  weekday?: number;        // 0-6 (if weekly)
  enabled: boolean;
  notes?: string;
};