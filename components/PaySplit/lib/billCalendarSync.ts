import { BillItem } from "./paysplitStore";

export const CALENDAR_EVENTS_KEY = "calendar_events_v2";

type Assign = "A" | "B" | "both";

type BillWithAssign = BillItem & {
  assignTo?: Assign;
};

type CalendarEvent = {
  id: string;
  date: string;
  time?: string;
  title: string;
  type:
    | "Gym"
    | "Study"
    | "Work"
    | "Appointment"
    | "Self-care"
    | "Bill"
    | "Other";
  roadmapId?: string;
  billId?: string;
  billOccurrenceKey?: string;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

function parseDate(dateString?: string) {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function clampDueDay(year: number, month: number, dueDay?: number) {
  const safeDueDay = Math.max(1, Number(dueDay || 1));

  return Math.min(safeDueDay, daysInMonth(year, month));
}

function money(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeValue);
}

function createOccurrenceKey(billId: string, date: string) {
  return `bill:${billId}:${date}`;
}

function createBillEvent(
  bill: BillWithAssign,
  date: Date
): CalendarEvent {
  const dateKey = toDateKey(date);
  const occurrenceKey = createOccurrenceKey(bill.id, dateKey);

  return {
    id: occurrenceKey,
    date: dateKey,
    title: `💳 ${bill.name} due • ${money(Number(bill.amount || 0))}`,
    type: "Bill",
    billId: bill.id,
    billOccurrenceKey: occurrenceKey,
  };
}

function isWithinRange(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date,
  billEndDate?: Date | null
) {
  if (date < rangeStart || date > rangeEnd) {
    return false;
  }

  if (billEndDate && date > billEndDate) {
    return false;
  }

  return true;
}

function createMonthlyOccurrences(
  bill: BillWithAssign,
  rangeStart: Date,
  rangeEnd: Date
) {
  const events: CalendarEvent[] = [];
  const billStartDate = parseDate(bill.startDate);
  const billEndDate = parseDate(bill.endDate);

  const cursor = new Date(
    rangeStart.getFullYear(),
    rangeStart.getMonth(),
    1
  );

  while (cursor <= rangeEnd) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const dueDay = clampDueDay(year, month, bill.dueDay);
    const occurrenceDate = new Date(year, month, dueDay);

    const startsBeforeOccurrence =
      !billStartDate || occurrenceDate >= billStartDate;

    if (
      startsBeforeOccurrence &&
      isWithinRange(
        occurrenceDate,
        rangeStart,
        rangeEnd,
        billEndDate
      )
    ) {
      events.push(createBillEvent(bill, occurrenceDate));
    }

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return events;
}

function createSemiMonthlyOccurrences(
  bill: BillWithAssign,
  rangeStart: Date,
  rangeEnd: Date
) {
  const events: CalendarEvent[] = [];
  const billStartDate = parseDate(bill.startDate);
  const billEndDate = parseDate(bill.endDate);

  const cursor = new Date(
    rangeStart.getFullYear(),
    rangeStart.getMonth(),
    1
  );

  while (cursor <= rangeEnd) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const dueDays = [
      clampDueDay(year, month, bill.dueDay),
      clampDueDay(year, month, bill.secondDueDay),
    ];

    for (const dueDay of [...new Set(dueDays)]) {
      const occurrenceDate = new Date(year, month, dueDay);

      const startsBeforeOccurrence =
        !billStartDate || occurrenceDate >= billStartDate;

      if (
        startsBeforeOccurrence &&
        isWithinRange(
          occurrenceDate,
          rangeStart,
          rangeEnd,
          billEndDate
        )
      ) {
        events.push(createBillEvent(bill, occurrenceDate));
      }
    }

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return events;
}

function createRepeatingOccurrences(
  bill: BillWithAssign,
  rangeStart: Date,
  rangeEnd: Date,
  intervalDays: number
) {
  const events: CalendarEvent[] = [];
  const billStartDate = parseDate(bill.startDate);

  if (!billStartDate) {
    return events;
  }

  const billEndDate = parseDate(bill.endDate);
  let occurrenceDate = new Date(billStartDate);

  while (occurrenceDate < rangeStart) {
    occurrenceDate = addDays(occurrenceDate, intervalDays);
  }

  while (occurrenceDate <= rangeEnd) {
    if (
      isWithinRange(
        occurrenceDate,
        rangeStart,
        rangeEnd,
        billEndDate
      )
    ) {
      events.push(createBillEvent(bill, occurrenceDate));
    }

    occurrenceDate = addDays(occurrenceDate, intervalDays);
  }

  return events;
}

function createOneTimeOccurrence(
  bill: BillWithAssign,
  rangeStart: Date,
  rangeEnd: Date
) {
  const occurrenceDate = parseDate(bill.startDate);

  if (!occurrenceDate) {
    return [];
  }

  if (occurrenceDate < rangeStart || occurrenceDate > rangeEnd) {
    return [];
  }

  return [createBillEvent(bill, occurrenceDate)];
}

export function buildBillCalendarEvents(
  bills: BillWithAssign[],
  monthsAhead = 12
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rangeStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const rangeEnd = new Date(
    today.getFullYear(),
    today.getMonth() + monthsAhead + 1,
    0
  );

  return bills.flatMap((bill) => {
    const frequency = bill.frequency ?? "monthly";

    if (frequency === "semi-monthly") {
      return createSemiMonthlyOccurrences(
        bill,
        rangeStart,
        rangeEnd
      );
    }

    if (frequency === "weekly") {
      return createRepeatingOccurrences(
        bill,
        rangeStart,
        rangeEnd,
        7
      );
    }

    if (frequency === "biweekly") {
      return createRepeatingOccurrences(
        bill,
        rangeStart,
        rangeEnd,
        14
      );
    }

    if (frequency === "one-time") {
      return createOneTimeOccurrence(
        bill,
        rangeStart,
        rangeEnd
      );
    }

    return createMonthlyOccurrences(
      bill,
      rangeStart,
      rangeEnd
    );
  });
}

export function syncBillsToCalendar(
  bills: BillWithAssign[]
) {
  if (typeof window === "undefined") return;

  let existingEvents: CalendarEvent[] = [];

  try {
    const saved = localStorage.getItem(CALENDAR_EVENTS_KEY);
    existingEvents = saved ? JSON.parse(saved) : [];
  } catch {
    existingEvents = [];
  }

  // Keep everything that isn't a Bill event.
  const nonBillEvents = existingEvents.filter(
    (event) => event.type !== "Bill"
  );

 // Generate fresh bill events.
const billEvents = buildBillCalendarEvents(bills);

console.log("Bills received:", bills);
console.log("Generated bill events:", billEvents);

// Merge together.
const updatedCalendar = [
  ...nonBillEvents,
  ...billEvents,
];

console.log("Calendar being saved:", updatedCalendar);

localStorage.setItem(
  CALENDAR_EVENTS_KEY,
  JSON.stringify(updatedCalendar)
);

return updatedCalendar; 
}