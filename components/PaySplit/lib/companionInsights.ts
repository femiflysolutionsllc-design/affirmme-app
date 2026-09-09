import type {
  BillItem,
  PaycheckAllocation,
} from "../PaySplit/lib/paysplitStore";

import type {
  PlannerPaycheck,
} from "../PaySplit/lib/PaycheckPlannerStore";

import {
  getBillAllocations,
} from "../PaySplit/lib/billAllocation";

/* =========================
   Types
========================= */

export type CompanionInsightTone =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "purple";

export type CompanionInsight = {
  id: string;
  emoji: string;
  title: string;
  message: string;
  priority: number;
  tone: CompanionInsightTone;
};

type BuildCompanionInsightsOptions = {
  selectedDate: string;
  paychecks: PlannerPaycheck[];
  bills: BillItem[];
};

/* =========================
   Helpers
========================= */

function money(value: number) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeValue);
}

function getDateDay(dateISO: string) {
  const date = new Date(
    `${dateISO}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return 1;
  }

  return date.getDate();
}

function getAllocationForPaycheck(
  bill: BillItem,
  paycheckId: string
): PaycheckAllocation | undefined {
  return getBillAllocations(bill).find(
    (allocation) =>
      allocation.paycheckId === paycheckId
  );
}

function getAssignedAmountForPaycheck(
  bill: BillItem,
  paycheckId: string
) {
  const allocation =
    getAllocationForPaycheck(
      bill,
      paycheckId
    );

  if (allocation) {
    return Math.max(
      0,
      Number(allocation.amount || 0)
    );
  }

  if (
    bill.assignedPaycheckId ===
    paycheckId
  ) {
    return Math.max(
      0,
      Number(bill.amount || 0)
    );
  }

  return 0;
}

function getBillsAssignedToPaycheck(
  bills: BillItem[],
  paycheckId: string
) {
  return bills
    .map((bill) => ({
      bill,
      assignedAmount:
        getAssignedAmountForPaycheck(
          bill,
          paycheckId
        ),
    }))
    .filter(
      (item) => item.assignedAmount > 0
    );
}

function getBillsDueOnDate(
  bills: BillItem[],
  selectedDate: string
) {
  const selectedDay =
    getDateDay(selectedDate);

  return bills.filter((bill) => {
    if (bill.status === "paid") {
      return false;
    }

    const frequency =
      bill.frequency ?? "monthly";

    if (frequency === "monthly") {
      return (
        Number(bill.dueDay || 1) ===
        selectedDay
      );
    }

    if (
      frequency === "semi-monthly"
    ) {
      return (
        Number(bill.dueDay || 1) ===
          selectedDay ||
        Number(
          bill.secondDueDay || 15
        ) === selectedDay
      );
    }

    if (frequency === "one-time") {
      return (
        bill.startDate === selectedDate
      );
    }

    return false;
  });
}

/* =========================
   Insight Builder
========================= */

export function buildCompanionInsights({
  selectedDate,
  paychecks,
  bills,
}: BuildCompanionInsightsOptions): CompanionInsight[] {
  const insights: CompanionInsight[] =
    [];

  const paychecksForDate =
    paychecks.filter(
      (paycheck) =>
        paycheck.payDate ===
        selectedDate
    );

  const billsDueToday =
    getBillsDueOnDate(
      bills,
      selectedDate
    );

  for (const paycheck of paychecksForDate) {
    const assignedBills =
      getBillsAssignedToPaycheck(
        bills,
        paycheck.id
      );

    const assignedTotal =
      assignedBills.reduce(
        (total, item) =>
          total +
          item.assignedAmount,
        0
      );

    const remaining =
      Number(paycheck.amount || 0) -
      assignedTotal;

    insights.push({
      id: `payday-${paycheck.id}`,
      emoji: "💵",
      title: "Payday",
      message:
        assignedBills.length > 0
          ? `${money(
              paycheck.amount
            )} is coming in. ${money(
              assignedTotal
            )} is assigned to bills, leaving ${money(
              remaining
            )}.`
          : `${money(
              paycheck.amount
            )} is coming in and no bills are currently assigned to this paycheck.`,
      priority: 100,
      tone:
        remaining < 0
          ? "red"
          : remaining <
              paycheck.amount * 0.2
            ? "yellow"
            : "green",
    });

    if (remaining < 0) {
      insights.push({
        id: `over-budget-${paycheck.id}`,
        emoji: "⚠️",
        title: "Paycheck Over Budget",
        message: `Your assigned bills exceed this paycheck by ${money(
          Math.abs(remaining)
        )}. Consider moving part of a bill to another paycheck.`,
        priority: 95,
        tone: "red",
      });
    }

    if (
      remaining > 0 &&
      assignedBills.length > 0
    ) {
      insights.push({
        id: `remaining-${paycheck.id}`,
        emoji: "🏦",
        title: "Money Remaining",
        message: `After assigned bills, you have ${money(
          remaining
        )} available from this paycheck.`,
        priority: 70,
        tone: "blue",
      });
    }
  }

  if (billsDueToday.length > 0) {
    const dueTotal =
      billsDueToday.reduce(
        (total, bill) =>
          total +
          Number(bill.amount || 0),
        0
      );

    insights.push({
      id: `bills-due-${selectedDate}`,
      emoji: "🧾",
      title: "Bills Due",
      message: `${
        billsDueToday.length
      } bill${
        billsDueToday.length === 1
          ? " is"
          : "s are"
      } due for a total of ${money(
        dueTotal
      )}.`,
      priority: 90,
      tone: "yellow",
    });
  }

  if (
    paychecksForDate.length > 0 &&
    billsDueToday.length === 0
  ) {
    insights.push({
      id: `saving-opportunity-${selectedDate}`,
      emoji: "✨",
      title: "Savings Opportunity",
      message:
        "No bills are due today. Consider moving part of the remaining money toward savings or debt.",
      priority: 50,
      tone: "purple",
    });
  }

  if (
    paychecksForDate.length === 0 &&
    billsDueToday.length === 0
  ) {
    insights.push({
      id: `clear-day-${selectedDate}`,
      emoji: "🌿",
      title: "Clear Financial Day",
      message:
        "No paychecks or bills are scheduled for this date.",
      priority: 20,
      tone: "green",
    });
  }

  insights.push({
    id: `affirmation-${selectedDate}`,
    emoji: "💫",
    title: "AffirmMe Reminder",
    message:
      "Small, consistent actions create lasting change.",
    priority: 10,
    tone: "purple",
  });

  return insights.sort(
    (first, second) =>
      second.priority -
      first.priority
  );
}