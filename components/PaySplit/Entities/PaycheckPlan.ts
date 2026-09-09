export type Paycheck = "A" | "B";

export type BillPaycheckPlan = {
  billId: string;
  enabled: boolean;
  paycheck: Paycheck;
  // optional: split the bill across both checks later
  amountOverride?: number;
};