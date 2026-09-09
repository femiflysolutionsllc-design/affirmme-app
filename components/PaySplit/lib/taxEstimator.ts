export type PayrollTaxEstimate = {
  federalWithholding: number;

  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;

  totalFica: number;

  /**
   * Federal withholding + FICA.
   * State taxes are NOT included yet.
   */
  totalEstimatedTaxes: number;
};

export type PayrollFrequency =
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly";

export type PayrollFilingStatus =
  | "single"
  | "married_joint"
  | "married_separate"
  | "head_of_household";

type EstimatePayrollTaxesOptions = {
  grossPay: number;

  frequency?: PayrollFrequency;

  filingStatus?: PayrollFilingStatus;

  /**
   * This should eventually come from
   * Form W-4 Step 3.
   *
   * It is an ANNUAL credit amount,
   * not simply the number of dependents.
   */
  w4Step3CreditAmount?: number;

  /**
   * Extra FEDERAL withholding requested
   * per paycheck — Form W-4 Step 4(c).
   */
  extraFederalWithholding?: number;

  /**
   * Social Security wages already earned
   * earlier in the year.
   */
  yearToDateSocialSecurityWages?: number;

  /**
   * Medicare wages already earned earlier
   * in the year.
   */
  yearToDateMedicareWages?: number;

  taxYear?: number;
};

type FederalBracket = {
  minimum: number;
  maximum?: number;
  baseTax: number;
  rate: number;
};

const SOCIAL_SECURITY_RATE_2026 =
  0.062;

const SOCIAL_SECURITY_WAGE_BASE_2026 =
  184_500;

const MEDICARE_RATE_2026 =
  0.0145;

const ADDITIONAL_MEDICARE_RATE =
  0.009;

const ADDITIONAL_MEDICARE_WITHHOLDING_THRESHOLD =
  200_000;

/**
 * 2026 IRS Publication 15-T
 * Standard Withholding Rate Schedules.
 *
 * These are for Form W-4 Step 2
 * NOT checked.
 */

const SINGLE_2026:
  FederalBracket[] = [
  {
    minimum: 0,
    maximum: 7_500,
    baseTax: 0,
    rate: 0,
  },
  {
    minimum: 7_500,
    maximum: 19_900,
    baseTax: 0,
    rate: 0.10,
  },
  {
    minimum: 19_900,
    maximum: 57_900,
    baseTax: 1_240,
    rate: 0.12,
  },
  {
    minimum: 57_900,
    maximum: 113_200,
    baseTax: 5_800,
    rate: 0.22,
  },
  {
    minimum: 113_200,
    maximum: 209_275,
    baseTax: 17_966,
    rate: 0.24,
  },
  {
    minimum: 209_275,
    maximum: 263_725,
    baseTax: 41_024,
    rate: 0.32,
  },
  {
    minimum: 263_725,
    maximum: 648_100,
    baseTax: 58_448,
    rate: 0.35,
  },
  {
    minimum: 648_100,
    baseTax: 192_979.25,
    rate: 0.37,
  },
];

const MARRIED_JOINT_2026:
  FederalBracket[] = [
  {
    minimum: 0,
    maximum: 19_300,
    baseTax: 0,
    rate: 0,
  },
  {
    minimum: 19_300,
    maximum: 44_100,
    baseTax: 0,
    rate: 0.10,
  },
  {
    minimum: 44_100,
    maximum: 120_100,
    baseTax: 2_480,
    rate: 0.12,
  },
  {
    minimum: 120_100,
    maximum: 230_700,
    baseTax: 11_600,
    rate: 0.22,
  },
  {
    minimum: 230_700,
    maximum: 422_850,
    baseTax: 35_932,
    rate: 0.24,
  },
  {
    minimum: 422_850,
    maximum: 531_750,
    baseTax: 82_048,
    rate: 0.32,
  },
  {
    minimum: 531_750,
    maximum: 788_000,
    baseTax: 116_896,
    rate: 0.35,
  },
  {
    minimum: 788_000,
    baseTax: 206_583.50,
    rate: 0.37,
  },
];

const HEAD_OF_HOUSEHOLD_2026:
  FederalBracket[] = [
  {
    minimum: 0,
    maximum: 15_550,
    baseTax: 0,
    rate: 0,
  },
  {
    minimum: 15_550,
    maximum: 33_250,
    baseTax: 0,
    rate: 0.10,
  },
  {
    minimum: 33_250,
    maximum: 83_000,
    baseTax: 1_770,
    rate: 0.12,
  },
  {
    minimum: 83_000,
    maximum: 121_250,
    baseTax: 7_740,
    rate: 0.22,
  },
  {
    minimum: 121_250,
    maximum: 217_300,
    baseTax: 16_155,
    rate: 0.24,
  },
  {
    minimum: 217_300,
    maximum: 271_750,
    baseTax: 39_207,
    rate: 0.32,
  },
  {
    minimum: 271_750,
    maximum: 656_150,
    baseTax: 56_631,
    rate: 0.35,
  },
  {
    minimum: 656_150,
    baseTax: 191_171,
    rate: 0.37,
  },
];

