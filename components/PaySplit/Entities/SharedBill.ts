export type BillParticipant = {
  id: string;
  name: string;
  share: number; // how much this person owes
  paid: boolean;
};

export type SharedBill = {
  id: string;
  title: string;
  total: number;
  dueDate?: string;
  participants: BillParticipant[];
};