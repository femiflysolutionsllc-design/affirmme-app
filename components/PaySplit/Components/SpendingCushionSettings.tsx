"use client";

import React from "react";

import CurrencyInput from "../paysplit-ui/CurrencyInput";

import {
  loadSpendingReserveSettings,
  saveSpendingReserveSettings,
  type SpendingReserveSettings,
} from "../lib/spendingReserve";

type SpendingCushionSettingsProps = {
  onSaved?: (
    settings: SpendingReserveSettings
  ) => void;
};

export default function SpendingCushionSettings({
  onSaved,
}: SpendingCushionSettingsProps) {
  const [
    settings,
    setSettings,
  ] =
    React.useState<SpendingReserveSettings>(() =>
      loadSpendingReserveSettings()
    );

  const [
    hasSaved,
    setHasSaved,
  ] =
    React.useState(false);

  function updateSettings(
    patch: Partial<SpendingReserveSettings>
  ) {
    setSettings(
      (current) => ({
        ...current,
        ...patch,
      })
    );

    setHasSaved(false);
  }

  function handleSave() {
    const normalized:
      SpendingReserveSettings = {
      enabled:
        settings.enabled,

      minimumReservePerWindow:
        Math.max(
          0,
          Number(
            settings.minimumReservePerWindow ||
              0
          )
        ),
    };

    saveSpendingReserveSettings(
      normalized
    );

    setSettings(
      normalized
    );

    setHasSaved(true);

    onSaved?.(
      normalized
    );
  }

  return (
    <section className="spending-cushion-shell rounded-[26px] border-[3px] border-black bg-[#111933] p-5 shadow-[6px_6px_0px_rgba(0,0,0,.75)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
            🛡️ Spending Cushion
          </p>

          <h3 className="mt-2 text-xl font-black uppercase text-white">
            Protect money for everyday life
          </h3>

          <p className="mt-2 max-w-xl text-sm font-semibold text-slate-300">
            PaySplit will try to leave this amount
            untouched in every pay window before
            recommending money for bills.
          </p>
        </div>

        <label className="flex w-fit items-center gap-3 rounded-full border-[3px] border-black bg-[#080A16] px-4 py-2 text-xs font-black uppercase text-white">
          <input
            type="checkbox"
            checked={
              settings.enabled
            }
            onChange={(
              event
            ) =>
              updateSettings({
                enabled:
                  event.target
                    .checked,
              })
            }
            className="h-5 w-5"
          />

          {settings.enabled
            ? "On"
            : "Off"}
        </label>
      </div>

      {settings.enabled && (
        <>
          <div className="mt-5">
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-300">
              Keep Available Per Pay Window
            </label>

            <CurrencyInput
              value={Number(
                settings.minimumReservePerWindow ||
                  0
              )}
              onChange={(
                value
              ) =>
                updateSettings({
                  minimumReservePerWindow:
                    value,
                })
              }
              className="w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-black text-white shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
            />
          </div>

          <div className="mt-4 rounded-2xl border-2 border-black bg-[#16245f] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">
              Example
            </p>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-300">
                  Pay Window Income
                </span>

                <span className="font-black text-white">
                  $5,256.88
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-300">
                  Protected Cushion
                </span>

                <span className="font-black text-amber-300">
                  -
                  {new Intl.NumberFormat(
                    "en-US",
                    {
                      style:
                        "currency",
                      currency:
                        "USD",
                    }
                  ).format(
                    settings.minimumReservePerWindow
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-700 pt-2">
                <span className="font-black uppercase text-slate-300">
                  Safe To Allocate
                </span>

                <span className="font-black text-emerald-300">
                  {new Intl.NumberFormat(
                    "en-US",
                    {
                      style:
                        "currency",
                      currency:
                        "USD",
                    }
                  ).format(
                    Math.max(
                      0,
                      5256.88 -
                        settings.minimumReservePerWindow
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={
          handleSave
        }
        className="mt-5 w-full rounded-2xl border-[3px] border-black bg-emerald-400 px-5 py-3 text-sm font-black uppercase text-black shadow-[4px_4px_0px_black] transition hover:-translate-y-1"
      >
        💾 Save Spending Cushion
      </button>

      {hasSaved && (
        <p className="mt-3 text-center text-xs font-black uppercase text-emerald-300">
          ✅ Spending cushion saved
        </p>
      )}
    </section>
  );
}