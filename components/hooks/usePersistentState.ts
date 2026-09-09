"use client";

import * as React from "react";

const PERSISTENT_STATE_EVENT =
  "affirmme:persistent-state-updated";

type PersistentStateEventDetail = {
  key: string;
  value: unknown;
};

export function usePersistentState<T>(
  key: string,
  initialValue: T
) {
  const [value, setValue] =
    React.useState<T>(initialValue);

  const hasLoaded =
    React.useRef(false);

  const skipFirstWrite =
    React.useRef(false);

  const applyingExternalUpdate =
    React.useRef(false);

  /*
   * Load the saved value whenever the key changes.
   */
  React.useEffect(() => {
    hasLoaded.current = false;
    skipFirstWrite.current = false;

    try {
      const raw =
        window.localStorage.getItem(key);

      if (raw !== null) {
        setValue(
          JSON.parse(raw) as T
        );
      } else {
        setValue(initialValue);
      }
    } catch {
      setValue(initialValue);
    }

    hasLoaded.current = true;
    skipFirstWrite.current = true;
  }, [key]);

  /*
   * Listen for updates from:
   *
   * 1. Other browser tabs/windows
   * 2. Other AffirmMe components in this same tab
   */
  React.useEffect(() => {
    function handleStorage(
      event: StorageEvent
    ) {
      if (event.key !== key) {
        return;
      }

      try {
        applyingExternalUpdate.current =
          true;

        if (event.newValue === null) {
          setValue(initialValue);
          return;
        }

        setValue(
          JSON.parse(
            event.newValue
          ) as T
        );
      } catch {
        // Ignore malformed stored data.
      }
    }

    function handlePersistentStateUpdate(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<PersistentStateEventDetail>;

      if (
        customEvent.detail?.key !==
        key
      ) {
        return;
      }

      applyingExternalUpdate.current =
        true;

      setValue(
        customEvent.detail.value as T
      );
    }

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      PERSISTENT_STATE_EVENT,
      handlePersistentStateUpdate
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        PERSISTENT_STATE_EVENT,
        handlePersistentStateUpdate
      );
    };
  }, [key]);

  /*
   * Save local changes and notify every other
   * AffirmMe component using the same key.
   */
  React.useEffect(() => {
    if (!hasLoaded.current) {
      return;
    }

    /*
     * Prevent the initial default value from
     * overwriting what we just loaded.
     */
    if (skipFirstWrite.current) {
      skipFirstWrite.current =
        false;
      return;
    }

    /*
     * An update received from another component
     * should not immediately be written back again.
     */
    if (
      applyingExternalUpdate.current
    ) {
      applyingExternalUpdate.current =
        false;
      return;
    }

    try {
      const serialized =
        JSON.stringify(value);

      const currentStoredValue =
        window.localStorage.getItem(
          key
        );

      /*
       * Avoid unnecessary writes/events when the
       * stored value is already identical.
       */
      if (
        currentStoredValue ===
        serialized
      ) {
        return;
      }

      window.localStorage.setItem(
        key,
        serialized
      );

      window.dispatchEvent(
        new CustomEvent<PersistentStateEventDetail>(
          PERSISTENT_STATE_EVENT,
          {
            detail: {
              key,
              value,
            },
          }
        )
      );
    } catch {
      // Keep AffirmMe usable if browser
      // storage is unavailable.
    }
  }, [key, value]);

  return [
    value,
    setValue,
  ] as const;
}