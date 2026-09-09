import { getPaycheckOverride } from './paycheckOverrideStore';

import { estimatePayrollTaxes } from './taxEstimator';

export const INCOME_SOURCES_KEY = 'paysplit_income_sources_v1';
export const INCOME_SOURCES_UPDATED_EVENT = 'paysplit:income-sources-updated';

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export type PayType = 'fixed' | 'hourly';

export type IncomeSourceType =
  | 'employment'
  | 'business'
  | 'allowance'
  | 'gift'
  | 'odd_job'
  | 'other';

  export type IncomeRecurrence =
  | 'recurring'
  | 'one_time';

export type PayAdjustmentType = 'hourly' | 'flat';

export type PayAdjustment = {
  id: string;

  /**
   * Examples:
   * Night Differential
   * Weekend Differential
   * Call Pay
   * Certification Pay
   */
  name: string;

  /**
   * hourly = extra amount per eligible hour
   * flat = one fixed dollar amount
   */
  type: PayAdjustmentType;

  amount: number;

  /**
   * Default eligible hours for this adjustment
   * on a typical paycheck.
   *
   * Individual paychecks can override this.
   */
  defaultEligibleHours?: number;

  active: boolean;
};

export type PayrollDeductionType = 'percent' | 'flat';

export type TaxEstimateMode = 'automatic' | 'manual';

export type TaxFilingStatus =
  | 'single'
  | 'married_joint'
  | 'married_separate'
  | 'head_of_household';

export type TaxProfile = {
  mode: TaxEstimateMode;

  filingStatus: TaxFilingStatus;

  /**
   * Two-letter state code.
   * Example: FL, NY, CA
   */
  stateCode: string;

  /**
   * Number of qualifying dependents
   * used for paycheck estimation.
   */
  dependents: number;

  /**
   * Optional extra federal withholding
   * requested by the user.
   */
  extraFederalWithholding: number;

  /**
   * Tax year used by the estimator.
   */
  taxYear: number;
};

export type PayrollDeduction = {
  id: string;

  /**
   * Examples:
   * Federal Tax
   * Medicare
   * Health Insurance
   * 401(k)
   */
  name: string;

  type: PayrollDeductionType;

  /**
   * percent:
   * 6.2 means 6.2%
   *
   * flat:
   * 120 means $120
   */
  amount: number;

  active: boolean;
};

export type IncomeSource = {
  id: string;
  name: string;

  /**
   * Describes where this income comes from.
   *
   * A single user can have multiple source types.
   * Example:
   * - employment from a hospital
   * - business income
   * - allowance from a parent
   */
  sourceType: IncomeSourceType;
  recurrence: IncomeRecurrence;

  estimatedNetPay: number;
  frequency: PayFrequency;
  payType: PayType;

  /**
   * Used when payType === "hourly".
   */
  hourlyRate?: number;

  /**
   * Typical hours for one paycheck.
   * Individual paychecks can override this later.
   */
  expectedHoursPerPaycheck?: number;

  /**
   * Hourly income overtime settings.
   */
  overtimeEnabled?: boolean;

  /**
   * Usually 1.5 for time-and-a-half.
   */
  overtimeMultiplier?: number;

  /**
   * Standard weekly threshold before
   * overtime begins.
   */
  overtimeThresholdHours?: number;

  /**
   * Employer/user-specific pay additions.
   * Examples: night differential,
   * weekend differential, call pay.
   */
  payAdjustments?: PayAdjustment[];

  /**
   * User's usual paycheck deduction estimate.
   * Example: 22 means about 22%.
   */
  /**
   * User-specific paycheck deductions.
   */
  payrollDeductions?: PayrollDeduction[];

  /**
   * Weekly and biweekly schedules use this as the first known payday.
   * Format: YYYY-MM-DD
   */
  startDate: string;

  /**
   * Semi-monthly schedules use two days, such as the 1st and 15th.
   */
  firstPayDay: number;
  secondPayDay: number;

  /**
   * Monthly schedules use one day of the month.
   */

  monthlyPayDay: number;

  taxProfile?: TaxProfile;

  depositAccountId?: string;
  calendarEnabled: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

export type GeneratedPaycheck = {
  id: string;
  incomeSourceId: string;
  incomeSourceName: string;
  dateISO: string;
  amount: number;
  frequency: PayFrequency;

  /**
   * Carries the pay setup into the generated paycheck.
   */
  payType?: PayType;

  /**
   * Hourly-pay information.
   * These will later be overridable per paycheck.
   */
  hourlyRate?: number;
  hoursWorked?: number;
  week1Hours?: number;
  week2Hours?: number;

  payAdjustments?: PayAdjustment[];

  payrollDeductions?: PayrollDeduction[];

  /**
   * Estimated earnings before deductions.
   */
  estimatedGrossPay?: number;
  estimatedDeductions?: number;
  estimatedNetPay?: number;
  estimatedFederalWithholding?: number;

estimatedSocialSecurity?: number;
estimatedMedicare?: number;
estimatedAdditionalMedicare?: number;

estimatedFica?: number;
estimatedTaxes?: number;
  /**
   * Allows the user to enter the real paycheck
   * once they know the actual deposit.
   */
  manualAmountOverride?: number;

  adjustmentValues?: Record<string, number>;
};

export function createDefaultIncomeSource(): IncomeSource {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),

    name: 'Primary Income',

    sourceType: 'employment',

    recurrence: 'recurring',

    estimatedNetPay: 0,
    
    payType: 'fixed',

    hourlyRate: 0,

    expectedHoursPerPaycheck: 80,

    overtimeEnabled: true,

    overtimeMultiplier: 1.5,

    overtimeThresholdHours: 40,

    payAdjustments: [],

    payrollDeductions: [],

    frequency: 'biweekly',

    startDate: getTodayISO(),

    firstPayDay: 1,
    secondPayDay: 15,

    monthlyPayDay: 1,

    depositAccountId: '',

    calendarEnabled: true,

    active: true,

    createdAt: now,
    updatedAt: now,

    taxProfile: {
      mode: 'automatic',
      filingStatus: 'single',
      stateCode: '',
      dependents: 0,
      extraFederalWithholding: 0,
      taxYear: 2026,
    },
  };
}

