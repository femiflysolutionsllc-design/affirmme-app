export type EventType =
  | "Gym"
  | "Study"
  | "Work"
  | "Appointment"
  | "Self-care"
  | "Bill"
  | "Paycheck"
  | "Other";

export type EventSource =
  | "manual"
  | "roadmap"
  | "bill"
  | "paycheck";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  type: EventType;

  time?: string;
  durationMinutes?: number;
  prepMinutes?: number;

  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;

  source?: EventSource;

  roadmapId?: string;
  billId?: string;
billOccurrenceKey?: string;
paycheckId?: string;

/**
 * Used when part of a bill is assigned
 * to a specific paycheck.
 */
allocationAmount?: number;
allocationPaid?: boolean;
/**
 * Human-readable due schedule from PaySplit.
 * Example: "Due 1st monthly"
 */
 billDueLabel?: string;
};

export type StudyTimePreference =
  | "morning"
  | "afternoon"
  | "evening";

  export type UpcomingBillReminder = {
    id: string;
    billId: string;
    title: string;
    amount: number;
    dueDate: string;
    dueLabel: string;
    daysUntilDue: number;
    reservedAmount: number;
    remainingAmount: number;
    fullyReserved: boolean;
  };
