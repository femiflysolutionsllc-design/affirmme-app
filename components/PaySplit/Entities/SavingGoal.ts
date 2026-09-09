export type SavingsGoal = {
  id: string;
  name: string;
  target: number;     // goal amount
  saved: number;      // current saved
  dueISO?: string;    // optional target date
};