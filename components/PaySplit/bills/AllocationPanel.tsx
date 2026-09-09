"use client";

import React from "react";
import CurrencyInput from "../paysplit-ui/CurrencyInput";

import type {
  BillItem,
  PaycheckAllocation,
} from "../lib/paysplitStore";

import type {
  PlannerPaycheck,
  PayWindow,
} from "../lib/PaycheckPlannerStore";

import {
  getBillAllocations,
} from "../lib/billAllocation";

type Assign = "A" | "B" | "both";

type BillWithAssign = BillItem & {
  assignTo?: Assign;
};

type AllocationPanelProps = {
  bill: BillWithAssign;

  paychecks: PlannerPaycheck[];

  payWindows?: PayWindow[];

  onUpdateBill: (
    id: string,
    patch: Partial<BillWithAssign>
  ) => void;

  onToggleAllocationPaid: (
    bill: BillWithAssign,
    allocationId: string
  ) => void;
};


function money(value: number) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeValue);
}

function getPaycheckLabel(
  paycheck: PlannerPaycheck
) {
  const date = new Date(
    `${paycheck.payDate}T00:00:00`
  );

  const formattedDate = Number.isNaN(
    date.getTime()
  )
    ? paycheck.payDate
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);

  return `${paycheck.name} • ${formattedDate}`;
}

function getPayWindowLabel(
  payWindow: PayWindow
) {
  return payWindow.label;
}

function getAllocationAmount(
  allocations: PaycheckAllocation[],
  paycheckId: string
) {
  return (
    allocations.find(
      (allocation) =>
        allocation.paycheckId === paycheckId
    )?.amount ?? 0
  );
}


function updatePaycheckAllocation(
  bill: BillWithAssign,
  paycheckId: string,
  amount: number
): PaycheckAllocation[] {
  const currentAllocations =
    getBillAllocations(bill);

  const safeAmount = Math.max(
    0,
    Number(amount || 0)
  );

  const existingAllocation =
    currentAllocations.find(
      (allocation) =>
        allocation.paycheckId === paycheckId
    );

  const nextAllocations = existingAllocation
    ? currentAllocations.map((allocation) =>
        allocation.paycheckId === paycheckId
          ? {
              ...allocation,
              amount: safeAmount,
            }
          : allocation
      )
    : [
        ...currentAllocations,
        {
          paycheckId,
          amount: safeAmount,
          paid: false,
          paidAt: "",
        },
      ];

  return nextAllocations.filter(
    (allocation) =>
      Number(allocation.amount || 0) > 0
  );
}