export function loadIncomeSources(): IncomeSource[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(INCOME_SOURCES_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(Boolean).map((item) => normalizeIncomeSource(item));
  } catch {
    return [];
  }
}

export function saveIncomeSources(incomeSources: IncomeSource[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      INCOME_SOURCES_KEY,
      JSON.stringify(incomeSources)
    );

    window.dispatchEvent(
      new CustomEvent(INCOME_SOURCES_UPDATED_EVENT, {
        detail: incomeSources,
      })
    );
  } catch {
    // Keep the app usable if localStorage is unavailable.
  }
}

export function estimateHourlyGrossPay(
  hourlyRate: number,
  hoursWorked: number,
  overtimeEnabled = false,
  overtimeMultiplier = 1.5,
  overtimeThresholdHours = 40
) {
  const safeRate = Number.isFinite(hourlyRate) ? Math.max(0, hourlyRate) : 0;

  const safeHours = Number.isFinite(hoursWorked) ? Math.max(0, hoursWorked) : 0;

  const safeMultiplier = Number.isFinite(overtimeMultiplier)
    ? Math.max(1, overtimeMultiplier)
    : 1.5;

  const safeThreshold = Number.isFinite(overtimeThresholdHours)
    ? Math.max(0, overtimeThresholdHours)
    : 40;

  if (!overtimeEnabled || safeHours <= safeThreshold) {
    return safeRate * safeHours;
  }

  const regularHours = safeThreshold;
  const overtimeHours = safeHours - safeThreshold;

  const regularPay = regularHours * safeRate;

  const overtimePay = overtimeHours * safeRate * safeMultiplier;

  return regularPay + overtimePay;
}

