export type SavingsGoal = {
  id: string;
  name: string;
  target: number;
  current: number;
  deadlineISO?: string;
};