function safeMoney(value: number) {
  return Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function getPayPeriods(
  frequency: PayrollFrequency
) {
  switch (frequency) {
    case "weekly":
      return 52;

    case "biweekly":
      return 26;

    case "semimonthly":
      return 24;

    case "monthly":
      return 12;
  }
}

function getFederalBrackets(
  filingStatus: PayrollFilingStatus
) {
  if (filingStatus === "married_joint") {
    return MARRIED_JOINT_2026;
  }

  if (
    filingStatus ===
    "head_of_household"
  ) {
    return HEAD_OF_HOUSEHOLD_2026;
  }

  /**
   * IRS withholding schedules use the
   * same table for:
   *
   * Single
   * Married Filing Separately
   */
  return SINGLE_2026;
}

function estimateFederalWithholding({
  grossPay,
  frequency,
  filingStatus,
  w4Step3CreditAmount,
  extraFederalWithholding,
}: {
  grossPay: number;
  frequency: PayrollFrequency;
  filingStatus: PayrollFilingStatus;
  w4Step3CreditAmount: number;
  extraFederalWithholding: number;
}) {
  const safeGross =
    safeMoney(grossPay);

  const payPeriods =
    getPayPeriods(frequency);

  /**
   * Worksheet 1A:
   * Annualize the current paycheck.
   */
  const annualWages =
    safeGross *
    payPeriods;

  /**
   * Publication 15-T Worksheet 1A,
   * line 1g.
   *
   * We are currently assuming the
   * Form W-4 Step 2 checkbox is NOT
   * checked.
   */
  const wageAdjustment =
    filingStatus ===
    "married_joint"
      ? 12_900
      : 8_600;

  const adjustedAnnualWages =
    Math.max(
      0,
      annualWages -
        wageAdjustment
    );

  const brackets =
    getFederalBrackets(
      filingStatus
    );

  const bracket =
    brackets.find((item) => {
      if (
        item.maximum === undefined
      ) {
        return (
          adjustedAnnualWages >=
          item.minimum
        );
      }

      return (
        adjustedAnnualWages >=
          item.minimum &&
        adjustedAnnualWages <
          item.maximum
      );
    });

  if (!bracket) {
    return 0;
  }

  const annualTentativeTax =
    bracket.baseTax +
    (
      adjustedAnnualWages -
      bracket.minimum
    ) *
      bracket.rate;

  const tentativePerPaycheck =
    annualTentativeTax /
    payPeriods;

  /**
   * W-4 Step 3 is an ANNUAL credit
   * amount. Publication 15-T divides
   * this by the number of pay periods.
   */
  const creditPerPaycheck =
    safeMoney(
      w4Step3CreditAmount
    ) /
    payPeriods;

  const afterCredits =
    Math.max(
      0,
      tentativePerPaycheck -
        creditPerPaycheck
    );

  return Math.max(
    0,
    afterCredits +
      safeMoney(
        extraFederalWithholding
      )
  );
}

export function estimatePayrollTaxes({
  grossPay,
  frequency = "biweekly",
  filingStatus = "single",
  w4Step3CreditAmount = 0,
  extraFederalWithholding = 0,
  yearToDateSocialSecurityWages = 0,
  yearToDateMedicareWages = 0,
  taxYear = 2026,
}: EstimatePayrollTaxesOptions):
  PayrollTaxEstimate {
  const safeGross =
    safeMoney(grossPay);

  const safeSocialSecurityYtd =
    safeMoney(
      yearToDateSocialSecurityWages
    );

  const safeMedicareYtd =
    safeMoney(
      yearToDateMedicareWages
    );

  if (taxYear !== 2026) {
    return {
      federalWithholding: 0,

      socialSecurity: 0,
      medicare: 0,
      additionalMedicare: 0,

      totalFica: 0,

      totalEstimatedTaxes: 0,
    };
  }

  const remainingSocialSecurityWages =
    Math.max(
      0,
      SOCIAL_SECURITY_WAGE_BASE_2026 -
        safeSocialSecurityYtd
    );

  const socialSecurityTaxableWages =
    Math.min(
      safeGross,
      remainingSocialSecurityWages
    );

  const socialSecurity =
    socialSecurityTaxableWages *
    SOCIAL_SECURITY_RATE_2026;

  const medicare =
    safeGross *
    MEDICARE_RATE_2026;

  const medicareWagesBeforeCheck =
    safeMedicareYtd;

  const medicareWagesAfterCheck =
    safeMedicareYtd +
    safeGross;

  const additionalMedicareTaxableWages =
    Math.max(
      0,
      medicareWagesAfterCheck -
        Math.max(
          medicareWagesBeforeCheck,
          ADDITIONAL_MEDICARE_WITHHOLDING_THRESHOLD
        )
    );

  const additionalMedicare =
    additionalMedicareTaxableWages *
    ADDITIONAL_MEDICARE_RATE;

  const totalFica =
    socialSecurity +
    medicare +
    additionalMedicare;

  const federalWithholding =
    estimateFederalWithholding({
      grossPay: safeGross,
      frequency,
      filingStatus,
      w4Step3CreditAmount,
      extraFederalWithholding,
    });

  return {
    federalWithholding,

    socialSecurity,
    medicare,
    additionalMedicare,

    totalFica,

    totalEstimatedTaxes:
      federalWithholding +
      totalFica,
  };
}