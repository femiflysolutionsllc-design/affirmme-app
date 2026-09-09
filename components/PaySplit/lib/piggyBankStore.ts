export const PIGGY_BANK_STORAGE_KEY =
  "paysplit_piggybank_v2";

export const PIGGY_BANK_UPDATED_EVENT =
  "paysplit:piggy-bank-updated";

export type PiggyBankDeposit = {
  id: string;
  amount: number;
  source: string;
  date: string;
};

export type PiggyBankGoal = {
  id: string;
  name: string;

  targetAmount: number;
  savedAmount: number;

  targetDate?: string;

  /**
   * Legacy recommendation amounts.
   *
   * We are keeping these temporarily
   * because the existing Piggy Bank UI
   * still uses Paycheck A / B.
   *
   * Later these will transition to
   * Pay Window allocation rules.
   */
  autoA?: number;
  autoB?: number;

  completedAt?: string;

  icon?: string;

  priority?:
    | "High"
    | "Medium"
    | "Low";

  category?: string;

  image?: string;

  deposits?: PiggyBankDeposit[];
};

export const DEFAULT_PIGGY_BANK_GOALS:
  PiggyBankGoal[] = [
  {
    id: "g1",
    name: "Emergency Fund",
    targetAmount: 1000,
    savedAmount: 150,
    targetDate: "",
    autoA: 25,
    autoB: 25,
    deposits: [],
    icon: "🏥",
    priority: "High",
    category: "Emergency",
    image: "🛡️",
  },

  {
    id: "g2",
    name: "Grooming / Self-care",
    targetAmount: 300,
    savedAmount: 0,
    targetDate: "",
    autoA: 20,
    autoB: 0,
    deposits: [],
    icon: "💄",
    priority: "Medium",
    category: "Self Care",
    image: "💄",
  },
];

function safeMoney(
  value: unknown
) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? Math.max(
        0,
        number
      )
    : 0;
}

function normalizeDeposit(
  item: unknown
): PiggyBankDeposit | null {
  const deposit =
    item as Partial<PiggyBankDeposit>;

  if (
    !deposit ||
    typeof deposit.id !==
      "string"
  ) {
    return null;
  }

  return {
    id:
      deposit.id,

    amount:
      safeMoney(
        deposit.amount
      ),

    source:
      typeof deposit.source ===
      "string"
        ? deposit.source
        : "Other",

    date:
      typeof deposit.date ===
      "string"
        ? deposit.date
        : "",
  };
}

function normalizeGoal(
  item: unknown
): PiggyBankGoal | null {
  const goal =
    item as Partial<PiggyBankGoal>;

  if (
    !goal ||
    typeof goal.id !==
      "string"
  ) {
    return null;
  }

  return {
    id:
      goal.id,

    name:
      typeof goal.name ===
      "string"
        ? goal.name
        : "Savings Goal",

    targetAmount:
      safeMoney(
        goal.targetAmount
      ),

    savedAmount:
      safeMoney(
        goal.savedAmount
      ),

    targetDate:
      typeof goal.targetDate ===
      "string"
        ? goal.targetDate
        : "",

    autoA:
      safeMoney(
        goal.autoA
      ),

    autoB:
      safeMoney(
        goal.autoB
      ),

    completedAt:
      typeof goal.completedAt ===
      "string"
        ? goal.completedAt
        : "",

    icon:
      typeof goal.icon ===
      "string"
        ? goal.icon
        : "🐷",

    priority:
      goal.priority === "High" ||
      goal.priority === "Low" ||
      goal.priority === "Medium"
        ? goal.priority
        : "Medium",

    category:
      typeof goal.category ===
      "string"
        ? goal.category
        : "Custom",

    image:
      typeof goal.image ===
      "string"
        ? goal.image
        : "🐷",

    deposits:
      Array.isArray(
        goal.deposits
      )
        ? goal.deposits
            .map(
              normalizeDeposit
            )
            .filter(
              (
                deposit
              ): deposit is PiggyBankDeposit =>
                Boolean(
                  deposit
                )
            )
        : [],
  };
}

export function loadPiggyBankGoals():
  PiggyBankGoal[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        PIGGY_BANK_STORAGE_KEY
      );

      if (!raw) {
        return DEFAULT_PIGGY_BANK_GOALS;
      }

    const parsed =
      JSON.parse(raw);

      if (
        !Array.isArray(parsed) ||
        parsed.length === 0
      ) {
        return DEFAULT_PIGGY_BANK_GOALS;
      }

    return parsed
      .map(
        normalizeGoal
      )
      .filter(
        (
          goal
        ): goal is PiggyBankGoal =>
          Boolean(goal)
      );
    } catch {
      return DEFAULT_PIGGY_BANK_GOALS;
    }
  }

export function savePiggyBankGoals(
  goals: PiggyBankGoal[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const normalized =
    goals
      .map(
        normalizeGoal
      )
      .filter(
        (
          goal
        ): goal is PiggyBankGoal =>
          Boolean(goal)
      );

  try {
    window.localStorage.setItem(
      PIGGY_BANK_STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        PIGGY_BANK_UPDATED_EVENT,
        {
          detail:
            normalized,
        }
      )
    );
  } catch {
    // Keep PaySplit usable
    // if browser storage fails.
  }
}

/**
 * Amount still needed to complete
 * one savings goal.
 */
export function getPiggyGoalRemaining(
  goal: PiggyBankGoal
) {
  return Math.max(
    0,
    safeMoney(
      goal.targetAmount
    ) -
      safeMoney(
        goal.savedAmount
      )
  );
}

/**
 * Existing legacy recommendation logic.
 *
 * We preserve this so the current Piggy
 * Bank screen does not suddenly behave
 * differently while we transition to
 * Pay Windows.
 */
export function getRecommendedPiggySave(
  goal: PiggyBankGoal
) {
  const remaining =
    getPiggyGoalRemaining(
      goal
    );

  if (
    remaining <=
    0
  ) {
    return 0;
  }

  return Math.ceil(
    remaining / 10
  );
}

export function getRecommendedPiggyA(
  goal: PiggyBankGoal
) {
  const saved =
    safeMoney(
      goal.autoA
    );

  return saved > 0
    ? saved
    : getRecommendedPiggySave(
        goal
      );
}

export function getRecommendedPiggyB(
  goal: PiggyBankGoal
) {
  const saved =
    safeMoney(
      goal.autoB
    );

  return saved > 0
    ? saved
    : getRecommendedPiggySave(
        goal
      );
}

/**
 * Total legacy Piggy Bank recommendation
 * for each half-month window.
 *
 * This is the bridge from the existing
 * A / B Piggy Bank model into the new
 * Pay Window architecture.
 */
export function getPiggyBankWindowTotals(
  goals: PiggyBankGoal[]
) {
  return goals.reduce(
    (
      totals,
      goal
    ) => {
      const remaining =
        getPiggyGoalRemaining(
          goal
        );

      if (
        remaining <=
        0
      ) {
        return totals;
      }

      totals.A +=
        getRecommendedPiggyA(
          goal
        );

      totals.B +=
        getRecommendedPiggyB(
          goal
        );

      return totals;
    },
    {
      A: 0,
      B: 0,
    }
  );
}