function formatScheduleDate(value?: string) {
  if (!value) {
    return "Date not selected";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "Date not selected";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}


export default function AllocationPanel({
  bill,
  paychecks,
  payWindows = [],
  onUpdateBill,
  onToggleAllocationPaid,
}: AllocationPanelProps) {
  const savedAllocations =
    getBillAllocations(bill);

  const [isEditing, setIsEditing] =
    React.useState(false);

  const [draftAllocations, setDraftAllocations] =
    React.useState<PaycheckAllocation[]>(
      savedAllocations
    );

  React.useEffect(() => {
    if (!isEditing) {
      setDraftAllocations(
        getBillAllocations(bill)
      );
    }
  }, [bill, isEditing]);

  const visibleAllocations = isEditing
    ? draftAllocations
    : savedAllocations;

    const todayISO = new Date()
    .toISOString()
    .slice(0, 10);
  
  const assignedPaycheckIds = new Set(
    visibleAllocations.map(
      (allocation) => allocation.paycheckId
    )
  );
  
  const assignedPaychecks =
  paychecks.filter(
    (paycheck) =>
      assignedPaycheckIds.has(
        paycheck.id
      )
  );

const assignedPayWindows =
  payWindows.filter(
    (payWindow) =>
      assignedPaycheckIds.has(
        payWindow.id
      )
  );

const nextUpcomingPaychecks =
  paychecks
    .filter(
      (paycheck) =>
        paycheck.payDate >=
          todayISO &&
        !assignedPaycheckIds.has(
          paycheck.id
        )
    )
    .sort(
      (first, second) =>
        first.payDate.localeCompare(
          second.payDate
        )
    )
    .slice(0, 2);

  const allocatedTotal =
    visibleAllocations.reduce(
      (total, allocation) =>
        total +
        Number(allocation.amount || 0),
      0
    );

  const paidTotal =
    savedAllocations.reduce(
      (total, allocation) =>
        total +
        (allocation.paid
          ? Number(allocation.amount || 0)
          : 0),
      0
    );

  const remainingTotal = Math.max(
    0,
    Number(bill.amount || 0) - paidTotal
  );

  const difference =
    Number(bill.amount || 0) -
    allocatedTotal;

  const fullyAllocated =
    Math.abs(difference) <= 0.01;

  function updateDraftAmount(
    paycheckId: string,
    amount: number
  ) {
    const safeAmount = Math.max(
      0,
      Number(amount || 0)
    );

    setDraftAllocations(
      (currentAllocations) => {
        const existing =
          currentAllocations.find(
            (allocation) =>
              allocation.paycheckId ===
              paycheckId
          );

        if (existing) {
          return currentAllocations.map(
            (allocation) =>
              allocation.paycheckId ===
              paycheckId
                ? {
                    ...allocation,
                    amount: safeAmount,
                  }
                : allocation
          );
        }

        return [
          ...currentAllocations,
          {
            paycheckId,
            amount: safeAmount,
            paid: false,
            paidAt: "",
          },
        ];
      }
    );
  }

  function saveAllocations() {
    const cleanedAllocations =
      draftAllocations.filter(
        (allocation) =>
          Number(allocation.amount || 0) > 0
      );

    onUpdateBill(bill.id, {
      assignedPaycheckId: undefined,
      paycheckAllocations:
        cleanedAllocations,
    });

    setIsEditing(false);
  }

  function cancelEditing() {
    setDraftAllocations(
      getBillAllocations(bill)
    );

    setIsEditing(false);
  }

  return (
    <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] shadow-[4px_4px_0px_black]">
      <div className="grid gap-5 border-b-[3px] border-black p-5 lg:grid-cols-[220px_1fr]">
        <div className="lg:border-r-[2px] lg:border-slate-700 lg:pr-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">
                💰 Paycheck Allocation
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-300">
                {visibleAllocations.length}{" "}
                paycheck
                {visibleAllocations.length === 1
                  ? ""
                  : "s"}{" "}
                • {money(allocatedTotal)} assigned
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Paid
              </p>

              <p className="mt-1 text-2xl font-black text-emerald-300">
                {money(paidTotal)}
              </p>
            </div>

            <div className="border-t-2 border-slate-700 pt-4">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                Remaining
              </p>

              <p
                className={
                  "mt-1 text-2xl font-black " +
                  (remainingTotal > 0
                    ? "text-amber-300"
                    : "text-emerald-300")
                }
              >
                {money(remainingTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white">
                Assign This Bill to Paychecks
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                The assigned total should equal{" "}
                {money(
                  Number(bill.amount || 0)
                )}
                .
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() =>
                  setIsEditing(true)
                }
                className="w-fit rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
              >
                ✏️ Edit Allocation
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveAllocations}
                  className="rounded-xl border-[3px] border-black bg-[#22C55E] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
                >
                  ✓ Save
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border-[3px] border-black bg-slate-300 px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-3">

          {assignedPaychecks.length === 0 &&
  assignedPayWindows.length === 0 &&
  !isEditing && (
    <div className="rounded-2xl border-[2px] border-dashed border-slate-600 bg-[#111933] p-5 text-center">
      <p className="font-black text-white">
        No allocations assigned
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-400">
        This bill does not have any saved paycheck or pay window allocations.
      </p>
    </div>
  )}

{assignedPayWindows.map(
  (payWindow) => {
    const allocation =
      visibleAllocations.find(
        (item) =>
          item.paycheckId ===
          payWindow.id
      );

    const amount = Number(
      allocation?.amount || 0
    );

    return (
      <div
        key={payWindow.id}
        className="grid gap-4 rounded-2xl border-[2px] border-black bg-[#111933] p-4 md:grid-cols-[minmax(0,1fr)_170px_auto] md:items-center"
      >
        <div className="min-w-0">
          <p className="font-black text-white">
            💰 {getPayWindowLabel(
              payWindow
            )}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            Pay Window Allocation
          </p>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
            Assigned
          </p>

          <p className="text-lg font-black text-emerald-300">
            {money(amount)}
          </p>
        </div>

        <div className="md:text-right">
          {amount > 0 && (
            <>
              <button
  type="button"
  onClick={() =>
    onToggleAllocationPaid(
      bill,
      payWindow.id
    )
  }
  className={
    "inline-flex rounded-full border-[2px] border-black px-3 py-1 text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_black] " +
    (allocation?.paid
      ? "bg-[#22C55E]"
      : "bg-[#FACC15]")
  }
>
  {allocation?.paid
    ? "✅ Paid"
    : "✓ Mark Paid"}
</button>

              {allocation?.paidAt && (
                <p className="mt-2 text-[11px] font-semibold text-slate-400">
                  Paid{" "}
                  {formatScheduleDate(
                    allocation.paidAt
                  )}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
)}

{(
  isEditing
    ? [
        ...assignedPaychecks,
        ...nextUpcomingPaychecks,
      ]
    : assignedPaychecks
).map((paycheck) => {
              const allocation =
                visibleAllocations.find(
                  (item) =>
                    item.paycheckId ===
                    paycheck.id
                );

              const amount = Number(
                allocation?.amount || 0
              );

              return (
                <div
                  key={paycheck.id}
                  className="grid gap-4 rounded-2xl border-[2px] border-black bg-[#111933] p-4 md:grid-cols-[minmax(0,1fr)_170px_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-black text-white">
                      {getPaycheckLabel(
                        paycheck
                      )}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Paycheck amount:{" "}
                      {money(paycheck.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                      Assigned
                    </p>

                    {isEditing ? (
                      <CurrencyInput
                        value={amount}
                        onChange={(value) =>
                          updateDraftAmount(
                            paycheck.id,
                            value
                          )
                        }
                        className="w-full rounded-xl border-[2px] border-black bg-[#080A16] p-3 text-sm text-slate-100"
                      />
                    ) : (
                      <p className="text-lg font-black text-emerald-300">
                        {money(amount)}
                      </p>
                    )}
                  </div>

                  <div className="md:text-right">
                    {amount > 0 ? (
                      <>
                        <button
  type="button"
  onClick={() =>
    onToggleAllocationPaid(
      bill,
      paycheck.id
    )
  }
  className={
    "inline-flex rounded-full border-[2px] border-black px-3 py-1 text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_black] " +
    (allocation?.paid
      ? "bg-[#22C55E]"
      : "bg-[#FACC15]")
  }
>
  {allocation?.paid
    ? "✅ Paid"
    : "✓ Mark Paid"}
</button>

                        {allocation?.paidAt && (
                          <p className="mt-2 text-[11px] font-semibold text-slate-400">
                            Paid{" "}
                            {formatScheduleDate(
                              allocation.paidAt
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        Not assigned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={
              "mt-5 flex flex-col gap-3 rounded-2xl border-[3px] border-black p-4 text-black sm:flex-row sm:items-center sm:justify-between " +
              (fullyAllocated
                ? "bg-[#22C55E]"
                : "bg-[#FACC15]")
            }
          >
            <div>
              <p className="text-sm font-black uppercase">
                {fullyAllocated
                  ? "✓ Fully Allocated"
                  : difference > 0
                    ? "Amount Left to Assign"
                    : "Over Assigned"}
              </p>

              <p className="mt-1 text-xs font-semibold">
                {fullyAllocated
                  ? "The assigned total matches the bill amount."
                  : "Adjust the paycheck amounts before saving."}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-[10px] font-black uppercase">
                Difference
              </p>

              <p className="text-xl font-black">
                {money(
                  Math.abs(difference)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}