export function generateUpcomingPaychecks(
  incomeSource: IncomeSource,
  count = 6,
  fromDate = new Date()
): GeneratedPaycheck[] {
  if (!incomeSource.active || count <= 0) {
    return [];
  }

  const normalizedSource = normalizeIncomeSource(incomeSource);

  const safeCount =
    normalizedSource.recurrence === "one_time"
      ? 1
      : Math.max(1, Math.min(count, 60));

  const startingDate = startOfDay(fromDate);

  let dates: Date[] = [];

  switch (normalizedSource.frequency) {
    case 'weekly':
      dates = generateIntervalDates(
        normalizedSource.startDate,
        startingDate,
        7,
        safeCount
      );
      break;

    case 'biweekly':
      dates = generateIntervalDates(
        normalizedSource.startDate,
        startingDate,
        14,
        safeCount
      );
      break;

    case 'semimonthly':
      dates = generateSemiMonthlyDates(
        normalizedSource.firstPayDay,
        normalizedSource.secondPayDay,
        startingDate,
        safeCount
      );
      break;

    case 'monthly':
      dates = generateMonthlyDates(
        normalizedSource.monthlyPayDay,
        startingDate,
        safeCount
      );
      break;
  }

  return dates.map((date) => {
    const dateISO = toISODate(date);

    const paycheckId = `${normalizedSource.id}_${dateISO}`;

    const override = getPaycheckOverride(paycheckId);

    const week1Hours = override?.week1Hours;

    const week2Hours = override?.week2Hours;

    const hoursWorked =
      override?.hoursWorked ??
      (normalizedSource.payType === 'hourly'
        ? normalizedSource.expectedHoursPerPaycheck
        : undefined);

    const estimatedBaseGrossPay =
      normalizedSource.payType === 'hourly' &&
      typeof normalizedSource.hourlyRate === 'number'
        ? typeof week1Hours === 'number' && typeof week2Hours === 'number'
          ? estimateHourlyGrossPay(
              normalizedSource.hourlyRate,
              week1Hours,
              normalizedSource.overtimeEnabled,
              normalizedSource.overtimeMultiplier,
              normalizedSource.overtimeThresholdHours
            ) +
            estimateHourlyGrossPay(
              normalizedSource.hourlyRate,
              week2Hours,
              normalizedSource.overtimeEnabled,
              normalizedSource.overtimeMultiplier,
              normalizedSource.overtimeThresholdHours
            )
          : typeof hoursWorked === 'number'
          ? estimateHourlyGrossPay(
              normalizedSource.hourlyRate,
              hoursWorked,
              false,
              normalizedSource.overtimeMultiplier,
              normalizedSource.overtimeThresholdHours
            )
          : undefined
        : undefined;

        const estimatedAdjustmentPay =
  normalizedSource.payType === 'hourly'
    ? (normalizedSource.payAdjustments ?? [])
        .filter(
          (adjustment) =>
            adjustment.active !== false
        )
        .reduce(
          (total, adjustment) => {
            if (adjustment.type === 'flat') {
              return (
                total +
                Math.max(
                  0,
                  adjustment.amount
                )
              );
            }

            const eligibleHours =
              typeof override
                ?.adjustmentValues?.[
                  adjustment.id
                ] === 'number'
                ? Math.max(
                    0,
                    override.adjustmentValues[
                      adjustment.id
                    ]
                  )
                : Math.max(
                    0,
                    adjustment.defaultEligibleHours ??
                      0
                  );

            return (
              total +
              Math.max(
                0,
                adjustment.amount
              ) *
                eligibleHours
            );
          },
          0
        )
    : 0;

    const estimatedGrossPay =
      override?.estimatedGrossPay ??
      (typeof estimatedBaseGrossPay === 'number'
        ? estimatedBaseGrossPay + estimatedAdjustmentPay
        : undefined);

        const payrollTaxEstimate =
        normalizedSource.payType === 'hourly' &&
        normalizedSource.taxProfile?.mode ===
          'automatic' &&
        typeof estimatedGrossPay === 'number'
          ? estimatePayrollTaxes({
              grossPay: estimatedGrossPay,
      
              frequency:
                normalizedSource.frequency,
      
              filingStatus:
                normalizedSource.taxProfile
                  ?.filingStatus ??
                'single',
      
              extraFederalWithholding:
                normalizedSource.taxProfile
                  ?.extraFederalWithholding ??
                0,
      
              taxYear:
                normalizedSource.taxProfile
                  ?.taxYear ?? 2026,
            })
          : undefined;

    const customEstimatedDeductions =
      typeof estimatedGrossPay === 'number'
        ? (normalizedSource.payrollDeductions ?? [])
            .filter((deduction) => deduction.active !== false)
            .reduce((total, deduction) => {
              if (deduction.type === 'percent') {
                return total + estimatedGrossPay * (deduction.amount / 100);
              }

              return total + deduction.amount;
            }, 0)
        : undefined;

        const estimatedDeductions =
        typeof customEstimatedDeductions ===
          'number'
          ? customEstimatedDeductions +
            (
              payrollTaxEstimate
                ?.totalEstimatedTaxes ?? 0
            )
          : undefined;

    const estimatedNetPay =
      typeof estimatedGrossPay === 'number' &&
      typeof estimatedDeductions === 'number'
        ? Math.max(0, estimatedGrossPay - estimatedDeductions)
        : undefined;

        const amount =
        override?.manualAmountOverride ??
        (
          normalizedSource.payType === 'hourly'
            ? estimatedNetPay ?? 0
            : normalizedSource.estimatedNetPay
        );

    return {
      id: paycheckId,

      incomeSourceId: normalizedSource.id,

      incomeSourceName: normalizedSource.name,

      dateISO,

      amount,

      frequency: normalizedSource.frequency,

      payType: normalizedSource.payType,

      hourlyRate:
        normalizedSource.payType === 'hourly'
          ? normalizedSource.hourlyRate
          : undefined,

      payAdjustments:
        normalizedSource.payType === 'hourly'
          ? normalizedSource.payAdjustments
          : undefined,

      payrollDeductions:
        normalizedSource.payType === 'hourly'
          ? normalizedSource.payrollDeductions
          : undefined,

      adjustmentValues: override?.adjustmentValues ?? {},

      hoursWorked,

      week1Hours,

      week2Hours,

      estimatedGrossPay,

      estimatedDeductions,

      estimatedNetPay,

      estimatedFederalWithholding:
  payrollTaxEstimate
    ?.federalWithholding,

estimatedTaxes:
  payrollTaxEstimate
    ?.totalEstimatedTaxes,

      estimatedSocialSecurity: payrollTaxEstimate?.socialSecurity,

      estimatedMedicare: payrollTaxEstimate?.medicare,

      estimatedAdditionalMedicare: payrollTaxEstimate?.additionalMedicare,

      estimatedFica: payrollTaxEstimate?.totalFica,

      manualAmountOverride: override?.manualAmountOverride,
    };
  });
}

