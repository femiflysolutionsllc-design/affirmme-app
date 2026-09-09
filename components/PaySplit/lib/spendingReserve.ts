import type {
  PayWindow,
} from "./PaycheckPlannerStore";

export const SPENDING_RESERVE_KEY =
  "paysplit_spending_reserve_v1";

export const SPENDING_RESERVE_UPDATED_EVENT =
  "paysplit:spending-reserve-updated";

export type SpendingReserveSettings = {
  enabled: boolean;

  /**
   * Minimum amount PaySplit should try
   * to leave untouched in every pay window.
   */
  minimumReservePerWindow: number;
};

export const DEFAULT_SPENDING_RESERVE_SETTINGS:
  SpendingReserveSettings = {
    enabled: true,

    minimumReservePerWindow: 1000,
  };

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

export function loadSpendingReserveSettings():
  SpendingReserveSettings {
  if (
    typeof window ===
    "undefined"
  ) {
    return DEFAULT_SPENDING_RESERVE_SETTINGS;
  }

  try {
    const raw =
      window.localStorage.getItem(
        SPENDING_RESERVE_KEY
      );

    if (!raw) {
      return DEFAULT_SPENDING_RESERVE_SETTINGS;
    }

    const parsed =
      JSON.parse(raw);

    return {
      enabled:
        parsed?.enabled !==
        false,

      minimumReservePerWindow:
        safeMoney(
          parsed?.minimumReservePerWindow
        ),
    };
  } catch {
    return DEFAULT_SPENDING_RESERVE_SETTINGS;
  }
}

export function saveSpendingReserveSettings(
  settings: SpendingReserveSettings
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const normalized:
    SpendingReserveSettings = {
      enabled:
        settings.enabled !==
        false,

      minimumReservePerWindow:
        safeMoney(
          settings.minimumReservePerWindow
        ),
    };

  try {
    window.localStorage.setItem(
      SPENDING_RESERVE_KEY,
      JSON.stringify(
        normalized
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        SPENDING_RESERVE_UPDATED_EVENT,
        {
          detail:
            normalized,
        }
      )
    );
  } catch {
    // Keep PaySplit usable
    // if storage is unavailable.
  }
}

export function getProtectedReserveForWindow(
  window: PayWindow,
  settings?: SpendingReserveSettings
) {
  const resolvedSettings =
    settings ??
    loadSpendingReserveSettings();

  if (
    !resolvedSettings.enabled
  ) {
    return 0;
  }

  return Math.min(
    safeMoney(
      resolvedSettings.minimumReservePerWindow
    ),
    safeMoney(
      window.totalIncome
    )
  );
}

export function getSafeFundingAvailable({
  window,
  availableBeforeReserve,
  settings,
}: {
  window: PayWindow;

  availableBeforeReserve: number;

  settings?:
    SpendingReserveSettings;
}) {
  const available =
    safeMoney(
      availableBeforeReserve
    );

  const protectedReserve =
    getProtectedReserveForWindow(
      window,
      settings
    );

  return Math.max(
    0,
    available -
      protectedReserve
  );
}