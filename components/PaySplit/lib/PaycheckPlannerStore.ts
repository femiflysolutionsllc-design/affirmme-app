import {
  loadIncomeSources,
  generateAllUpcomingPaychecks,
  type GeneratedPaycheck,
} from "./incomeStore";

/**
 * Keep the complete generated paycheck data,
 * while preserving the legacy aliases still
 * used by older PaySplit components.
 */
export type PlannerPaycheck =
  GeneratedPaycheck & {
    name: string;
    payDate: string;
    sourceId: string;
  };

export type PayWindow = {
  /**
   * Stable budgeting target.
   * Examples:
   * 2026-08-A
   * 2026-08-B
   */
  id: string;

  year: number;
  month: number;

  half: "A" | "B";

  label: string;

  startDateISO: string;
  endDateISO: string;

  /**
   * Every income deposit that falls
   * inside this budgeting window.
   */
  paychecks: PlannerPaycheck[];

  /**
   * Combined available income from
   * every paycheck in this window.
   */
  totalIncome: number;
};

export type PlannerState = {
  /**
   * Legacy individual-paycheck fields.
   * Keep these temporarily so older
   * PaySplit code does not break.
   */
  hasTwoPaychecks: boolean;
  paycheckA: PlannerPaycheck | null;
  paycheckB: PlannerPaycheck | null;

  allPaychecks: PlannerPaycheck[];

  /**
   * New budgeting architecture.
   */
  payWindowA: PayWindow | null;
  payWindowB: PayWindow | null;
  allPayWindows: PayWindow[];
};

function getDaysInMonth(
  year: number,
  month: number
) {
  return new Date(
    year,
    month,
    0
  ).getDate();
}

function toMonthString(
  month: number
) {
  return String(month).padStart(
    2,
    "0"
  );
}

function createWindowInfo(
  dateISO: string
) {
  const [year, month, day] =
    dateISO
      .split("-")
      .map(Number);

  const half: "A" | "B" =
    day <= 15
      ? "A"
      : "B";

  const monthText =
    toMonthString(month);

  const finalDay =
    getDaysInMonth(
      year,
      month
    );

  const id =
    `${year}-${monthText}-${half}`;

  const startDateISO =
    half === "A"
      ? `${year}-${monthText}-01`
      : `${year}-${monthText}-16`;

  const endDateISO =
    half === "A"
      ? `${year}-${monthText}-15`
      : `${year}-${monthText}-${String(
          finalDay
        ).padStart(2, "0")}`;

  const monthLabel =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(
        year,
        month - 1,
        1
      )
    );

  const label =
    half === "A"
      ? `${monthLabel} • 1st–15th`
      : `${monthLabel} • 16th–${finalDay}`;

  return {
    id,
    year,
    month,
    half,
    label,
    startDateISO,
    endDateISO,
  };
}

function buildPayWindows(
  paychecks: PlannerPaycheck[]
): PayWindow[] {
  const windows =
    new Map<
      string,
      PayWindow
    >();

  for (const paycheck of paychecks) {
    const info =
      createWindowInfo(
        paycheck.dateISO
      );

    const existing =
      windows.get(info.id);

    if (existing) {
      existing.paychecks.push(
        paycheck
      );

      existing.totalIncome +=
        Number(
          paycheck.amount || 0
        );

      continue;
    }

    windows.set(
      info.id,
      {
        ...info,

        paychecks: [
          paycheck,
        ],

        totalIncome:
          Number(
            paycheck.amount || 0
          ),
      }
    );
  }

  return Array.from(
    windows.values()
  )
    .map((window) => ({
      ...window,

      paychecks: [
        ...window.paychecks,
      ].sort(
        (
          first,
          second
        ) =>
          first.dateISO.localeCompare(
            second.dateISO
          )
      ),
    }))
    .sort(
      (
        first,
        second
      ) =>
        first.startDateISO.localeCompare(
          second.startDateISO
        )
    );
}

export function buildPlannerState():
  PlannerState {
  const incomeSources =
    loadIncomeSources();

  const generated =
    generateAllUpcomingPaychecks(
      incomeSources,
      6
    );

  const plannerPaychecks:
    PlannerPaycheck[] =
    generated.map(
      (paycheck) => ({
        ...paycheck,

        // Temporary compatibility aliases
        name:
          paycheck
            .incomeSourceName,

        payDate:
          paycheck.dateISO,

        sourceId:
          paycheck
            .incomeSourceId,
      })
    );

  const allPayWindows =
    buildPayWindows(
      plannerPaychecks
    );

  return {
    /**
     * Keep old paycheck fields
     * alive temporarily.
     */
    hasTwoPaychecks:
      plannerPaychecks.length >
      1,

    paycheckA:
      plannerPaychecks[0] ??
      null,

    paycheckB:
      plannerPaychecks[1] ??
      null,

    allPaychecks:
      plannerPaychecks,

    /**
     * New combined-income
     * budgeting windows.
     */
    payWindowA:
      allPayWindows[0] ??
      null,

    payWindowB:
      allPayWindows[1] ??
      null,

    allPayWindows,
  };
}