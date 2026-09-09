import type {
  BillItem,
  BillFrequency,
} from "./paysplitStore";

export type BillOccurrence = {
  /**
   * Stable occurrence ID.
   *
   * Example:
   * mortgage-id_2026-09-01
   */
  id: string;

  billId: string;

  billName: string;

  category: string;

  amount: number;

  /**
   * The specific date this occurrence
   * is due.
   *
   * YYYY-MM-DD
   */
  dueDateISO: string;

  frequency: BillFrequency;
};

/**
 * Returns every occurrence of one bill
 * inside the requested date range.
 */
export function generateBillOccurrences(
  bill: BillItem,
  fromDate: Date,
  toDate: Date
): BillOccurrence[] {
  const frequency: BillFrequency =
    bill.frequency ??
    "monthly";

  const start =
    startOfDay(fromDate);

  const end =
    startOfDay(toDate);

  if (end < start) {
    return [];
  }

  const scheduleEnd =
    bill.endDate
      ? parseISODate(
          bill.endDate
        )
      : null;

  const finalEnd =
    scheduleEnd &&
    scheduleEnd < end
      ? scheduleEnd
      : end;

  if (finalEnd < start) {
    return [];
  }

  switch (frequency) {
    case "monthly":
      return generateMonthlyOccurrences(
        bill,
        start,
        finalEnd
      );

    case "semi-monthly":
      return generateSemiMonthlyOccurrences(
        bill,
        start,
        finalEnd
      );

    case "weekly":
      return generateIntervalOccurrences(
        bill,
        start,
        finalEnd,
        7
      );

    case "biweekly":
      return generateIntervalOccurrences(
        bill,
        start,
        finalEnd,
        14
      );

    case "one-time":
      return generateOneTimeOccurrence(
        bill,
        start,
        finalEnd
      );

    default:
      return [];
  }
}

/**
 * Generate occurrences for many bills.
 */
export function generateAllBillOccurrences(
  bills: BillItem[],
  fromDate: Date,
  toDate: Date
): BillOccurrence[] {
  return bills
    .flatMap((bill) =>
      generateBillOccurrences(
        bill,
        fromDate,
        toDate
      )
    )
    .sort(
      (
        first,
        second
      ) =>
        first.dueDateISO.localeCompare(
          second.dueDateISO
        )
    );
}

function generateMonthlyOccurrences(
  bill: BillItem,
  start: Date,
  end: Date
): BillOccurrence[] {
  const dueDay =
    clampDay(
      bill.dueDay ?? 1
    );

  const results:
    BillOccurrence[] = [];

  let year =
    start.getFullYear();

  let month =
    start.getMonth();

  while (
    new Date(
      year,
      month,
      1
    ) <= end
  ) {
    const dueDate =
      createClampedMonthDate(
        year,
        month,
        dueDay
      );

    if (
      dueDate >= start &&
      dueDate <= end
    ) {
      results.push(
        createOccurrence(
          bill,
          dueDate
        )
      );
    }

    month += 1;

    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return results;
}

function generateSemiMonthlyOccurrences(
  bill: BillItem,
  start: Date,
  end: Date
): BillOccurrence[] {
  const firstDay =
    clampDay(
      bill.dueDay ?? 1
    );

  const secondDay =
    clampDay(
      bill.secondDueDay ??
        15
    );

  const dueDays =
    Array.from(
      new Set([
        firstDay,
        secondDay,
      ])
    ).sort(
      (a, b) =>
        a - b
    );

  const results:
    BillOccurrence[] = [];

  let year =
    start.getFullYear();

  let month =
    start.getMonth();

  while (
    new Date(
      year,
      month,
      1
    ) <= end
  ) {
    for (
      const requestedDay
      of dueDays
    ) {
      const dueDate =
        createClampedMonthDate(
          year,
          month,
          requestedDay
        );

      if (
        dueDate >= start &&
        dueDate <= end
      ) {
        results.push(
          createOccurrence(
            bill,
            dueDate
          )
        );
      }
    }

    month += 1;

    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return results;
}

function generateIntervalOccurrences(
  bill: BillItem,
  start: Date,
  end: Date,
  intervalDays: number
): BillOccurrence[] {
  const anchor =
    bill.startDate
      ? parseISODate(
          bill.startDate
        )
      : null;

  if (!anchor) {
    return [];
  }

  const results:
    BillOccurrence[] = [];

  let current =
    startOfDay(anchor);

  while (
    current < start
  ) {
    current =
      addDays(
        current,
        intervalDays
      );
  }

  while (
    current <= end
  ) {
    results.push(
      createOccurrence(
        bill,
        current
      )
    );

    current =
      addDays(
        current,
        intervalDays
      );
  }

  return results;
}

function generateOneTimeOccurrence(
  bill: BillItem,
  start: Date,
  end: Date
): BillOccurrence[] {
  const dueDate =
    bill.startDate
      ? parseISODate(
          bill.startDate
        )
      : null;

  if (!dueDate) {
    return [];
  }

  if (
    dueDate < start ||
    dueDate > end
  ) {
    return [];
  }

  return [
    createOccurrence(
      bill,
      dueDate
    ),
  ];
}

function createOccurrence(
  bill: BillItem,
  dueDate: Date
): BillOccurrence {
  const dueDateISO =
    toISODate(
      dueDate
    );

  return {
    id:
      `${bill.id}_${dueDateISO}`,

    billId:
      bill.id,

    billName:
      bill.name,

    category:
      bill.category,

    amount:
      Math.max(
        0,
        Number(
          bill.amount || 0
        )
      ),

    dueDateISO,

    frequency:
      bill.frequency ??
      "monthly",
  };
}

function createClampedMonthDate(
  year: number,
  month: number,
  requestedDay: number
) {
  const finalDay =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  return startOfDay(
    new Date(
      year,
      month,
      Math.min(
        requestedDay,
        finalDay
      )
    )
  );
}

function clampDay(
  value: number
) {
  const safeValue =
    Math.round(
      Number(value)
    );

  if (
    !Number.isFinite(
      safeValue
    )
  ) {
    return 1;
  }

  return Math.min(
    31,
    Math.max(
      1,
      safeValue
    )
  );
}

function addDays(
  date: Date,
  days: number
) {
  const next =
    new Date(date);

  next.setDate(
    next.getDate() +
      days
  );

  return startOfDay(
    next
  );
}

function startOfDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function toISODate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function parseISODate(
  value: string
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return startOfDay(
    date
  );
}