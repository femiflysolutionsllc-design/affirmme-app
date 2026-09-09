import type {
  PayWindow,
} from "./PaycheckPlannerStore";

import type {
  BillOccurrence,
} from "./billSchedule";

export type ScheduledBillAllocation = {
  occurrenceId: string;

  billId: string;

  billName: string;

  category: string;

  amount: number;

  dueDateISO: string;

  payWindowId: string;

  payWindowLabel: string;
};

/**
 * Finds the pay window that contains
 * this bill's due date.
 */
export function findPayWindowForOccurrence(
  occurrence: BillOccurrence,
  payWindows: PayWindow[]
): PayWindow | null {
  return (
    payWindows.find(
      (window) =>
        occurrence.dueDateISO >=
          window.startDateISO &&
        occurrence.dueDateISO <=
          window.endDateISO
    ) ?? null
  );
}

/**
 * Matches all generated bill occurrences
 * into their corresponding pay windows.
 */
export function matchBillOccurrencesToPayWindows(
  occurrences: BillOccurrence[],
  payWindows: PayWindow[]
): ScheduledBillAllocation[] {
  return occurrences
    .map((occurrence) => {
      const window =
        findPayWindowForOccurrence(
          occurrence,
          payWindows
        );

      if (!window) {
        return null;
      }

      return {
        occurrenceId:
          occurrence.id,

        billId:
          occurrence.billId,

        billName:
          occurrence.billName,

        category:
          occurrence.category,

        amount:
          occurrence.amount,

        dueDateISO:
          occurrence.dueDateISO,

        payWindowId:
          window.id,

        payWindowLabel:
          window.label,
      };
    })
    .filter(
      (
        item
      ): item is ScheduledBillAllocation =>
        item !== null
    );
}

/**
 * Returns only the scheduled bill
 * occurrences belonging to one window.
 */
export function getScheduledBillsForWindow(
  scheduledBills:
    ScheduledBillAllocation[],
  payWindowId: string
) {
  return scheduledBills.filter(
    (item) =>
      item.payWindowId ===
      payWindowId
  );
}

/**
 * Total scheduled bills for one window.
 */
export function getScheduledBillTotalForWindow(
  scheduledBills:
    ScheduledBillAllocation[],
  payWindowId: string
) {
  return getScheduledBillsForWindow(
    scheduledBills,
    payWindowId
  ).reduce(
    (total, item) =>
      total +
      Math.max(
        0,
        Number(
          item.amount || 0
        )
      ),
    0
  );
}

export type BillFundingStatus = {
  billId: string;

  billName: string;

  amountDue: number;

  amountFunded: number;

  amountRemaining: number;

  isFullyFunded: boolean;

  allocations: {
    payWindowId: string;
    amount: number;
  }[];
};

/**
 * Calculates how much of one bill has been
 * funded across its pay-window allocations.
 *
 * Important:
 * The scheduled occurrence tells us WHEN
 * the bill is due.
 *
 * The allocations tell us WHERE the money
 * is being reserved from.
 */
 export function getBillFundingStatus(
  bill: {
    id: string;
    name: string;
    amount: number;

    status?: string;
    paidAt?: string;

    paycheckAllocations?: {
      paycheckId: string;
      amount: number;
    }[];
  },
  payWindows: PayWindow[]
): BillFundingStatus {
  const amountDue =
    Math.max(
      0,
      Number(
        bill.amount || 0
      )
    );

    const isPaid =
  bill.status === "paid";

  const allocations =
    (bill.paycheckAllocations ?? [])
      .map((allocation) => {
        const matchingWindow =
          payWindows.find(
            (window) =>
              window.id ===
              allocation.paycheckId
          );

        if (!matchingWindow) {
          return null;
        }

        return {
          payWindowId:
            matchingWindow.id,

          amount:
            Math.max(
              0,
              Number(
                allocation.amount || 0
              )
            ),
        };
      })
      .filter(
        (
          allocation
        ): allocation is {
          payWindowId: string;
          amount: number;
        } =>
          allocation !== null &&
          allocation.amount > 0
      );

  const amountFunded =
    allocations.reduce(
      (
        total,
        allocation
      ) =>
        total +
        allocation.amount,
      0
    );

    const amountRemaining =
    isPaid
      ? 0
      : Math.max(
          0,
          amountDue -
            amountFunded
        );
  
  return {
    billId: bill.id,
    billName: bill.name,
    amountDue,
  
    amountFunded:
      isPaid
        ? amountDue
        : amountFunded,
  
    amountRemaining,
  
    isFullyFunded:
      isPaid ||
      amountRemaining <= 0.01,
  
    allocations,
  };
}