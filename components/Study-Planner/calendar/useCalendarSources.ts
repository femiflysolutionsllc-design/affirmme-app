"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  buildPlannerState,
  type PlannerPaycheck,
} from "../../PaySplit/lib/PaycheckPlannerStore";

import {
  INCOME_SOURCES_UPDATED_EVENT,
} from "../../PaySplit/lib/incomeStore";

import {
  BILLS_UPDATED_EVENT,
  loadBills,
  type BillItem,
} from "../../PaySplit/lib/paysplitStore";

import type {
  CalendarEvent,
  UpcomingBillReminder,
} from "./calendarTypes";

type UseCalendarSourcesOptions = {
  manualEvents: CalendarEvent[];
};

/* =========================
   Formatting Helpers
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

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(
  dateISO: string
) {
  return new Date(
    `${dateISO}T00:00:00`
  );
}

function isValidDateISO(
  dateISO?: string
) {
  if (!dateISO) {
    return false;
  }

  return !Number.isNaN(
    parseLocalDate(dateISO).getTime()
  );
}

function addDays(
  date: Date,
  numberOfDays: number
) {
  const nextDate = new Date(date);

  nextDate.setDate(
    nextDate.getDate() + numberOfDays
  );

  return nextDate;
}

function getLastDayOfMonth(
  year: number,
  monthIndex: number
) {
  return new Date(
    year,
    monthIndex + 1,
    0
  ).getDate();
}

function createMonthlyDate(
  year: number,
  monthIndex: number,
  requestedDay: number
) {
  const lastDay = getLastDayOfMonth(
    year,
    monthIndex
  );

  const safeDay = Math.min(
    Math.max(requestedDay, 1),
    lastDay
  );

  return new Date(
    year,
    monthIndex,
    safeDay
  );
}

function isDateInsideRange(
  dateISO: string,
  rangeStartISO: string,
  rangeEndISO: string
) {
  return (
    dateISO >= rangeStartISO &&
    dateISO <= rangeEndISO
  );
}

function isInsideBillSchedule(
  dateISO: string,
  bill: BillItem
) {
  if (
    bill.startDate &&
    dateISO < bill.startDate
  ) {
    return false;
  }

  if (
    bill.endDate &&
    dateISO > bill.endDate
  ) {
    return false;
  }

  return true;
}

function getOrdinal(
  day: number
) {
  const remainder100 = day % 100;

  if (
    remainder100 >= 11 &&
    remainder100 <= 13
  ) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;

    case 2:
      return `${day}nd`;

    case 3:
      return `${day}rd`;

    default:
      return `${day}th`;
  }
}

function getBillDueLabel(
  bill: BillItem
) {
  const frequency =
    bill.frequency ?? "monthly";

  if (frequency === "monthly") {
    return `Due ${getOrdinal(
      Number(bill.dueDay || 1)
    )} monthly`;
  }

  if (frequency === "semi-monthly") {
    return `Due ${getOrdinal(
      Number(bill.dueDay || 1)
    )} & ${getOrdinal(
      Number(
        bill.secondDueDay || 15
      )
    )} monthly`;
  }

  if (frequency === "weekly") {
    return "Due weekly";
  }

  if (frequency === "biweekly") {
    return "Due every 2 weeks";
  }

  if (
    frequency === "one-time" &&
    bill.startDate
  ) {
    const date = parseLocalDate(
      bill.startDate
    );

    if (
      !Number.isNaN(date.getTime())
    ) {
      return `Due ${date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      )}`;
    }
  }

  return "Bill due";
}

/* =========================
   Bill Event Builder
========================= */

function createBillEvent(
  bill: BillItem,
  dateISO: string
): CalendarEvent {
  return {
    id: `bill:${bill.id}:${dateISO}`,
    date: dateISO,
    title: `🧾 ${bill.name} • ${money(
      Number(bill.amount || 0)
    )}`,
    type: "Bill",
    source: "bill",
    billId: bill.id,
    billOccurrenceKey:
      `${bill.id}:${dateISO}`,
  };
}

function createBillAllocationEvent(
  bill: BillItem,
  paycheck: PlannerPaycheck,
  amount: number,
  paid?: boolean
): CalendarEvent {
  return {
    id: `bill-allocation:${bill.id}:${paycheck.id}`,

    date: paycheck.payDate,

    title: `💸 ${bill.name} • ${money(
      amount
    )} from this paycheck`,

    type: "Bill",
    source: "bill",

    billId: bill.id,
    paycheckId: paycheck.id,

    billOccurrenceKey:
      `allocation:${bill.id}:${paycheck.id}`,

    allocationAmount: amount,
    allocationPaid: Boolean(paid),
    billDueLabel: getBillDueLabel(bill),
  };
}


