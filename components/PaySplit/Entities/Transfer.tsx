export type Transfer = {
  id: string;
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
  dateISO: string;
  notes?: string;
};