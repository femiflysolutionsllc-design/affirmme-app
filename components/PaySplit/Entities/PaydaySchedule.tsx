export type PayFrequency = "weekly" | "biweekly" | "monthly";

export type PaydaySchedule = {
  id: string;
  frequency: PayFrequency;
  nextPaydayISO: string; // "2025-12-24"
  amount?: number;
};