function buildBillEvents(
  bills: BillItem[]
): CalendarEvent[] {
  const today = new Date();

  /*
   * Build enough history and future dates
   * for month navigation and Upcoming.
   */
  const rangeStart = new Date(
    today.getFullYear() - 1,
    0,
    1
  );

  const rangeEnd = new Date(
    today.getFullYear() + 2,
    11,
    31
  );

  const rangeStartISO =
    getLocalDateKey(rangeStart);

  const rangeEndISO =
    getLocalDateKey(rangeEnd);

  const events: CalendarEvent[] = [];

  for (const bill of bills) {
    const frequency =
      bill.frequency ?? "monthly";

    /*
     * One-time bills
     */
    if (frequency === "one-time") {
      if (
        bill.startDate &&
        isValidDateISO(bill.startDate) &&
        isDateInsideRange(
          bill.startDate,
          rangeStartISO,
          rangeEndISO
        )
      ) {
        events.push(
          createBillEvent(
            bill,
            bill.startDate
          )
        );
      }

      continue;
    }

    /*
     * Weekly and biweekly bills
     */
    if (
      frequency === "weekly" ||
      frequency === "biweekly"
    ) {
      if (
        !bill.startDate ||
        !isValidDateISO(bill.startDate)
      ) {
        continue;
      }

      const intervalDays =
        frequency === "weekly"
          ? 7
          : 14;

      let occurrenceDate =
        parseLocalDate(bill.startDate);

      while (
        occurrenceDate < rangeStart
      ) {
        occurrenceDate = addDays(
          occurrenceDate,
          intervalDays
        );
      }

      while (
        occurrenceDate <= rangeEnd
      ) {
        const occurrenceISO =
          getLocalDateKey(
            occurrenceDate
          );

        if (
          isInsideBillSchedule(
            occurrenceISO,
            bill
          )
        ) {
          events.push(
            createBillEvent(
              bill,
              occurrenceISO
            )
          );
        }

        if (
          bill.endDate &&
          occurrenceISO > bill.endDate
        ) {
          break;
        }

        occurrenceDate = addDays(
          occurrenceDate,
          intervalDays
        );
      }

      continue;
    }

    /*
     * Monthly and semi-monthly bills
     */
    const firstDueDay = Number(
      bill.dueDay || 1
    );

    const dueDays =
      frequency === "semi-monthly"
        ? [
            firstDueDay,
            Number(
              bill.secondDueDay || 15
            ),
          ]
        : [firstDueDay];

    let monthCursor = new Date(
      rangeStart.getFullYear(),
      rangeStart.getMonth(),
      1
    );

    while (monthCursor <= rangeEnd) {
      for (const dueDay of dueDays) {
        const occurrenceDate =
          createMonthlyDate(
            monthCursor.getFullYear(),
            monthCursor.getMonth(),
            dueDay
          );

        const occurrenceISO =
          getLocalDateKey(
            occurrenceDate
          );

        if (
          isDateInsideRange(
            occurrenceISO,
            rangeStartISO,
            rangeEndISO
          ) &&
          isInsideBillSchedule(
            occurrenceISO,
            bill
          )
        ) {
          events.push(
            createBillEvent(
              bill,
              occurrenceISO
            )
          );
        }
      }

      monthCursor = new Date(
        monthCursor.getFullYear(),
        monthCursor.getMonth() + 1,
        1
      );
    }
  }

  return events;
}

function buildBillAllocationEvents(
  bills: BillItem[],
  paychecks: PlannerPaycheck[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const bill of bills) {
    /*
     * New split-paycheck allocations
     */
    for (
      const allocation of
      bill.paycheckAllocations ?? []
    ) {
      const paycheck =
        paychecks.find(
          (item) =>
            item.id ===
            allocation.paycheckId
        );

      if (!paycheck) {
        continue;
      }

      const amount = Math.max(
        0,
        Number(
          allocation.amount || 0
        )
      );

      if (amount <= 0) {
        continue;
      }

      events.push(
        createBillAllocationEvent(
          bill,
          paycheck,
          amount,
          allocation.paid
        )
      );
    }

    /*
     * Legacy single-paycheck assignment.
     *
     * Only use this when the bill does NOT
     * already have split allocations.
     */
    if (
      (!bill.paycheckAllocations ||
        bill.paycheckAllocations
          .length === 0) &&
      bill.assignedPaycheckId
    ) {
      const paycheck =
        paychecks.find(
          (item) =>
            item.id ===
            bill.assignedPaycheckId
        );

      if (!paycheck) {
        continue;
      }

      events.push(
        createBillAllocationEvent(
          bill,
          paycheck,
          Number(
            bill.amount || 0
          ),
          bill.status === "paid"
        )
      );
    }
  }

  return events;
}

