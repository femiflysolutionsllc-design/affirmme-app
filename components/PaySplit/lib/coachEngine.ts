export type CoachInput = {
  safeToSpend: number;
  overdueBills: number;
  dueSoonBills: number;
  financialScore: number;
  savingsPercent: number;
  nextBillName?: string;
  nextBillDays?: number;
};

export type CoachMessage = {
  title: string;
  message: string;
  mood: "success" | "warning" | "danger";
};

function money(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeAmount);
}

export function generateCoach(input: CoachInput): CoachMessage {
  if (input.overdueBills > 0) {
    return {
      title: "Immediate Attention",
      mood: "danger",
      message:
        "You have " +
        input.overdueBills +
        " overdue bill(s). Paying those first will improve your Financial Health Score and reduce stress.",
    };
  }

  if (input.dueSoonBills > 0) {
    const billName = input.nextBillName || "Your next bill";
    const days =
      typeof input.nextBillDays === "number"
        ? input.nextBillDays
        : "a few";

    return {
      title: "Upcoming Bills",
      mood: "warning",
      message:
        billName +
        " is due in " +
        days +
        " day(s). Planning ahead today keeps your month running smoothly.",
    };
  }

  if (input.financialScore >= 90) {
    return {
      title: "Excellent Work",
      mood: "success",
      message:
        "You are in excellent financial shape. You currently have " +
        money(input.safeToSpend) +
        " available after covering your remaining bills.",
    };
  }

  if (input.savingsPercent < 40) {
    return {
      title: "Build Your Savings",
      mood: "warning",
      message:
        "Your bills are under control, but your savings goal still has room to grow. Even a small transfer today helps future you.",
    };
  }

  return {
    title: "Looking Good",
    mood: "success",
    message:
      "Great job. Your finances are running smoothly today. You have " +
      money(input.safeToSpend) +
      " available after every remaining bill. Keep making decisions like this and Future You will thank you.",
  };
}