export function generateAllUpcomingPaychecks(
  incomeSources: IncomeSource[],
  countPerSource = 6,
  fromDate = new Date()
): GeneratedPaycheck[] {
  return incomeSources
    .flatMap((source) =>
      generateUpcomingPaychecks(source, countPerSource, fromDate)
    )
    .sort((first, second) => first.dateISO.localeCompare(second.dateISO));
}

function normalizeIncomeSource(
  item: any
): IncomeSource {
  const now = Date.now();

  return {
    id:
      typeof item?.id === "string" &&
      item.id
        ? item.id
        : createId(),

    name:
      typeof item?.name === "string" &&
      item.name.trim()
        ? item.name.trim()
        : "Income Source",

        sourceType:
        item?.sourceType === "business" ||
        item?.sourceType === "allowance" ||
        item?.sourceType === "gift" ||
        item?.sourceType === "odd_job" ||
        item?.sourceType === "other"
          ? item.sourceType
          : "employment",
      
      recurrence:
        item?.recurrence === "one_time"
          ? "one_time"
          : "recurring",
      
      estimatedNetPay:
        toSafeNumber(
          item?.estimatedNetPay
        ),

    payType:
      item?.payType === "hourly"
        ? "hourly"
        : "fixed",

    hourlyRate:
      toSafeNumber(
        item?.hourlyRate
      ),

    expectedHoursPerPaycheck:
      toSafeNumber(
        item?.expectedHoursPerPaycheck
      ) || 80,

    frequency:
      normalizePayFrequency(
        item?.frequency
      ),

    overtimeEnabled:
      item?.overtimeEnabled !== false,

    overtimeMultiplier:
      toSafeNumber(
        item?.overtimeMultiplier
      ) || 1.5,

    overtimeThresholdHours:
      toSafeNumber(
        item?.overtimeThresholdHours
      ) || 40,

    payAdjustments:
      Array.isArray(
        item?.payAdjustments
      )
        ? item.payAdjustments
            .filter(Boolean)
            .map(
              (
                adjustment: any
              ) => ({
                id:
                  typeof adjustment?.id ===
                    "string" &&
                  adjustment.id
                    ? adjustment.id
                    : createId(),

                name:
                  typeof adjustment?.name ===
                  "string"
                    ? adjustment.name
                    : "Pay Adjustment",

                type:
                  adjustment?.type ===
                  "flat"
                    ? "flat"
                    : "hourly",

                amount:
                  Math.max(
                    0,
                    toSafeNumber(
                      adjustment?.amount
                    )
                  ),

                defaultEligibleHours:
                  Math.max(
                    0,
                    toSafeNumber(
                      adjustment
                        ?.defaultEligibleHours
                    )
                  ),

                active:
                  adjustment?.active !==
                  false,
              })
            )
        : [],

    payrollDeductions:
      Array.isArray(
        item?.payrollDeductions
      )
        ? item.payrollDeductions
            .filter(Boolean)
            .map(
              (
                deduction: any
              ) => ({
                id:
                  typeof deduction?.id ===
                    "string" &&
                  deduction.id
                    ? deduction.id
                    : createId(),

                name:
                  typeof deduction?.name ===
                  "string"
                    ? deduction.name
                    : "Deduction",

                type:
                  deduction?.type ===
                  "flat"
                    ? "flat"
                    : "percent",

                amount:
                  Math.max(
                    0,
                    toSafeNumber(
                      deduction?.amount
                    )
                  ),

                active:
                  deduction?.active !==
                  false,
              })
            )
        : [],

    taxProfile: {
      mode:
        item?.taxProfile?.mode ===
        "manual"
          ? "manual"
          : "automatic",

      filingStatus:
        item?.taxProfile
          ?.filingStatus ===
          "married_joint" ||
        item?.taxProfile
          ?.filingStatus ===
          "married_separate" ||
        item?.taxProfile
          ?.filingStatus ===
          "head_of_household"
          ? item.taxProfile
              .filingStatus
          : "single",

      stateCode:
        typeof item?.taxProfile
          ?.stateCode === "string"
          ? item.taxProfile.stateCode
              .trim()
              .toUpperCase()
              .slice(0, 2)
          : "",

      dependents:
        Math.max(
          0,
          Math.round(
            toSafeNumber(
              item?.taxProfile
                ?.dependents
            )
          )
        ),

      extraFederalWithholding:
        Math.max(
          0,
          toSafeNumber(
            item?.taxProfile
              ?.extraFederalWithholding
          )
        ),

      taxYear:
        Math.round(
          toSafeNumber(
            item?.taxProfile?.taxYear
          )
        ) || 2026,
    },

    startDate:
      isISODate(item?.startDate)
        ? item.startDate
        : getTodayISO(),

    firstPayDay:
      clampDay(
        item?.firstPayDay ?? 1
      ),

    secondPayDay:
      clampDay(
        item?.secondPayDay ?? 15
      ),

    monthlyPayDay:
      clampDay(
        item?.monthlyPayDay ?? 1
      ),

    depositAccountId:
      typeof item?.depositAccountId ===
      "string"
        ? item.depositAccountId
        : "",

    calendarEnabled:
      item?.calendarEnabled !== false,

    active:
      item?.active !== false,

    createdAt:
      toSafeTimestamp(
        item?.createdAt,
        now
      ),

    updatedAt:
      toSafeTimestamp(
        item?.updatedAt,
        now
      ),
  };
}

