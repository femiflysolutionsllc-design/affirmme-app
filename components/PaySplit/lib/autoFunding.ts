import type {
  BillItem,
  PaycheckAllocation,
} from "./paysplitStore";

import type {
  PayWindow,
} from "./PaycheckPlannerStore";

import {
  getBillAmountForPayWindow,
} from "./billAllocation";

import {
  getSafeFundingAvailable,
  getProtectedReserveForWindow,
} from "./spendingReserve";

export type AutoFundingAllocation = {
  payWindowId: string;

  payWindowLabel: string;

  amount: number;

  availableBeforeFunding: number;
};

export type AutoFundingRecommendation = {
  billId: string;

  billName: string;

  dueDateISO: string;

  amountDue: number;

  amountAlreadyFunded: number;

  amountStillNeeded: number;

  recommendedAllocations:
    AutoFundingAllocation[];

  recommendedTotal: number;

  shortfall: number;

  isFullyFundable: boolean;
};

function safeMoney(
  value: unknown
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? Math.max(
        0,
        number
      )
    : 0;
}

/**
 * Calculates how much income inside a
 * pay window is actually available
 * ON OR BEFORE the bill's due date.
 */
function getIncomeAvailableByDueDate(
  window: PayWindow,
  dueDateISO: string
) {
  return window.paychecks
    .filter(
      (paycheck) =>
        paycheck.dateISO <=
        dueDateISO
    )
    .reduce(
      (
        total,
        paycheck
      ) =>
        total +
        safeMoney(
          paycheck.amount
        ),
      0
    );
}

/**
 * Existing reservations already using
 * money from this pay window.
 *
 * The target bill is excluded so its
 * existing allocation is not counted
 * twice while calculating availability.
 */
 function getReservedFromWindow(
  window: PayWindow,
  bills: BillItem[]
) {
  return bills.reduce(
    (
      total,
      bill
    ) =>
      total +
      getBillAmountForPayWindow(
        bill,
        window.id
      ),
    0
  );
}

/**
 * Creates a recommendation only.
 *
 * This function DOES NOT save anything.
 */
export function recommendBillFunding({
  bill,
  dueDateISO,
  payWindows,
  bills,
}: {
  bill: BillItem;

  dueDateISO: string;

  payWindows: PayWindow[];

  bills: BillItem[];
}): AutoFundingRecommendation {
  const amountDue =
    safeMoney(
      bill.amount
    );

  const amountAlreadyFunded =
    payWindows.reduce(
      (
        total,
        window
      ) =>
        total +
        getBillAmountForPayWindow(
          bill,
          window.id
        ),
      0
    );

  const amountStillNeeded =
    Math.max(
      0,
      amountDue -
        amountAlreadyFunded
    );

  const usableWindows =
    payWindows
      .map(
        (window) => {
          const incomeByDueDate =
            getIncomeAvailableByDueDate(
              window,
              dueDateISO
            );

            const alreadyReserved =
            getReservedFromWindow(
              window,
              bills
            );

            const availableBeforeReserve =
            Math.max(
              0,
              incomeByDueDate -
                alreadyReserved
            );
          
          const available =
            getSafeFundingAvailable({
              window,
              availableBeforeReserve,
            });
          
          const protectedReserve =
            getProtectedReserveForWindow(
              window
            );
          
          return {
            window,
            available,
            availableBeforeReserve,
            protectedReserve,
          };
        }
      )
      .filter(
        (item) =>
          item.available >
          0
      )
      /*
       * Latest usable window first.
       */
      .sort(
        (
          first,
          second
        ) =>
          second.window.endDateISO.localeCompare(
            first.window.endDateISO
          )
      );

  let stillNeeded =
    amountStillNeeded;

  const recommendedAllocations:
    AutoFundingAllocation[] =
    [];

  for (
    const item of
      usableWindows
  ) {
    if (
      stillNeeded <=
      0.01
    ) {
      break;
    }

    const allocationAmount =
      Math.min(
        stillNeeded,
        item.available
      );

    if (
      allocationAmount <=
      0
    ) {
      continue;
    }

    recommendedAllocations.push(
      {
        payWindowId:
          item.window.id,

        payWindowLabel:
          item.window.label,

        amount:
          allocationAmount,

        availableBeforeFunding:
          item.available,
      }
    );

    stillNeeded =
      Math.max(
        0,
        stillNeeded -
          allocationAmount
      );
  }

  const recommendedTotal =
    recommendedAllocations.reduce(
      (
        total,
        allocation
      ) =>
        total +
        allocation.amount,
      0
    );

  const shortfall =
    Math.max(
      0,
      amountStillNeeded -
        recommendedTotal
    );

  return {
    billId:
      bill.id,

    billName:
      bill.name,

    dueDateISO,

    amountDue,

    amountAlreadyFunded,

    amountStillNeeded,

    recommendedAllocations,

    recommendedTotal,

    shortfall,

    isFullyFundable:
      shortfall <=
      0.01,
  };
}

/**
 * Takes a recommendation and builds
 * the bill's new funding allocations.
 *
 * IMPORTANT:
 * This still DOES NOT save anything.
 *
 * It only returns an updated BillItem.
 * The caller decides when to persist it.
 */
export function applyFundingRecommendationToBill({
  bill,
  recommendation,
}: {
  bill: BillItem;

  recommendation:
    AutoFundingRecommendation;
}): BillItem {
  /*
   * Safety check:
   * Never apply a recommendation that
   * belongs to a different bill.
   */
  if (
    recommendation.billId !==
    bill.id
  ) {
    return bill;
  }

  /*
   * Keep all existing allocations.
   *
   * Older code still calls the field
   * paycheckId, but these IDs may now
   * represent Pay Window IDs.
   */
  const allocationMap =
    new Map<
      string,
      PaycheckAllocation
    >();

  for (
    const allocation of
      bill.paycheckAllocations ??
      []
  ) {
    const paycheckId =
      String(
        allocation.paycheckId ||
          ""
      );

    if (
      !paycheckId
    ) {
      continue;
    }

    allocationMap.set(
      paycheckId,
      {
        ...allocation,

        paycheckId,

        amount:
          safeMoney(
            allocation.amount
          ),
      }
    );
  }

  /*
   * Add the recommended amount to each
   * existing window allocation instead
   * of replacing it.
   *
   * Example:
   *
   * Existing:
   * Aug Window = $50
   *
   * Recommendation:
   * Sep Window = $50
   *
   * Result:
   * Aug = $50
   * Sep = $50
   */
  for (
    const recommended of
      recommendation.recommendedAllocations
  ) {
    const existing =
      allocationMap.get(
        recommended.payWindowId
      );

    const nextAmount =
      safeMoney(
        existing?.amount
      ) +
      safeMoney(
        recommended.amount
      );

    allocationMap.set(
      recommended.payWindowId,
      {
        paycheckId:
          recommended.payWindowId,

        amount:
          nextAmount,

        paid:
          existing?.paid,

        paidAt:
          existing?.paidAt,
      }
    );
  }

  const nextAllocations =
    Array.from(
      allocationMap.values()
    ).filter(
      (allocation) =>
        allocation.amount >
        0
    );

  return {
    ...bill,

    /*
     * Once we have explicit allocations,
     * paycheckAllocations becomes the
     * source of truth.
     */
    paycheckAllocations:
      nextAllocations,

    /*
     * Clear the older single-window field
     * when funding spans multiple windows.
     */
    assignedPaycheckId:
      nextAllocations.length ===
      1
        ? nextAllocations[0]
            .paycheckId
        : undefined,

    updatedAt:
      Date.now(),
  };
}