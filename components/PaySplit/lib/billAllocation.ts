import type {
  BillItem,
  PaycheckAllocation,
} from "./paysplitStore";

export type LegacyAssignment =
  | "A"
  | "B"
  | "both";

export type AllocatableBill =
  BillItem & {
    assignTo?: LegacyAssignment;
  };

/**
 * Generic allocation target.
 *
 * This can now be:
 *
 * Individual paycheck:
 * incomeSourceId_2026-08-29
 *
 * OR
 *
 * Pay window:
 * 2026-08-A
 * 2026-08-B
 *
 * We temporarily continue storing the value
 * inside PaycheckAllocation.paycheckId so we
 * do not break older PaySplit code.
 */
export function getBillAmountForTarget(
  bill: AllocatableBill,
  targetId: string
): number {
  if (!targetId) {
    return 0;
  }

  const allocation =
    bill.paycheckAllocations?.find(
      (item) =>
        item.paycheckId === targetId
    );

  if (allocation) {
    return Math.max(
      0,
      Number(
        allocation.amount || 0
      )
    );
  }

  /**
   * Legacy fallback for older bills
   * assigned directly to a paycheck.
   */
  if (
    bill.assignedPaycheckId ===
    targetId
  ) {
    return Math.max(
      0,
      Number(
        bill.amount || 0
      )
    );
  }

  return 0;
}

/**
 * Checks whether any amount from a bill
 * belongs to one allocation target.
 */
export function isBillAssignedToTarget(
  bill: AllocatableBill,
  targetId: string
): boolean {
  return (
    getBillAmountForTarget(
      bill,
      targetId
    ) > 0
  );
}

/**
 * PAYCHECK COMPATIBILITY WRAPPERS
 *
 * Existing components can continue using
 * these while we migrate the budgeting UI
 * toward pay-window allocation.
 */
export function getBillAmountForPaycheck(
  bill: AllocatableBill,
  paycheckId: string
): number {
  return getBillAmountForTarget(
    bill,
    paycheckId
  );
}

export function isBillAssignedToPaycheck(
  bill: AllocatableBill,
  paycheckId: string
): boolean {
  return isBillAssignedToTarget(
    bill,
    paycheckId
  );
}

/**
 * PAY WINDOW HELPERS
 */
export function getBillAmountForPayWindow(
  bill: AllocatableBill,
  payWindowId: string
): number {
  return getBillAmountForTarget(
    bill,
    payWindowId
  );
}

export function isBillAssignedToPayWindow(
  bill: AllocatableBill,
  payWindowId: string
): boolean {
  return isBillAssignedToTarget(
    bill,
    payWindowId
  );
}

/**
 * Returns all valid allocations
 * saved on a bill.
 */
export function getBillAllocations(
  bill: AllocatableBill
): PaycheckAllocation[] {
  return (
    bill.paycheckAllocations ?? []
  )
    .map(
      (allocation) => ({
        paycheckId:
          String(
            allocation.paycheckId ||
              ""
          ),

        amount:
          Math.max(
            0,
            Number(
              allocation.amount || 0
            )
          ),

        paid:
          Boolean(
            allocation.paid
          ),

        paidAt:
          allocation.paidAt ||
          "",
      })
    )
    .filter(
      (allocation) =>
        allocation.paycheckId &&
        allocation.amount > 0
    );
}

/**
 * Returns the total amount assigned
 * across all allocation targets.
 */
export function getAllocatedTotal(
  bill: AllocatableBill
): number {
  const allocations =
    getBillAllocations(
      bill
    );

  if (
    allocations.length > 0
  ) {
    return allocations.reduce(
      (
        total,
        allocation
      ) =>
        total +
        allocation.amount,
      0
    );
  }

  return bill.assignedPaycheckId
    ? Math.max(
        0,
        Number(
          bill.amount || 0
        )
      )
    : 0;
}

/**
 * Creates one allocation against
 * any supported target.
 *
 * Example:
 * 2026-08-B
 */
export function createSingleAllocation(
  targetId: string,
  amount: number
): PaycheckAllocation[] {
  if (!targetId) {
    return [];
  }

  return [
    {
      paycheckId:
        targetId,

      amount:
        Math.max(
          0,
          Number(
            amount || 0
          )
        ),
    },
  ];
}

/**
 * Creates a pay-window allocation.
 *
 * This is intentionally a wrapper around
 * createSingleAllocation so older data
 * structures remain compatible.
 */
export function createPayWindowAllocation(
  payWindowId: string,
  amount: number
): PaycheckAllocation[] {
  return createSingleAllocation(
    payWindowId,
    amount
  );
}

/**
 * Normalizes allocations and removes
 * blank or zero entries.
 */
export function normalizeAllocations(
  allocations?: PaycheckAllocation[]
): PaycheckAllocation[] {
  return (
    allocations ?? []
  )
    .map(
      (allocation) => ({
        paycheckId:
          String(
            allocation.paycheckId ||
              ""
          ),

        amount:
          Math.max(
            0,
            Number(
              allocation.amount || 0
            )
          ),

        paid:
          Boolean(
            allocation.paid
          ),

        paidAt:
          allocation.paidAt ||
          "",
      })
    )
    .filter(
      (allocation) =>
        allocation.paycheckId &&
        allocation.amount > 0
    );
}