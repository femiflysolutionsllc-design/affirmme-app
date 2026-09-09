import {
  loadBills,
  type BillItem,
} from "./paysplitStore";

import {
  buildPlannerState,
} from "./PaycheckPlannerStore";

import {
  getBillFundingStatus,
} from "./billWindowMatcher";

import {
  loadPiggyBankGoals,
  getPiggyGoalRemaining,
  getRecommendedPiggyA,
  getRecommendedPiggyB,
  type PiggyBankGoal,
} from "./piggyBankStore";

/* =========================
   Types
========================= */

export type PaySplitBillSnapshot = {
  bill: BillItem;
  amountRemaining: number;
  isFullyFunded: boolean;
};

export type PaySplitPiggySnapshot = {
  goal: PiggyBankGoal;
  remaining: number;
  recommendedA: number;
  recommendedB: number;
  completed: boolean;
};

export type PaySplitSnapshot = {
  bills: BillItem[];

  unfundedBills:
    PaySplitBillSnapshot[];

  totalBills: number;

  totalUnfunded: number;

  piggyBankGoals:
    PaySplitPiggySnapshot[];

  activePiggyBankGoals:
    PaySplitPiggySnapshot[];

  totalPiggySaved: number;

  totalPiggyRemaining: number;

  recommendedPiggyA: number;

  recommendedPiggyB: number;

  payWindows: ReturnType<
    typeof buildPlannerState
  >["allPayWindows"];

  nextPaycheck:
    ReturnType<
      typeof buildPlannerState
    >["allPaychecks"][number] |
    null;
};

/* =========================
   Snapshot
========================= */

export function getPaySplitSnapshot():
  PaySplitSnapshot {
  const bills =
    loadBills();

  const planner =
    buildPlannerState();

  const payWindows =
    planner.allPayWindows;

  const billSnapshots =
    bills.map(
      (
        bill
      ): PaySplitBillSnapshot => {
        const funding =
          getBillFundingStatus(
            bill,
            payWindows
          );

        return {
          bill,

          amountRemaining:
            funding.amountRemaining,

          isFullyFunded:
            funding.isFullyFunded,
        };
      }
    );

  const unfundedBills =
    billSnapshots
      .filter(
        (item) =>
          !item.isFullyFunded &&
          item.amountRemaining >
            0
      )
      .sort(
        (
          first,
          second
        ) =>
          second.amountRemaining -
          first.amountRemaining
      );

  const goals =
    loadPiggyBankGoals();

  const piggyBankGoals =
    goals.map(
      (
        goal
      ): PaySplitPiggySnapshot => {
        const remaining =
          getPiggyGoalRemaining(
            goal
          );

        return {
          goal,

          remaining,

          recommendedA:
            getRecommendedPiggyA(
              goal
            ),

          recommendedB:
            getRecommendedPiggyB(
              goal
            ),

          completed:
            remaining <= 0,
        };
      }
    );

  const activePiggyBankGoals =
    piggyBankGoals.filter(
      (item) =>
        !item.completed
    );

  const totalBills =
    bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        Math.max(
          0,
          Number(
            bill.amount
          ) || 0
        ),
      0
    );

  const totalUnfunded =
    unfundedBills.reduce(
      (
        total,
        item
      ) =>
        total +
        item.amountRemaining,
      0
    );

  const totalPiggySaved =
    goals.reduce(
      (
        total,
        goal
      ) =>
        total +
        Math.max(
          0,
          Number(
            goal.savedAmount
          ) || 0
        ),
      0
    );

  const totalPiggyRemaining =
    activePiggyBankGoals.reduce(
      (
        total,
        item
      ) =>
        total +
        item.remaining,
      0
    );

  const recommendedPiggyA =
    activePiggyBankGoals.reduce(
      (
        total,
        item
      ) =>
        total +
        item.recommendedA,
      0
    );

  const recommendedPiggyB =
    activePiggyBankGoals.reduce(
      (
        total,
        item
      ) =>
        total +
        item.recommendedB,
      0
    );

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const nextPaycheck =
    [...planner.allPaychecks]
      .filter(
        (paycheck) => {
          const date =
            new Date(
              `${paycheck.dateISO}T00:00:00`
            );

          return (
            !Number.isNaN(
              date.getTime()
            ) &&
            date >= today
          );
        }
      )
      .sort(
        (
          first,
          second
        ) =>
          first.dateISO.localeCompare(
            second.dateISO
          )
      )[0] ?? null;

  return {
    bills,

    unfundedBills,

    totalBills,

    totalUnfunded,

    piggyBankGoals,

    activePiggyBankGoals,

    totalPiggySaved,

    totalPiggyRemaining,

    recommendedPiggyA,

    recommendedPiggyB,

    payWindows,

    nextPaycheck,
  };
}