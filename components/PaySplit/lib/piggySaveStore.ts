export const PIGGY_SAVE_KEY =
  "paysplit_piggy_save_v1";

export const PIGGY_SAVE_UPDATED_EVENT =
  "paysplit:piggy-save-updated";

export type PiggySaveEntry = {
  payWindowId: string;

  amount: number;

  updatedAt: number;
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

function normalizePiggySaveEntry(
  item: unknown
): PiggySaveEntry | null {
  const entry =
    item as Partial<PiggySaveEntry>;

  if (
    !entry ||
    typeof entry.payWindowId !==
      "string"
  ) {
    return null;
  }

  return {
    payWindowId:
      entry.payWindowId,

    amount:
      safeMoney(
        entry.amount
      ),

    updatedAt:
      Number.isFinite(
        Number(
          entry.updatedAt
        )
      )
        ? Number(
            entry.updatedAt
          )
        : Date.now(),
  };
}

export function loadPiggySaves():
  PiggySaveEntry[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        PIGGY_SAVE_KEY
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
        normalizePiggySaveEntry
      )
      .filter(
        (
          item
        ): item is PiggySaveEntry =>
          Boolean(item)
      );
  } catch {
    return [];
  }
}

export function savePiggySaves(
  entries: PiggySaveEntry[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const normalized =
    entries
      .map(
        normalizePiggySaveEntry
      )
      .filter(
        (
          item
        ): item is PiggySaveEntry =>
          Boolean(item)
      );

  try {
    window.localStorage.setItem(
      PIGGY_SAVE_KEY,
      JSON.stringify(
        normalized
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        PIGGY_SAVE_UPDATED_EVENT,
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

export function getPiggySaveForWindow(
  payWindowId: string
) {
  const entries =
    loadPiggySaves();

  const entry =
    entries.find(
      (item) =>
        item.payWindowId ===
        payWindowId
    );

  return entry
    ? safeMoney(
        entry.amount
      )
    : null;
}

export function setPiggySaveForWindow(
  payWindowId: string,
  amount: number
) {
  const entries =
    loadPiggySaves();

  const normalizedAmount =
    safeMoney(
      amount
    );

  const existingIndex =
    entries.findIndex(
      (item) =>
        item.payWindowId ===
        payWindowId
    );

  const nextEntry:
    PiggySaveEntry = {
    payWindowId,

    amount:
      normalizedAmount,

    updatedAt:
      Date.now(),
  };

  let next:
    PiggySaveEntry[];

  if (
    existingIndex >=
    0
  ) {
    next =
      entries.map(
        (
          item,
          index
        ) =>
          index ===
          existingIndex
            ? nextEntry
            : item
      );
  } else {
    next = [
      nextEntry,
      ...entries,
    ];
  }

  savePiggySaves(
    next
  );

  return nextEntry;
}

export function removePiggySaveForWindow(
  payWindowId: string
) {
  const next =
    loadPiggySaves().filter(
      (item) =>
        item.payWindowId !==
        payWindowId
    );

  savePiggySaves(
    next
  );
}

export function clearAllPiggySaves() {
  savePiggySaves([]);
}