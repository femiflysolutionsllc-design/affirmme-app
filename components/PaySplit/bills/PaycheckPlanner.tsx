'use client';

import React from 'react';

import SectionCard from '../paysplit-ui/SectionCard';
import GeneratedPaycheckCard from '../Components/GeneratedPaycheckCard';

import {
  isBillAssignedToPaycheck,
  isBillAssignedToPayWindow,
  getBillAmountForPayWindow,
  getBillAllocations,
} from "../lib/billAllocation";

import type { GeneratedPaycheck } from '../lib/incomeStore';

import type { BillItem } from '../lib/paysplitStore';

import type { PlannerPaycheck, PayWindow } from '../lib/PaycheckPlannerStore';

import { generateAllBillOccurrences } from '../lib/billSchedule';

import {
  matchBillOccurrencesToPayWindows,
  getScheduledBillsForWindow,
  getScheduledBillTotalForWindow,
  getBillFundingStatus,
} from '../lib/billWindowMatcher';

import {
  recommendBillFunding,
  type AutoFundingRecommendation,
} from '../lib/autoFunding';

import {
  loadPiggyBankGoals,
  getPiggyBankWindowTotals,
  PIGGY_BANK_UPDATED_EVENT,
  type PiggyBankGoal,
} from '../lib/piggyBankStore';

import {
  loadSpendingReserveSettings,
  SPENDING_RESERVE_UPDATED_EVENT,
  type SpendingReserveSettings,
} from '../lib/spendingReserve';

import {
  closePayWindow,
  loadClosedPayWindows,
  PAY_WINDOW_HISTORY_UPDATED_EVENT,
} from '../lib/payWindowHistory';

import {
  getPiggySaveForWindow,
  setPiggySaveForWindow,
  PIGGY_SAVE_UPDATED_EVENT,
} from "../lib/piggySaveStore";
/* ============================================
   TYPES
============================================ */

type AssignedBill = BillItem & {
  assignedPaycheckId?: string;
};

type PaycheckPlannerProps = {
  bills?: AssignedBill[];

  paychecks?: PlannerPaycheck[];

  payWindowA?: PayWindow | null;

  payWindowB?: PayWindow | null;

  allPayWindows?: PayWindow[];

  onApplyFundingRecommendation?: (
    billId: string,
    recommendation: AutoFundingRecommendation
  ) => void;

  onUpdateBillAllocation?: (
    billId: string,
    payWindowId: string,
    amount: number
  ) => void; 
};

type CloseActuals = {
  income: number;
  billsPaid: number;
  piggySaved: number;
  inYourPocket: number;
};

type PayWindowCalculations = {
  windowBills: AssignedBill[];
  billsAssigned: number;
  scheduledForWindow: any[];
  scheduledTotal: number;
  piggyBankRecommended: number;
  afterBills: number;
  protectedCushion: number;
  safeToSave: number;
  piggyBankAmount: number;
  inYourPocket: number;
  savedPiggyOverride: number | null;
requestedPiggySave: number;
upcomingBillReserve: number;
};

/* ============================================
   HELPERS
============================================ */

function getLocalTodayISO() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, '0');

  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function money(value: number) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(safeValue);
}