function normalizePayFrequency(value: any): PayFrequency {
  if (
    value === 'weekly' ||
    value === 'biweekly' ||
    value === 'semimonthly' ||
    value === 'monthly'
  ) {
    return value;
  }

  return 'biweekly';
}

function generateIntervalDates(
  anchorISO: string,
  fromDate: Date,
  intervalDays: number,
  count: number
): Date[] {
  const anchorDate = parseISODate(anchorISO);

  if (!anchorDate) {
    return [];
  }

  const result: Date[] = [];
  let currentDate = startOfDay(anchorDate);

  while (currentDate < fromDate) {
    currentDate = addDays(currentDate, intervalDays);
  }

  while (result.length < count) {
    result.push(currentDate);
    currentDate = addDays(currentDate, intervalDays);
  }

  return result;
}

function generateSemiMonthlyDates(
  firstPayDay: number,
  secondPayDay: number,
  fromDate: Date,
  count: number
): Date[] {
  const result: Date[] = [];
  const orderedDays = Array.from(
    new Set([clampDay(firstPayDay), clampDay(secondPayDay)])
  ).sort((a, b) => a - b);

  let year = fromDate.getFullYear();
  let month = fromDate.getMonth();

  while (result.length < count) {
    for (const requestedDay of orderedDays) {
      const date = createClampedMonthDate(year, month, requestedDay);

      if (date >= fromDate) {
        result.push(date);

        if (result.length >= count) {
          break;
        }
      }
    }

    month += 1;

    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return result;
}

function generateMonthlyDates(
  requestedDay: number,
  fromDate: Date,
  count: number
): Date[] {
  const result: Date[] = [];

  let year = fromDate.getFullYear();
  let month = fromDate.getMonth();

  while (result.length < count) {
    const date = createClampedMonthDate(year, month, clampDay(requestedDay));

    if (date >= fromDate) {
      result.push(date);
    }

    month += 1;

    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return result;
}

function createClampedMonthDate(
  year: number,
  month: number,
  requestedDay: number
) {
  const finalDayOfMonth = new Date(year, month + 1, 0).getDate();

  return new Date(year, month, Math.min(requestedDay, finalDayOfMonth));
}

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toSafeNumber(value: any) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toSafeTimestamp(value: any, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampDay(value: any) {
  const number = Math.round(Number(value));

  if (!Number.isFinite(number)) {
    return 1;
  }

  return Math.min(31, Math.max(1, number));
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return startOfDay(nextDate);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTodayISO() {
  return toISODate(new Date());
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseISODate(value: string) {
  if (!isISODate(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isISODate(value: any) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
