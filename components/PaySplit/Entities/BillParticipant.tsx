export type BillParticipant = {
  id: string;
  name: string;
  share: number;  // amount owed
  paid: boolean;
};