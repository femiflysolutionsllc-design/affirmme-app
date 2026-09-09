export const PAYCHECK_OVERRIDES_KEY =
  "paysplit_paycheck_overrides_v1";

export const PAYCHECK_OVERRIDES_UPDATED_EVENT =
  "paysplit:paycheck-overrides-updated";

  export type PaycheckOverride = {
    paycheckId: string;
  
    /**
     * Total hours for the paycheck.
     * Can still be used when the user
     * does not provide a weekly breakdown.
     */
    hoursWorked?: number;
  
    /**
     * Optional weekly breakdown for
     * more accurate overtime estimates.
     */
    week1Hours?: number;
    week2Hours?: number;

    /**
 * Per-paycheck usage for saved pay adjustments.
 *
 * Key = adjustment id
 * Value = eligible hours or flat amount override
 */
adjustmentValues?: Record<
string,
number
>;
  
    /**
     * Optional gross-pay estimate for
     * this specific paycheck.
     */
    estimatedGrossPay?: number;
  
    /**
     * Once the real paycheck is known,
     * this can replace the estimate.
     */
    manualAmountOverride?: number;
  
    updatedAt: number;
  };

function safeNumber(
  value: unknown
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
}

export function loadPaycheckOverrides():
  PaycheckOverride[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        PAYCHECK_OVERRIDES_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(Boolean)
      .map((item) => ({
        paycheckId:
          typeof item?.paycheckId ===
            "string"
            ? item.paycheckId
            : "",

        hoursWorked:
          safeNumber(
            item?.hoursWorked
          ),

          week1Hours:
  safeNumber(
    item?.week1Hours
  ),

week2Hours:
  safeNumber(
    item?.week2Hours
  ),

  adjustmentValues:
  item?.adjustmentValues &&
  typeof item.adjustmentValues === "object"
    ? Object.fromEntries(
        Object.entries(
          item.adjustmentValues
        ).map(([key, value]) => [
          key,
          Number.isFinite(
            Number(value)
          )
            ? Number(value)
            : 0,
        ])
      )
    : {},

        estimatedGrossPay:
          safeNumber(
            item?.estimatedGrossPay
          ),

        manualAmountOverride:
          safeNumber(
            item?.manualAmountOverride
          ),

        updatedAt:
          Number.isFinite(
            Number(item?.updatedAt)
          )
            ? Number(item.updatedAt)
            : Date.now(),
      }))
      .filter(
        (item) =>
          Boolean(item.paycheckId)
      );
  } catch {
    return [];
  }
}

export function savePaycheckOverrides(
  overrides: PaycheckOverride[]
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      PAYCHECK_OVERRIDES_KEY,
      JSON.stringify(overrides)
    );

    window.dispatchEvent(
      new CustomEvent(
        PAYCHECK_OVERRIDES_UPDATED_EVENT,
        {
          detail: overrides,
        }
      )
    );
  } catch {
    // Keep app usable if storage fails.
  }
}

export function getPaycheckOverride(
  paycheckId: string
) {
  return loadPaycheckOverrides().find(
    (override) =>
      override.paycheckId ===
      paycheckId
  );
}

export function setPaycheckOverride(
  paycheckId: string,
  patch: Partial<
    Omit<
      PaycheckOverride,
      "paycheckId" | "updatedAt"
    >
  >
) {
  const existing =
    loadPaycheckOverrides();

  const current =
    existing.find(
      (override) =>
        override.paycheckId ===
        paycheckId
    );

  const nextOverride:
    PaycheckOverride = {
      paycheckId,

      hoursWorked:
        patch.hoursWorked ??
        current?.hoursWorked,

        week1Hours:
        patch.week1Hours ??
        current?.week1Hours,
      
      week2Hours:
        patch.week2Hours ??
        current?.week2Hours,    

        adjustmentValues:
  patch.adjustmentValues ??
  current?.adjustmentValues ??
  {},

      estimatedGrossPay:
        patch.estimatedGrossPay ??
        current?.estimatedGrossPay,

      manualAmountOverride:
        patch.manualAmountOverride ??
        current?.manualAmountOverride,

      updatedAt: Date.now(),
    };

  const next =
    existing.some(
      (override) =>
        override.paycheckId ===
        paycheckId
    )
      ? existing.map((override) =>
          override.paycheckId ===
          paycheckId
            ? nextOverride
            : override
        )
      : [
          ...existing,
          nextOverride,
        ];

  savePaycheckOverrides(next);

  return nextOverride;
}