export type AccountType = "Checking" | "Savings" | "Credit" | "Other";

export type BankAccount = {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // dollars
  notes?: string;
};