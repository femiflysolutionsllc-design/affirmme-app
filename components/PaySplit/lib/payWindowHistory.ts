export const PAY_WINDOW_HISTORY_KEY =
  "paysplit_pay_window_history_v1";

export const PAY_WINDOW_HISTORY_UPDATED_EVENT =
  "paysplit:pay-window-history-updated";

export type ClosedPayWindow = {
  id: string;

  payWindowId: string;

  payWindowLabel: string;

  half: "A" | "B";

  startDateISO: string;

  endDateISO: string;

  closedAtISO: string;

  /*
   * What PaySplit expected.
   */
  plannedIncome: number;

  plannedBills: number;

  plannedPiggyBank: number;

  plannedInYourPocket: number;

  /*
   * What actually happened.
   *
   * We keep these separate because
   * later bank integration / Jarvis
   * can reconcile them against reality.
   */
  actualIncome: number;

  actualBillsPaid: number;

  actualPiggySaved: number;

  actualInYourPocket: number;
};

function safeNumber(
  value: unknown
) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function normalizeClosedWindow(
  item: unknown
): ClosedPayWindow | null {
  const record =
    item as Partial<ClosedPayWindow>;

  if (
    !record ||
    typeof record.id !== "string" ||
    typeof record.payWindowId !== "string"
  ) {
    return null;
  }

  return {
    id:
      record.id,

    payWindowId:
      record.payWindowId,

    payWindowLabel:
      typeof record.payWindowLabel ===
      "string"
        ? record.payWindowLabel
        : "Pay Window",

    half:
      record.half === "B"
        ? "B"
        : "A",

    startDateISO:
      typeof record.startDateISO ===
      "string"
        ? record.startDateISO
        : "",

    endDateISO:
      typeof record.endDateISO ===
      "string"
        ? record.endDateISO
        : "",

    closedAtISO:
      typeof record.closedAtISO ===
      "string"
        ? record.closedAtISO
        : "",

    plannedIncome:
      safeNumber(
        record.plannedIncome
      ),

    plannedBills:
      safeNumber(
        record.plannedBills
      ),

    plannedPiggyBank:
      safeNumber(
        record.plannedPiggyBank
      ),

    plannedInYourPocket:
      safeNumber(
        record.plannedInYourPocket
      ),

    actualIncome:
      safeNumber(
        record.actualIncome
      ),

    actualBillsPaid:
      safeNumber(
        record.actualBillsPaid
      ),

    actualPiggySaved:
      safeNumber(
        record.actualPiggySaved
      ),

    actualInYourPocket:
      safeNumber(
        record.actualInYourPocket
      ),
  };
}

export function loadClosedPayWindows():
  ClosedPayWindow[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        PAY_WINDOW_HISTORY_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed
      .map(
        normalizeClosedWindow
      )
      .filter(
        (
          item
        ): item is ClosedPayWindow =>
          Boolean(item)
      );
  } catch {
    return [];
  }
}

export function saveClosedPayWindows(
  windows: ClosedPayWindow[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const normalized =
    windows
      .map(
        normalizeClosedWindow
      )
      .filter(
        (
          item
        ): item is ClosedPayWindow =>
          Boolean(item)
      );

  window.localStorage.setItem(
    PAY_WINDOW_HISTORY_KEY,
    JSON.stringify(
      normalized
    )
  );

  window.dispatchEvent(
    new CustomEvent(
      PAY_WINDOW_HISTORY_UPDATED_EVENT,
      {
        detail:
          normalized,
      }
    )
  );
}

export function closePayWindow(
  window: Omit<
    ClosedPayWindow,
    "id" | "closedAtISO"
  >
) {
  const current =
    loadClosedPayWindows();

  /*
   * A window should only be closed once.
   *
   * If we later support reopening a
   * window, we will handle that through
   * an explicit edit/reopen action.
   */
  const alreadyClosed =
    current.some(
      (item) =>
        item.payWindowId ===
        window.payWindowId
    );

  if (alreadyClosed) {
    return current;
  }

  const closedWindow:
    ClosedPayWindow = {
    ...window,

    id:
      `${window.payWindowId}:${Date.now()}`,

    closedAtISO:
      new Date().toISOString(),
  };

  const next = [
    closedWindow,
    ...current,
  ];

  saveClosedPayWindows(
    next
  );

  return next;
}

export function isPayWindowClosed(
  payWindowId: string
) {
  return loadClosedPayWindows().some(
    (item) =>
      item.payWindowId ===
      payWindowId
  );
}