function formatPayDate(dateISO: string) {
  if (!dateISO) {
    return '';
  }

  const [year, month, day] = dateISO.split('-').map(Number);

  if (!year || !month || !day) {
    return dateISO;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

/* ============================================
   COMPONENT
============================================ */

export default function PaycheckPlanner({
  bills = [],
  paychecks = [],
  payWindowA = null,
  payWindowB = null,
  allPayWindows = [],
  onApplyFundingRecommendation,
  onUpdateBillAllocation,
}: PaycheckPlannerProps) {
  /* ============================================
     STATE
  ============================================ */

  const [isExpanded, setIsExpanded] = React.useState(true);

  const [closedPayWindows, setClosedPayWindows] = React.useState<any[]>([]);

  const [piggyGoals, setPiggyGoals] = React.useState<PiggyBankGoal[]>([]);

  const [spendingReserve, setSpendingReserve] =
    React.useState<SpendingReserveSettings>(() =>
      loadSpendingReserveSettings()
    );

  const [closingWindowId, setClosingWindowId] = React.useState<string | null>(
    null
  );

  const [closeActuals, setCloseActuals] = React.useState<CloseActuals>({
    income: 0,
    billsPaid: 0,
    piggySaved: 0,
    inYourPocket: 0,
  });

  const [
    editingPiggyWindowId,
    setEditingPiggyWindowId,
  ] = React.useState<string | null>(
    null
  );
  
  const [
    editingBillAllocationId,
    setEditingBillAllocationId,
  ] = React.useState<string | null>(
    null
  );

  const [
    manualAllocationDrafts,
    setManualAllocationDrafts,
  ] = React.useState<Record<string, string>>(
    {}
  );
  
  const [
    piggySaveVersion,
    setPiggySaveVersion,
  ] =
    React.useState(0);
  
  React.useEffect(() => {
    function refreshPiggySave() {
      setPiggySaveVersion(
        (current) =>
          current + 1
      );
    }
  
    window.addEventListener(
      PIGGY_SAVE_UPDATED_EVENT,
      refreshPiggySave
    );
  
    window.addEventListener(
      "storage",
      refreshPiggySave
    );
  
    return () => {
      window.removeEventListener(
        PIGGY_SAVE_UPDATED_EVENT,
        refreshPiggySave
      );
  
      window.removeEventListener(
        "storage",
        refreshPiggySave
      );
    };
  }, []);


  /* ============================================
     STORAGE LISTENERS
  ============================================ */

  React.useEffect(() => {
    function refresh() {
      setClosedPayWindows(loadClosedPayWindows());
    }

    refresh();

    window.addEventListener(PAY_WINDOW_HISTORY_UPDATED_EVENT, refresh);

    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(PAY_WINDOW_HISTORY_UPDATED_EVENT, refresh);

      window.removeEventListener('storage', refresh);
    };
  }, []);

  React.useEffect(() => {
    function refresh() {
      setPiggyGoals(loadPiggyBankGoals());
    }

    refresh();

    window.addEventListener(PIGGY_BANK_UPDATED_EVENT, refresh);

    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(PIGGY_BANK_UPDATED_EVENT, refresh);

      window.removeEventListener('storage', refresh);
    };
  }, []);

  React.useEffect(() => {
    function refresh() {
      setSpendingReserve(loadSpendingReserveSettings());
    }

    refresh();

    window.addEventListener(SPENDING_RESERVE_UPDATED_EVENT, refresh);

    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(SPENDING_RESERVE_UPDATED_EVENT, refresh);

      window.removeEventListener('storage', refresh);
    };
  }, []);

  /* ============================================
     PAYCHECK DATA
  ============================================ */

  const generatedPaychecks: GeneratedPaycheck[] = paychecks;

  const todayISO = getLocalTodayISO();

  const sortedPaychecks = [...generatedPaychecks].sort((first, second) =>
    first.dateISO.localeCompare(second.dateISO)
  );

  const upcomingPaychecks = sortedPaychecks.filter(
    (paycheck) => paycheck.dateISO >= todayISO
  );

  const archivedPaychecks = sortedPaychecks
    .filter((paycheck) => paycheck.dateISO < todayISO)
    .reverse();

    const activePaycheckIds = new Set(
      [payWindowA, payWindowB]
        .filter(
          (payWindow): payWindow is PayWindow =>
            Boolean(payWindow)
        )
        .flatMap((payWindow) =>
          payWindow.paychecks.map(
            (paycheck) => paycheck.id
          )
        )
    );
    
    const activePaychecks =
      upcomingPaychecks.filter(
        (paycheck) =>
          activePaycheckIds.has(
            paycheck.id
          )
      );
    
    const futurePaychecks =
      upcomingPaychecks.filter(
        (paycheck) =>
          !activePaycheckIds.has(
            paycheck.id
          )
      );

  /* ============================================
     BILL OCCURRENCES
  ============================================ */

  const firstPayWindow = allPayWindows.length > 0 ? allPayWindows[0] : null;

  const lastPayWindow =
    allPayWindows.length > 0 ? allPayWindows[allPayWindows.length - 1] : null;

  const scheduledBillOccurrences =
    firstPayWindow && lastPayWindow
      ? generateAllBillOccurrences(
          bills,
          new Date(`${firstPayWindow.startDateISO}T00:00:00`),
          new Date(`${lastPayWindow.endDateISO}T00:00:00`)
        )
      : [];

  const scheduledBills = matchBillOccurrencesToPayWindows(
    scheduledBillOccurrences,
    allPayWindows
  );

  const piggyTotals = getPiggyBankWindowTotals(piggyGoals);

  /* ============================================
     BILL ALLOCATION HELPERS
  ============================================ */

  function getActivePaychecksForWindow(
    payWindow: PayWindow
  ) {
    const windowPaycheckIds = new Set(
      payWindow.paychecks.map(
        (paycheck) => paycheck.id
      )
    );
  
    return activePaychecks.filter(
      (paycheck) =>
        windowPaycheckIds.has(
          paycheck.id
        )
    );
  }

  function getAssignedBills(paycheckId: string): AssignedBill[] {
    return bills.filter((bill) => isBillAssignedToPaycheck(bill, paycheckId));
  }

  function getAssignedTotal(paycheckId: string) {
    return getAssignedBills(paycheckId).reduce((total, bill) => {
      const allocation = bill.paycheckAllocations?.find(
        (item) => item.paycheckId === paycheckId
      );

      if (allocation) {
        return total + Number(allocation.amount || 0);
      }

      if (bill.assignedPaycheckId === paycheckId) {
        return total + Number(bill.amount || 0);
      }

      return total;
    }, 0);
  }

  function getBillsForPayWindow(payWindowId: string): AssignedBill[] {
    return bills.filter((bill) => isBillAssignedToPayWindow(bill, payWindowId));
  }

  function getPayWindowAssignedTotal(payWindowId: string) {
    return getBillsForPayWindow(payWindowId).reduce(
      (total, bill) => total + getBillAmountForPayWindow(bill, payWindowId),
      0
    );
  }

  /* ============================================
     PAY WINDOW CALCULATIONS
  ============================================ */

  function getPayWindowCalculations(
    payWindow: PayWindow
  ): PayWindowCalculations {
    const windowBills = getBillsForPayWindow(payWindow.id);

    const billsAssigned = getPayWindowAssignedTotal(payWindow.id);

    const scheduledForWindow = getScheduledBillsForWindow(
      scheduledBills,
      payWindow.id
    );

    const scheduledTotal = getScheduledBillTotalForWindow(
      scheduledBills,
      payWindow.id
    );

    const upcomingBillReserve =
  scheduledBills.reduce(
    (
      total,
      item: any
    ) => {
      const sourceBill =
        bills.find(
          (bill) =>
            bill.id ===
            item.billId
        );

      if (!sourceBill) {
        return total;
      }

      const fundingStatus =
        getBillFundingStatus(
          sourceBill,
          allPayWindows
        );

      if (
        fundingStatus.isFullyFunded
      ) {
        return total;
      }

      const recommendation =
        recommendBillFunding({
          bill: sourceBill,
          dueDateISO:
            item.dueDateISO,
          payWindows:
            allPayWindows,
          bills,
        });

      const allocationForThisWindow =
        recommendation
          .recommendedAllocations
          .find(
            (
              allocation
            ) =>
              allocation.payWindowId ===
              payWindow.id
          );

      if (
        !allocationForThisWindow
      ) {
        return total;
      }

      return (
        total +
        Number(
          allocationForThisWindow.amount ||
            0
        )
      );
    },
    0
  );

    const piggyBankRecommended =
      payWindow.half === 'A' ? piggyTotals.A : piggyTotals.B;

      const savedPiggyOverride =
      getPiggySaveForWindow(
        payWindow.id
      );
    
    const requestedPiggySave =
      savedPiggyOverride === null
        ? piggyBankRecommended
        : savedPiggyOverride;

    const afterBills = Math.max(
      0,
      Number(payWindow.totalIncome || 0) - billsAssigned
    );

    const protectedCushion = spendingReserve.enabled
      ? Math.max(0, Number(spendingReserve.minimumReservePerWindow || 0))
      : 0;

      const safeToSave =
      Math.max(
        0,
        afterBills -
          upcomingBillReserve -
          protectedCushion
      );

    const piggyBankAmount =
    Math.min(
      Math.max(
        0,
        Number(
          requestedPiggySave ||
            0
        )
      ),
      safeToSave
    );
    

    const inYourPocket = Math.max(0, afterBills - piggyBankAmount);

    return {
      windowBills,
      billsAssigned,
      scheduledForWindow,
      scheduledTotal,
      piggyBankRecommended,
      afterBills,
      protectedCushion,
      safeToSave,
      piggyBankAmount,
      inYourPocket,
      savedPiggyOverride,
requestedPiggySave,
upcomingBillReserve,
    };
  }

  /* ============================================
     CLOSE WINDOW ACTIONS
  ============================================ */

  function openCloseWindowReview(
    payWindow: PayWindow,
    calculations: PayWindowCalculations
  ) {
    const roundMoney = (value: number) =>
      Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

    setClosingWindowId(payWindow.id);

    setCloseActuals({
      income: roundMoney(payWindow.totalIncome),

      billsPaid: roundMoney(calculations.billsAssigned),

      piggySaved: roundMoney(calculations.piggyBankAmount),

      inYourPocket: roundMoney(calculations.inYourPocket),
    });
  }

  function handleCloseWindow(
    payWindow: PayWindow,
    calculations: PayWindowCalculations
  ) {
    closePayWindow({
      payWindowId: payWindow.id,

      payWindowLabel: payWindow.label,

      half: payWindow.half,

      startDateISO: payWindow.startDateISO,

      endDateISO: payWindow.endDateISO,

      plannedIncome: Number(payWindow.totalIncome || 0),

      plannedBills: calculations.billsAssigned,

      plannedPiggyBank: calculations.piggyBankAmount,

      plannedInYourPocket: calculations.inYourPocket,

      actualIncome: Math.max(0, Number(closeActuals.income || 0)),

      actualBillsPaid: Math.max(0, Number(closeActuals.billsPaid || 0)),

      actualPiggySaved: Math.max(0, Number(closeActuals.piggySaved || 0)),

      actualInYourPocket: Math.max(0, Number(closeActuals.inYourPocket || 0)),
    });

    setClosingWindowId(null);
  }

  /* ============================================
     PAY WINDOW CARD
  ============================================ */

  function renderPayWindow(payWindow: PayWindow, index: number) {
    const calculations = getPayWindowCalculations(payWindow);

    return (
      <div
        key={payWindow.id}
        className={
          'rounded-[24px] border-[3px] border-black p-4 shadow-[5px_5px_0px_black] ' +
          (index === 0 ? 'bg-[#1F4E78]' : 'bg-[#6B3FA0]')
        }
      >
        {/* HEADER */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white">
              {payWindow.half === 'A' ? '💰 Pay Window A' : '💰 Pay Window B'}
            </p>

            <p className="mt-1 text-sm font-bold text-blue-100">
              {payWindow.label}
            </p>
          </div>

          <span className="w-fit rounded-full border-2 border-black bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-black">
            {payWindow.paychecks.length} Income
            {payWindow.paychecks.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* TOTAL INCOME */}

        <div className="mt-4 rounded-xl border-2 border-black bg-[#080A16] p-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            Total Income
          </p>

          <p className="mt-1 text-2xl font-black text-white">
            {money(payWindow.totalIncome)}
          </p>
        </div>

        {/* PAYCHECKS */}

        <div className="mt-3 space-y-2">
          {payWindow.paychecks.map((paycheck) => (
            <div
              key={paycheck.id}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-[#111933] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase text-white">
                  {paycheck.incomeSourceName}
                </p>

                <p className="text-[10px] font-semibold text-slate-400">
                  {formatPayDate(paycheck.dateISO)}
                </p>
              </div>

              <p className="shrink-0 text-sm font-black text-emerald-300">
                {money(paycheck.amount)}
              </p>
            </div>
          ))}
        </div>

        {/* SCHEDULED BILLS */}

{calculations.scheduledForWindow.length > 0 && (
  <div className="mt-3 rounded-xl border-2 border-dashed border-blue-300 bg-[#111933] p-4">
    <p className="text-[10px] font-black uppercase tracking-wide text-blue-200">
      📅 Scheduled Bill Occurrences
    </p>

    <div className="mt-3 space-y-2">
      {calculations.scheduledForWindow.map((item: any) => {
        const sourceBill = bills.find(
          (bill) => bill.id === item.billId
        );

        const fundingStatus = sourceBill
          ? getBillFundingStatus(
              sourceBill,
              allPayWindows
            )
          : null;

        const recommendation = sourceBill
          ? recommendBillFunding({
              bill: sourceBill,
              dueDateISO: item.dueDateISO,
              payWindows: allPayWindows,
              bills,
            })
          : null;

        return (
          <div
            key={item.occurrenceId}
            className="rounded-xl border-2 border-black bg-[#080A16] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">
                  {item.billName}
                </p>

                <p className="text-[10px] font-black uppercase text-rose-400">
  🔴 Due {formatPayDate(item.dueDateISO)}
</p>
              </div>

              <p className="shrink-0 text-xs font-black text-amber-300">
                {money(item.amount)}
              </p>
            </div>

            {fundingStatus && (
              <div className="mt-3 border-t border-slate-700 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Funded
                  </span>

                  <span className="text-xs font-black text-emerald-300">
                    {money(
                      fundingStatus.amountFunded
                    )}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    Remaining
                  </span>

                  <span
                    className={
                      "text-xs font-black " +
                      (fundingStatus.isFullyFunded
                        ? "text-emerald-300"
                        : "text-rose-300")
                    }
                  >
                    {money(
                      fundingStatus.amountRemaining
                    )}
                  </span>
                </div>

                <p
                  className={
                    "mt-2 text-[10px] font-black uppercase " +
                    (fundingStatus.isFullyFunded
                      ? "text-emerald-300"
                      : "text-rose-300")
                  }
                >
                  {fundingStatus.isFullyFunded
                    ? "✅ Fully Funded"
                    : "⚠️ Needs Funding"}
                </p>
              </div>
            )}

            {sourceBill &&
              recommendation &&
              recommendation.amountStillNeeded >
                0.01 && (
                <div className="mt-3 rounded-xl border-2 border-black bg-[#16245f] p-3">
                  <p className="text-[10px] font-black uppercase text-blue-200">
                    ✨ PaySplit Recommendation
                  </p>

                  {recommendation.recommendedAllocations.map(
                    (allocation) => (
                      <div
                        key={
                          allocation.payWindowId
                        }
                        className="mt-2 flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-bold text-white">
                          {
                            allocation.payWindowLabel
                          }
                        </span>

                        <span className="text-xs font-black text-emerald-300">
                          {money(
                            allocation.amount
                          )}
                        </span>
                      </div>
                    )
                  )}

                  {recommendation
                    .recommendedAllocations
                    .length === 0 && (
                    <p className="mt-2 text-xs font-bold text-rose-300">
                      No available income arrives before this bill is due.
                    </p>
                  )}

                  {recommendation.shortfall >
                    0.01 && (
                    <p className="mt-2 text-xs font-black text-rose-300">
                      Still short:{" "}
                      {money(
                        recommendation.shortfall
                      )}
                    </p>
                  )}

<div className="mt-3 flex gap-2">
  {onApplyFundingRecommendation && (
    <button
      type="button"
      onClick={() =>
        onApplyFundingRecommendation(
          sourceBill.id,
          recommendation
        )
      }
      className="flex-1 rounded-xl border-[3px] border-black bg-[#F43F7A] px-3 py-2 text-[10px] font-black uppercase text-white shadow-[3px_3px_0px_black]"
    >
      {recommendation.recommendedTotal > 0.01
        ? recommendation.isFullyFundable
          ? "✨ Use Recommendation"
          : "💰 Use Available"
        : "✨ Apply Recommendation"}
    </button>
  )}

  <button
    type="button"
    onClick={() =>
      setEditingBillAllocationId(
        editingBillAllocationId ===
          sourceBill.id
          ? null
          : sourceBill.id
      )
    }
    className="flex-1 rounded-xl border-[3px] border-black bg-[#60A5FA] px-3 py-2 text-[10px] font-black uppercase text-black shadow-[3px_3px_0px_black]"
  >
    {editingBillAllocationId ===
    sourceBill.id
      ? "▲ Close"
      : "✏️ Manual"}
  </button>
</div>

{editingBillAllocationId ===
  sourceBill.id &&
  (() => {
    const billTotal = Math.max(
      0,
      Number(sourceBill.amount || 0)
    );

    const totalAllocated =
      allPayWindows.reduce(
        (total, window) =>
          total +
          getBillAmountForPayWindow(
            sourceBill,
            window.id
          ),
        0
      );

    const remainingToAllocate =
      Math.max(
        0,
        billTotal - totalAllocated
      );

                   return (
                    <div className="mt-3 rounded-xl border-2 border-black bg-[#080A16] p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-blue-200">
                        ✏️ Manual Allocation
                      </p>

                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        Choose how much of this bill should come from each pay window.
                      </p>

                      <div className="mt-3 rounded-xl border-2 border-black bg-[#111933] px-3 py-3">
  <div className="grid grid-cols-3 gap-2 text-center">
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400">
        Bill
      </p>

      <p className="mt-1 text-xs font-black text-white">
        {money(billTotal)}
      </p>
    </div>

    <div className="border-x border-slate-700">
      <p className="text-[9px] font-black uppercase text-slate-400">
        Allocated
      </p>

      <p className="mt-1 text-xs font-black text-emerald-300">
        {money(totalAllocated)}
      </p>
    </div>

    <div>
      <p className="text-[9px] font-black uppercase text-slate-400">
        Remaining
      </p>

      <p
        className={
          "mt-1 text-xs font-black " +
          (remainingToAllocate > 0
            ? "text-amber-300"
            : "text-emerald-300")
        }
      >
        {money(remainingToAllocate)}
      </p>
    </div>
  </div>
</div>

                      <div className="mt-3 space-y-3">
                        {allPayWindows.map(
                          (
                            manualWindow
                          ) => {
                            const currentAmount =
                              getBillAmountForPayWindow(
                                sourceBill,
                                manualWindow.id
                              );
                              const draftKey =
                              `${sourceBill.id}__${manualWindow.id}`;
                            
                            const draftValue =
                              manualAllocationDrafts[draftKey] ??
                              String(currentAmount);
                            
                            return (
                              <div
                                key={manualWindow.id}
                                className="rounded-xl border-2 border-black bg-[#111933] p-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-white">
                                      {manualWindow.label}
                                    </p>
                            
                                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                      Current allocation:{" "}
                                      {money(currentAmount)}
                                    </p>
                                  </div>
                                </div>
                            
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="flex flex-1 items-center rounded-xl border-2 border-black bg-[#080A16] px-3">
                                    <span className="text-sm font-black text-slate-400">
                                      $
                                    </span>
                            
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={draftValue}
                                      onChange={(event) =>
                                        setManualAllocationDrafts(
                                          (current) => ({
                                            ...current,
                                            [draftKey]:
                                              event.target.value,
                                          })
                                        )
                                      }
                                      className="w-full bg-transparent px-2 py-2 text-sm font-black text-white outline-none"
                                    />
                                  </div>
                            
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const amount =
                                      Math.max(
                                        0,
                                        Number(
                                          manualAllocationDrafts[
                                            draftKey
                                          ] ??
                                            currentAmount
                                        )
                                      );
                                    
                                    if (!Number.isFinite(amount)) {
                                      window.alert(
                                        "Please enter a valid dollar amount."
                                      );
                                    
                                      return;
                                    }
                                    
                                    /*
                                     * Calculate how much is allocated
                                     * everywhere EXCEPT the window
                                     * currently being edited.
                                     */
                                    const allocatedElsewhere =
                                      Math.max(
                                        0,
                                        totalAllocated -
                                          currentAmount
                                      );
                                    
                                    const newAllocatedTotal =
                                      allocatedElsewhere +
                                      amount;
                                    
                                    /*
                                     * Never allow manual allocations
                                     * to exceed the bill total.
                                     */
                                    if (
                                      newAllocatedTotal >
                                      billTotal + 0.01
                                    ) {
                                      const maximumForThisWindow =
                                        Math.max(
                                          0,
                                          billTotal -
                                            allocatedElsewhere
                                        );
                                    
                                      window.alert(
                                        `This would allocate more than the bill total.\n\n` +
                                          `Bill Total: ${money(billTotal)}\n` +
                                          `Already Allocated Elsewhere: ${money(allocatedElsewhere)}\n` +
                                          `Maximum For This Window: ${money(maximumForThisWindow)}`
                                      );
                                    
                                      return;
                                    }
                                    
                                    onUpdateBillAllocation?.(
                                      sourceBill.id,
                                      manualWindow.id,
                                      amount
                                    );
                                    }}
                                    className="rounded-xl border-[3px] border-black bg-[#F43F7A] px-3 py-2 text-[10px] font-black uppercase text-white shadow-[3px_3px_0px_black]"
                                  >
                                    💾 Save
                                  </button>
                                </div>
                              </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        );
                      })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
      
            <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Scheduled Total
              </span>
      
              <span className="text-sm font-black text-white">
                {money(
                  calculations.scheduledTotal
                )}
              </span>
            </div>                                           
  </div>
)}

        {/* BILLS ASSIGNED */}

        <div className="mt-4 rounded-xl border-2 border-black bg-[#080A16] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">
                🧾 Bills Assigned
              </p>

              <p className="mt-1 text-lg font-black text-rose-300">
                -{money(calculations.billsAssigned)}
              </p>
            </div>

            <span className="rounded-full border-2 border-black bg-[#FACC15] px-3 py-1 text-[10px] font-black text-black">
              {calculations.windowBills.length} Bill
              {calculations.windowBills.length === 1 ? '' : 's'}
            </span>
          </div>

          {calculations.windowBills.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-slate-700 pt-3">
              {calculations.windowBills.map((bill) => {
  const allocation =
    getBillAllocations(bill).find(
      (item) =>
        item.paycheckId === payWindow.id
    );

  const allocationAmount =
    getBillAmountForPayWindow(
      bill,
      payWindow.id
    );

  const isPaid =
    Boolean(allocation?.paid);

  return (
    <div
      key={bill.id}
      className="flex items-center justify-between gap-3"
    >
      <div>
        <p className="text-xs font-bold text-white">
          {bill.name}
        </p>

        <p className="text-[10px] text-slate-400">
          {bill.category || "Bill"}
        </p>

        <p
          className={
            "mt-1 text-[10px] font-black uppercase " +
            (isPaid
              ? "text-emerald-300"
              : "text-amber-300")
          }
        >
          {isPaid
            ? "✅ Paid"
            : "🟡 Allocated"}
        </p>

        {isPaid &&
          allocation?.paidAt && (
            <p className="mt-1 text-[10px] font-semibold text-slate-400">
              Paid{" "}
              {formatPayDate(
                allocation.paidAt
              )}
            </p>
          )}
      </div>

      <div className="text-right">
        <p className="text-xs font-black text-rose-300">
          -{money(allocationAmount)}
        </p>

        <p
          className={
            "mt-1 text-[10px] font-black uppercase " +
            (isPaid
              ? "text-emerald-300"
              : "text-amber-300")
          }
        >
          {isPaid
            ? "Paid"
            : "Allocated"}
        </p>
      </div>
    </div>
  );
})}
            </div>
          )}
        </div>

       {/* PIGGY SAVE */}

<div className="mt-3 rounded-xl border-2 border-black bg-[#111933] p-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-[10px] font-black uppercase tracking-wide text-pink-300">
        🐷 Piggy Save
      </p>

      <p className="mt-1 text-lg font-black text-pink-300">
        -{money(
          calculations.piggyBankAmount
        )}
      </p>
    </div>

    <span className="w-fit rounded-full border-2 border-black bg-[#F43F7A] px-3 py-1 text-[10px] font-black uppercase text-white">
      Savings
    </span>
  </div>

  {/* COLLAPSED / EDIT CONTROL */}

<div className="mt-3 flex items-center justify-between gap-3">
  <div>
    <p className="text-[10px] font-black uppercase text-slate-400">
      Recommended
    </p>

    <p className="mt-1 text-xs font-black text-emerald-300">
      {money(
        calculations.piggyBankRecommended
      )}
    </p>
  </div>

  <button
    type="button"
    onClick={() =>
      setEditingPiggyWindowId(
        editingPiggyWindowId ===
          payWindow.id
          ? null
          : payWindow.id
      )
    }
    className="rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
  >
    {editingPiggyWindowId ===
    payWindow.id
      ? "▲ Close"
      : "✏️ Edit"}
  </button>
</div>

{/* EXPANDED PIGGY SAVE CONTROLS */}

{editingPiggyWindowId ===
  payWindow.id && (
  <>
    <div className="mt-4 rounded-xl border-2 border-black bg-[#080A16] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase text-slate-400">
          Recommended
        </span>

    
        <span className="text-xs font-black text-emerald-300">
          {money(
            calculations.piggyBankRecommended
          )}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase text-slate-400">
          Current Piggy Save
        </span>

        <span className="text-xs font-black text-pink-300">
          {money(
            calculations.requestedPiggySave
          )}
        </span>
      </div>

      {calculations.savedPiggyOverride !==
        null && (
        <p className="mt-2 text-[10px] font-black uppercase text-amber-300">
          ✏️ Custom amount set for this pay window
        </p>
      )}
    </div>

    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => {
          const raw =
            window.prompt(
              "How much would you like to Piggy Save from this pay window?",
              String(
                calculations.requestedPiggySave
              )
            );

          if (raw === null) {
            return;
          }

          const amount =
            Math.max(
              0,
              Number(
                raw || 0
              )
            );

          if (
            !Number.isFinite(
              amount
            )
          ) {
            window.alert(
              "Please enter a valid dollar amount."
            );

            return;
          }

          setPiggySaveForWindow(
            payWindow.id,
            amount
          );

          setEditingPiggyWindowId(
            null
          );
        }}
        className="flex-1 rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
      >
        ✏️ Edit Piggy Save
      </button>

      <button
        type="button"
        onClick={() => {
          setPiggySaveForWindow(
            payWindow.id,
            calculations.piggyBankRecommended
          );

          setEditingPiggyWindowId(
            null
          );
        }}
        className="flex-1 rounded-xl border-[3px] border-black bg-emerald-400 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
      >
        ✨ Use Recommendation
      </button>
    </div>

    {calculations.requestedPiggySave >
      calculations.safeToSave && (
      <p className="mt-3 text-[10px] font-black uppercase text-amber-300">
        🛡️ PaySplit reduced the actual save to{" "}
        {money(
          calculations.piggyBankAmount
        )}{" "}
        to protect your spending cushion.
      </p>
    )}
  </>
)}
</div>

        {/* POCKET */}

        <div className="mt-3 rounded-xl border-[3px] border-black bg-emerald-400 p-4 text-black shadow-[3px_3px_0px_black]">
          <p className="text-[10px] font-black uppercase">💵 In Your Pocket</p>

          <p className="mt-1 text-2xl font-black">
            {money(calculations.inYourPocket)}
          </p>

          <p className="mt-1 text-[10px] font-bold uppercase opacity-75">
            After bills + Piggy Bank
          </p>

          {calculations.protectedCushion > 0 && (
            <p className="mt-2 text-[10px] font-black uppercase opacity-70">
              🛡️ Includes {money(calculations.protectedCushion)} protected
              spending cushion
            </p>
          )}
        </div>

       {/* CLOSE WINDOW */}

{!closedPayWindows.some(
  (closedWindow) =>
    closedWindow.payWindowId === payWindow.id
) && (
  <button
    type="button"
    onClick={() =>
      openCloseWindowReview(
        payWindow,
        calculations
      )
    }
    className="mt-4 w-full rounded-xl border-[3px] border-black bg-[#FACC15] px-4 py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
  >
    🏁 Close Pay Window
  </button>
)}

{closedPayWindows.some(
  (closedWindow) =>
    closedWindow.payWindowId === payWindow.id
) && (
  <div className="mt-4 rounded-xl border-[3px] border-black bg-emerald-400 px-4 py-3 text-center text-xs font-black uppercase text-black">
    ✅ Pay Window Closed
  </div>
)}

        {closingWindowId === payWindow.id && (
          <div className="mt-4 rounded-[20px] border-[3px] border-black bg-[#080A16] p-4">
            <p className="text-xs font-black uppercase text-[#FACC15]">
              🏁 Review Actual Results
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  key: 'income',
                  label: 'Actual Income',
                },
                {
                  key: 'billsPaid',
                  label: 'Actual Bills Paid',
                },
                {
                  key: 'piggySaved',
                  label: 'Actual Piggy Saved',
                },
                {
                  key: 'inYourPocket',
                  label: 'Actual In Your Pocket',
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    {field.label}
                  </label>

                  <input
                    type="number"
                    value={closeActuals[field.key as keyof CloseActuals]}
                    onChange={(event) =>
                      setCloseActuals((current) => ({
                        ...current,
                        [field.key]: Number(event.target.value || 0),
                      }))
                    }
                    className="mt-2 w-full rounded-xl border-[2px] border-black bg-[#111933] p-3 text-sm font-black text-white"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setClosingWindowId(null)}
                className="flex-1 rounded-xl border-[3px] border-black bg-[#111933] px-4 py-3 text-xs font-black uppercase text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleCloseWindow(payWindow, calculations)}
                className="flex-1 rounded-xl border-[3px] border-black bg-emerald-400 px-4 py-3 text-xs font-black uppercase text-black"
              >
                ✓ Confirm & Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ============================================
     MAIN UI
  ============================================ */

  return (
    <SectionCard
      title="Paycheck Planner"
      subtitle="Focus on what is next while future and past pay periods stay organized."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <div className="paycheck-planner-badge inline-flex rounded-full border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-sm font-black uppercase text-black shadow-[5px_5px_0px_black]">
            💸 Money Coming Next
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-300">
            PaySplit combines the income arriving in each budgeting window and
            shows where the money needs to go.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="paycheck-planner-toggle rounded-xl border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
        >
          {isExpanded ? '▲ Collapse' : '▼ View Paychecks'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-5">
         {/* PAY WINDOWS */}

<div className="space-y-6">
  {[payWindowA, payWindowB].map((payWindow, index) => {
    if (!payWindow) {
      return null;
    }

    const windowActivePaychecks =
      getActivePaychecksForWindow(payWindow);

    return (
      <div
        key={payWindow.id}
        className="space-y-4"
      >
        {renderPayWindow(
          payWindow,
          index
        )}

        {windowActivePaychecks.length > 0 && (
          <div className="space-y-4">
            {windowActivePaychecks.map(
              (paycheck) => {
                const assignedBills =
                  getAssignedBills(
                    paycheck.id
                  );

                const remaining =
                  Number(
                    paycheck.amount || 0
                  ) -
                  getAssignedTotal(
                    paycheck.id
                  );

                return (
                  <details
                    key={paycheck.id}
                    className={
                      "group overflow-hidden rounded-[24px] border-[3px] border-black shadow-[6px_6px_0px_black] " +
                      (index === 0
                        ? "bg-[#243B8F]"
                        : "bg-[#5B2A86]")
                    }
                  >
                    <summary className="grid cursor-pointer list-none gap-4 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div>
                        <p className="font-black uppercase text-white">
                          🏢{" "}
                          {
                            paycheck.incomeSourceName
                          }
                        </p>

                        <p className="text-xs text-slate-300">
                          {formatPayDate(
                            paycheck.dateISO
                          )}
                        </p>
                      </div>

                      <p className="font-black text-white">
                        {money(
                          paycheck.amount
                        )}
                      </p>

                      <p className="font-black text-emerald-300">
                        {money(
                          remaining
                        )}
                      </p>
                    </summary>

                    <div className="border-t-[3px] border-black bg-[#0A1024] p-4">
                      <GeneratedPaycheckCard
                        paycheck={
                          paycheck
                        }
                        assignedBills={
                          assignedBills
                        }
                      />
                    </div>
                  </details>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  })}
</div>


          {/* FUTURE */}

          {futurePaychecks.length > 0 && (
            <details className="rounded-[22px] border-[3px] border-black bg-[#111933]">
              <summary className="cursor-pointer p-4 text-sm font-black uppercase text-white">
                ▼ Future Paychecks ({futurePaychecks.length})
              </summary>

              <div className="space-y-2 border-t-[3px] border-black p-4">
                {futurePaychecks.map((paycheck) => (
                  <div
                    key={paycheck.id}
                    className="flex items-center justify-between rounded-xl bg-[#080A16] p-3"
                  >
                    <div>
                      <p className="font-black text-white">
                        {paycheck.incomeSourceName}
                      </p>

                      <p className="text-xs text-slate-400">
                        {formatPayDate(paycheck.dateISO)}
                      </p>
                    </div>

                    <p className="font-black text-emerald-300">
                      {money(paycheck.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ARCHIVED */}

          {archivedPaychecks.length > 0 && (
            <details className="rounded-[22px] border-[3px] border-black bg-[#080A16]">
              <summary className="cursor-pointer p-4 text-sm font-black uppercase text-slate-300">
                ▶ Archived Paychecks ({archivedPaychecks.length})
              </summary>

              <div className="space-y-2 border-t-[3px] border-black p-4">
                {archivedPaychecks.map((paycheck) => (
                  <div
                    key={paycheck.id}
                    className="flex items-center justify-between rounded-xl bg-[#111933] p-3"
                  >
                    <span className="font-bold text-white">
                      {paycheck.incomeSourceName}
                    </span>

                    <span className="font-black text-slate-300">
                      {money(paycheck.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* HISTORY */}

          {closedPayWindows.length > 0 && (
            <details className="rounded-[22px] border-[3px] border-black bg-[#0A1024]">
              <summary className="cursor-pointer p-4 text-sm font-black uppercase text-white">
                📚 Pay Window History ({closedPayWindows.length})
              </summary>

              <div className="space-y-4 border-t-[3px] border-black p-4">
                {closedPayWindows.map((closedWindow) => {
                  const pocketDifference =
                    Number(closedWindow.actualInYourPocket || 0) -
                    Number(closedWindow.plannedInYourPocket || 0);

                  return (
                    <div
                      key={closedWindow.id}
                      className="rounded-[20px] border-[3px] border-black bg-[#111933] p-4"
                    >
                      <p className="text-xs font-black uppercase text-blue-200">
                        🏁 Closed Pay Window {closedWindow.half}
                      </p>

                      <p className="mt-1 font-bold text-white">
                        {closedWindow.payWindowLabel}
                      </p>

                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl bg-[#080A16] p-4">
                          <p className="text-xs font-black uppercase text-blue-200">
                            📋 Planned
                          </p>

                          <p className="mt-2 text-sm text-white">
                            Income: {money(closedWindow.plannedIncome)}
                          </p>

                          <p className="text-sm text-white">
                            Bills: {money(closedWindow.plannedBills)}
                          </p>

                          <p className="text-sm text-white">
                            Piggy: {money(closedWindow.plannedPiggyBank)}
                          </p>

                          <p className="text-sm font-black text-emerald-300">
                            Pocket: {money(closedWindow.plannedInYourPocket)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#080A16] p-4">
                          <p className="text-xs font-black uppercase text-emerald-300">
                            ✅ Actual
                          </p>

                          <p className="mt-2 text-sm text-white">
                            Income: {money(closedWindow.actualIncome)}
                          </p>

                          <p className="text-sm text-white">
                            Bills: {money(closedWindow.actualBillsPaid)}
                          </p>

                          <p className="text-sm text-white">
                            Piggy: {money(closedWindow.actualPiggySaved)}
                          </p>

                          <p className="text-sm font-black text-emerald-300">
                            Pocket: {money(closedWindow.actualInYourPocket)}
                          </p>
                        </div>
                      </div>

                      <div
                        className={
                          'mt-3 rounded-xl border-[3px] border-black p-3 text-black ' +
                          (pocketDifference >= 0
                            ? 'bg-emerald-400'
                            : 'bg-rose-400')
                        }
                      >
                        <p className="text-xs font-black uppercase">
                          💵 Pocket Difference
                        </p>

                        <p className="mt-1 text-lg font-black">
                          {pocketDifference >= 0 ? '+' : '-'}
                          {money(Math.abs(pocketDifference))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </SectionCard>
  );
}
