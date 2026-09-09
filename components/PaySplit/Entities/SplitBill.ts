export type SplitParticipant = {
  id: string;
  name: string;
  paid: number;
  owes: number;
};

export type SplitBill = {
  id: string;
  title: string;
  totalAmount: number;
  createdAt: string;
  participants: SplitParticipant[];
  settled: boolean;
};