function buildUpcomingBillReminders(
  bills: BillItem[],
  billEvents: CalendarEvent[],
  paychecks: PlannerPaycheck[]
): UpcomingBillReminder[] {
  const today = new Date();

  const todayISO =
    getLocalDateKey(today);

  const futureBillEvents =
    billEvents
      .filter(
        (event) =>
          event.date >= todayISO
      )
      .sort((first, second) =>
        first.date.localeCompare(
          second.date
        )
      );

  const reminders:
    UpcomingBillReminder[] = [];

  for (const bill of bills) {
    const nextBillEvent =
      futureBillEvents.find(
        (event) =>
          event.billId === bill.id
      );

    if (!nextBillEvent) {
      continue;
    }

    const dueDate =
      parseLocalDate(
        nextBillEvent.date
      );

    const differenceMs =
      dueDate.getTime() -
      parseLocalDate(
        todayISO
      ).getTime();

    const daysUntilDue =
      Math.max(
        0,
        Math.ceil(
          differenceMs /
            (1000 * 60 * 60 * 24)
        )
      );

    const reservedAmount =
      (
        bill.paycheckAllocations ?? []
      ).reduce(
        (total, allocation) =>
          total +
          Math.max(
            0,
            Number(
              allocation.amount || 0
            )
          ),
        0
      );

    const billAmount =
      Math.max(
        0,
        Number(
          bill.amount || 0
        )
      );

    const remainingAmount =
      Math.max(
        0,
        billAmount -
          reservedAmount
      );

    reminders.push({
      id: `upcoming-bill:${bill.id}:${nextBillEvent.date}`,
      billId: bill.id,
      title: bill.name,
      amount: billAmount,
      dueDate:
        nextBillEvent.date,
      dueLabel:
        getBillDueLabel(bill),
      daysUntilDue,
      reservedAmount,
      remainingAmount,
      fullyReserved:
        reservedAmount >=
        billAmount,
    });
  }

  return reminders;
}

/* =========================
   Calendar Sources Hook
========================= */

export function useCalendarSources({
  manualEvents,
}: UseCalendarSourcesOptions) {
  const [paychecks, setPaychecks] =
    useState<PlannerPaycheck[]>([]);

  const [bills, setBills] =
    useState<BillItem[]>([]);

  useEffect(() => {
    function refreshPaychecks() {
      const planner =
        buildPlannerState();

      setPaychecks(
        planner.allPaychecks
      );
    }

    function refreshBills() {
      setBills(loadBills());
    }

    function refreshAllSources() {
      refreshPaychecks();
      refreshBills();
    }

    refreshAllSources();

    window.addEventListener(
      INCOME_SOURCES_UPDATED_EVENT,
      refreshPaychecks
    );

    window.addEventListener(
      BILLS_UPDATED_EVENT,
      refreshBills
    );

    window.addEventListener(
      "storage",
      refreshAllSources
    );

    window.addEventListener(
      "focus",
      refreshAllSources
    );

    return () => {
      window.removeEventListener(
        INCOME_SOURCES_UPDATED_EVENT,
        refreshPaychecks
      );

      window.removeEventListener(
        BILLS_UPDATED_EVENT,
        refreshBills
      );

      window.removeEventListener(
        "storage",
        refreshAllSources
      );

      window.removeEventListener(
        "focus",
        refreshAllSources
      );
    };
  }, []);

  const paycheckEvents =
  useMemo<CalendarEvent[]>(() => {
    return paychecks.map(
      (paycheck) => ({
        id: `paycheck:${paycheck.id}`,
        paycheckId: paycheck.id,
        date: paycheck.payDate,
        title: `💵 ${paycheck.name} • ${money(
          Number(paycheck.amount || 0)
        )}`,
        type: "Paycheck",
        source: "paycheck",
      })
    );
  }, [paychecks]);

const billEvents =
  useMemo<CalendarEvent[]>(() => {
    return buildBillEvents(bills);
  }, [bills]);

  const billAllocationEvents =
  useMemo<CalendarEvent[]>(() => {
    return buildBillAllocationEvents(
      bills,
      paychecks
    );
  }, [bills, paychecks]);

  const upcomingBillReminders =
  useMemo<
    UpcomingBillReminder[]
  >(() => {
    return buildUpcomingBillReminders(
      bills,
      billEvents,
      paychecks
    );
  }, [
    bills,
    billEvents,
    paychecks,
  ]);

const allEvents =
  useMemo<CalendarEvent[]>(() => {
    const filteredManualEvents =
      manualEvents.filter(
        (event) =>
          event.type !== "Bill" &&
          event.type !== "Paycheck"
      );

      return [
        ...filteredManualEvents,
        ...paycheckEvents,
        ...billEvents,
        ...billAllocationEvents,
      ];
    }, [
      manualEvents,
      paycheckEvents,
      billEvents,
      billAllocationEvents,
    ]);

    return {
      paychecks,
      bills,
      paycheckEvents,
      billEvents,
      billAllocationEvents,
      upcomingBillReminders,
      allEvents,
    };
  }