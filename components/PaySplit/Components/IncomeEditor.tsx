"use client";

import { useEffect, useState } from "react";

import {
  estimateHourlyGrossPay,
  loadIncomeSources,
  saveIncomeSources,
  type IncomeSource,
} from "../lib/incomeStore";

import { estimatePayrollTaxes } from "../lib/taxEstimator";

type IncomeEditorProps = {
  source: IncomeSource;
  userStage:
  | "junior_high"
  | "high_school"
  | "college"
  | "adult";
  onSave: (updatedSource: IncomeSource) => void;
  onCancel: () => void;
};

function money(value: number) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safeValue);
}

export default function IncomeEditor({
  source,
  userStage,
  onSave,
  onCancel,
}: IncomeEditorProps) {
  const [draft, setDraft] =
    useState<IncomeSource>(source);

  useEffect(() => {
    setDraft(source);
  }, [source]);

  function updateDraft(
    updates: Partial<IncomeSource>
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...updates,
    }));
  }

  function saveProfileSettings() {
    const cleanedName = draft.name.trim();
  
    if (!cleanedName) {
      window.alert(
        "Please enter an income source name."
      );
  
      return false;
    }
  
    const updatedSource: IncomeSource = {
      ...draft,
      name: cleanedName,
      updatedAt: Date.now(),
    };
  
    const currentSources =
      loadIncomeSources();
  
    const sourceExists =
      currentSources.some(
        (source) =>
          source.id === updatedSource.id
      );
  
    const nextSources =
      sourceExists
        ? currentSources.map((source) =>
            source.id === updatedSource.id
              ? updatedSource
              : source
          )
        : [
            ...currentSources,
            updatedSource,
          ];
  
    saveIncomeSources(nextSources);
  
    setDraft(updatedSource);
  
    return true;
  }

  function handleFinalSave() {
    const cleanedName = draft.name.trim();
  
    if (!cleanedName) {
      window.alert(
        "Please enter an income source name."
      );
      return;
    }
  
    if (
      draft.payType === "fixed" &&
      (
        !Number.isFinite(
          draft.estimatedNetPay
        ) ||
        draft.estimatedNetPay < 0
      )
    ) {
      window.alert(
        "Please enter a valid net income amount."
      );
      return;
    }
  
    if (!draft.startDate) {
      window.alert(
        "Please select a start date before activating this income schedule."
      );
      return;
    }
  
    onSave({
      ...draft,
      name: cleanedName,
      updatedAt: Date.now(),
    });
  }

  const estimatedBaseGross =
  draft.payType === "hourly"
    ? estimateHourlyGrossPay(
        draft.hourlyRate ?? 0,
        draft.expectedHoursPerPaycheck ?? 0,

        /*
         * Do NOT apply weekly overtime
         * to total pay-period hours here.
         *
         * Actual paycheck estimates will
         * calculate OT from Week 1 / Week 2.
         */
        false,

        draft.overtimeMultiplier ?? 1.5,
        draft.overtimeThresholdHours ?? 40
      )
    : 0;

  const estimatedAdjustmentPay =
    draft.payType === "hourly"
      ? (draft.payAdjustments ?? [])
          .filter(
            (adjustment) =>
              adjustment.active !== false
          )
          .reduce(
            (total, adjustment) => {
              if (
                adjustment.type === "flat"
              ) {
                return (
                  total +
                  adjustment.amount
                );
              }

              return (
                total +
                adjustment.amount *
                  (draft.expectedHoursPerPaycheck ??
                    0)
              );
            },
            0
          )
      : 0;

  const estimatedGross =
    estimatedBaseGross +
    estimatedAdjustmentPay;

    const [isTaxProfileEditing, setIsTaxProfileEditing] =
    useState(true);

    const [
      editingAdjustmentId,
      setEditingAdjustmentId,
    ] = useState<string | null>(null);

    const [
      editingDeductionId,
      setEditingDeductionId,
    ] = useState<string | null>(null);

      const estimatedPayrollTaxes =
      draft.payType === "hourly" &&
      draft.taxProfile?.mode === "automatic"
        ? estimatePayrollTaxes({
            grossPay: estimatedGross,
    
            frequency:
              draft.frequency,
    
            filingStatus:
              draft.taxProfile?.filingStatus ??
              "single",
    
            extraFederalWithholding:
              draft.taxProfile
                ?.extraFederalWithholding ??
              0,
    
            taxYear:
              draft.taxProfile?.taxYear ??
              2026,
          })
        : undefined;
  
  const automaticEstimatedTaxes =
    estimatedPayrollTaxes
      ?.totalEstimatedTaxes ?? 0;

      const customEstimatedDeductions =
      draft.payType === "hourly"
        ? (draft.payrollDeductions ?? [])
            .filter(
              (deduction) =>
                deduction.active !== false
            )
            .reduce(
              (total, deduction) => {
                if (
                  deduction.type === "percent"
                ) {
                  return (
                    total +
                    estimatedGross *
                      (deduction.amount / 100)
                  );
                }
    
                return (
                  total +
                  deduction.amount
                );
              },
              0
            )
        : 0;
  
  
  const totalEstimatedDeductions =
    customEstimatedDeductions +
    automaticEstimatedTaxes;

  const estimatedTakeHome =
    Math.max(
      0,
      estimatedGross -
        totalEstimatedDeductions
    );

  return (
    <div className="income-editor-shell overflow-hidden rounded-[28px] border-4 border-black bg-[#141d4d] shadow-[8px_8px_0px_#000]">
      {/* HEADER */}
      <div className="border-b-4 border-black bg-yellow-400 px-5 py-4 text-black">
        <p className="text-xs font-black uppercase tracking-widest">
          Edit Income Source
        </p>

        <h3 className="text-xl font-black">
          {draft.name ||
            "Untitled Income"}
        </h3>
      </div>

      <div className="space-y-5 bg-[#1d2a69] p-5">
        {/* INCOME SOURCE */}
        <div>
          <label
            htmlFor={`income-name-${source.id}`}
            className="mb-2 block text-sm font-black uppercase text-white"
          >
            🏢 Income Source
          </label>

          <input
  id={`income-name-${source.id}`}
  type="text"
  value={draft.name}
  onChange={(event) =>
    updateDraft({
      name: event.target.value,
    })
  }
  placeholder="Example: Primary Income"
  className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none placeholder:text-gray-400 focus:ring-4 focus:ring-yellow-300"
/>
        </div>

        {/* INCOME SOURCE TYPE */}
        <div>
          <label
            htmlFor={`income-source-type-${source.id}`}
            className="mb-2 block text-sm font-black uppercase text-white"
          >
            💰 Where Does This Money Come From?
          </label>

          <select
            id={`income-source-type-${source.id}`}
            value={draft.sourceType}
            onChange={(event) => {
              const sourceType =
                event.target
                  .value as IncomeSource["sourceType"];
            
              updateDraft({
                sourceType,
            
                recurrence:
                  sourceType === "gift" ||
                  sourceType === "odd_job"
                    ? "one_time"
                    : "recurring",
            
                ...(sourceType !== "employment"
                  ? {
                      payType: "fixed" as const,
                    }
                  : {}),
              });
            }}
            className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
          >
            {userStage !== "junior_high" && (
  <option value="employment">
    💼 Job / Employment
  </option>
)}

{userStage === "adult" && (
  <option value="business">
    🏢 Business / Self-Employed
  </option>
)}

            <option value="allowance">
              💰 Allowance
            </option>

            <option value="gift">
              🎁 Gift
            </option>

            <option value="odd_job">
              🛠️ Odd Job / Side Money
            </option>

            <option value="other">
              ➕ Other Income
            </option>
          </select>

          <p className="mt-2 text-xs font-semibold text-blue-200">
            You can add more than one type of income.
          </p>
        </div>

        {/* INCOME SCHEDULE TYPE */}
        {draft.sourceType !== "employment" && (
          <div>
            <label
              htmlFor={`income-recurrence-${source.id}`}
              className="mb-2 block text-sm font-black uppercase text-white"
            >
              🔁 Is This Recurring?
            </label>

            <select
              id={`income-recurrence-${source.id}`}
              value={draft.recurrence}
              onChange={(event) =>
                updateDraft({
                  recurrence:
                    event.target
                      .value as IncomeSource["recurrence"],
                })
              }
              className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
            >
              <option value="recurring">
                🔁 Recurring Income
              </option>

              <option value="one_time">
                1️⃣ One-Time Income
              </option>
            </select>

            <p className="mt-2 text-xs font-semibold text-blue-200">
              {draft.recurrence === "one_time"
                ? "This income will be added once on the selected date."
                : "This income will repeat using the schedule below."}
            </p>
          </div>
        )}

    {/* PAY TYPE */}
{draft.sourceType === "employment" && (
  <div>
    <label
      htmlFor={`income-pay-type-${source.id}`}
      className="mb-2 block text-sm font-black uppercase text-white"
    >
      💼 Pay Type
    </label>

    <select
      id={`income-pay-type-${source.id}`}
      value={draft.payType}
      onChange={(event) =>
        updateDraft({
          payType:
            event.target
              .value as IncomeSource["payType"],
        })
      }
      className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
    >
      <option value="fixed">
        Fixed / Salary
      </option>

      <option value="hourly">
        Hourly
      </option>
    </select>
  </div>
)}

        {/* FIXED / SIMPLE INCOME AMOUNT */}
               {draft.payType === "fixed" && (
          <div>
            <label
              htmlFor={`income-pay-${source.id}`}
              className="mb-2 block text-sm font-black uppercase text-white"
            >
              {draft.sourceType === "allowance"
                ? "💰 Allowance Amount"
                : draft.sourceType === "gift"
                ? "🎁 Gift Amount"
                : draft.sourceType === "odd_job"
                ? "🛠️ Expected Amount"
                : draft.sourceType === "business"
                ? "🏢 Estimated Income"
                : draft.sourceType === "other"
                ? "💵 Estimated Amount"
                : "💵 Estimated Net Pay"}
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-black text-black">
                $
              </span>

              <input
                id={`income-pay-${source.id}`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={
                  draft.estimatedNetPay === 0
                    ? ""
                    : draft.estimatedNetPay
                }
                placeholder="0.00"
                onChange={(event) => {
                  const amount = Number(
                    event.target.value
                  );

                  updateDraft({
                    estimatedNetPay:
                      Number.isFinite(amount)
                        ? amount
                        : 0,
                  });
                }}
                className="w-full rounded-2xl border-3 border-black bg-white py-3 pl-9 pr-4 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
              />
            </div>

            {draft.sourceType !== "employment" && (
              <p className="mt-2 text-xs font-semibold text-blue-200">
                {draft.sourceType === "allowance"
                  ? "Enter the amount normally received each allowance period."
                  : draft.sourceType === "gift"
                  ? "Enter the amount expected for this gift."
                  : draft.sourceType === "odd_job"
                  ? "Enter the amount normally earned from this work."
                  : draft.sourceType === "business"
                  ? "Enter the amount you expect to receive for this income period."
                  : "Enter the amount you expect to receive."}
              </p>
            )}
          </div>
        )}

        {/* HOURLY PROFILE */}
        {draft.sourceType === "employment" &&
  draft.payType === "hourly" && (
          <>
            {/* RATE + HOURS */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`income-hourly-rate-${source.id}`}
                  className="mb-2 block text-sm font-black uppercase text-white"
                >
                  💵 Hourly Rate
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-black text-black">
                    $
                  </span>

                  <input
                    id={`income-hourly-rate-${source.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={
                      draft.hourlyRate ??
                      0
                    }
                    onChange={(
                      event
                    ) =>
                      updateDraft({
                        hourlyRate:
                          Number(
                            event.target
                              .value
                          ) || 0,
                      })
                    }
                    className="w-full rounded-2xl border-3 border-black bg-white py-3 pl-9 pr-4 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`income-expected-hours-${source.id}`}
                  className="mb-2 block text-sm font-black uppercase text-white"
                >
                  ⏱ Typical Hours /
                  Check
                </label>

                <input
                  id={`income-expected-hours-${source.id}`}
                  type="number"
                  min="0"
                  step="0.25"
                  inputMode="decimal"
                  value={
                    draft.expectedHoursPerPaycheck ??
                    80
                  }
                  onChange={(
                    event
                  ) =>
                    updateDraft({
                      expectedHoursPerPaycheck:
                        Number(
                          event.target
                            .value
                        ) || 0,
                    })
                  }
                  className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
                />
              </div>
            </div>

            {/* OVERTIME */}
            <div className="space-y-4 rounded-2xl border-2 border-black bg-[#16245f] p-4">
              <label className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase text-white">
                    ⏱ Overtime
                  </p>

                  <p className="mt-1 text-xs font-semibold text-blue-200">
                    Use your saved
                    overtime rules when
                    estimating hourly
                    pay.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={
                    draft.overtimeEnabled !==
                    false
                  }
                  onChange={(
                    event
                  ) =>
                    updateDraft({
                      overtimeEnabled:
                        event.target
                          .checked,
                    })
                  }
                  className="h-5 w-5"
                />
              </label>

              {draft.overtimeEnabled !==
                false && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`income-ot-threshold-${source.id}`}
                      className="mb-2 block text-sm font-black uppercase text-white"
                    >
                      OT After Hours /
                      Week
                    </label>

                    <input
                      id={`income-ot-threshold-${source.id}`}
                      type="number"
                      min="0"
                      step="0.25"
                      value={
                        draft.overtimeThresholdHours ??
                        40
                      }
                      onChange={(
                        event
                      ) =>
                        updateDraft({
                          overtimeThresholdHours:
                            Number(
                              event
                                .target
                                .value
                            ) || 0,
                        })
                      }
                      className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`income-ot-multiplier-${source.id}`}
                      className="mb-2 block text-sm font-black uppercase text-white"
                    >
                      OT Multiplier
                    </label>

                    <input
                      id={`income-ot-multiplier-${source.id}`}
                      type="number"
                      min="1"
                      step="0.1"
                      value={
                        draft.overtimeMultiplier ??
                        1.5
                      }
                      onChange={(
                        event
                      ) =>
                        updateDraft({
                          overtimeMultiplier:
                            Number(
                              event
                                .target
                                .value
                            ) || 1,
                        })
                      }
                      className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
                    />
                  </div>
                </div>
              )}
            </div>


            {/* TAX ESTIMATE PROFILE */}
            {isTaxProfileEditing ? (
  <>
<div className="space-y-4 rounded-2xl border-2 border-black bg-[#16245f] p-4">
  <div>
    <p className="text-sm font-black uppercase text-white">
      🧾 Tax Estimate
    </p>

    <p className="mt-1 text-xs font-semibold text-blue-200">
      Save your tax setup once and reuse it for future paycheck estimates.
    </p>
  </div>

  <div>
    <label className="mb-2 block text-xs font-black uppercase text-white">
      Calculation Method
    </label>

    <select
      value={
        draft.taxProfile?.mode ??
        "automatic"
      }
      onChange={(event) =>
        updateDraft({
          taxProfile: {
            ...(draft.taxProfile ?? {
              mode: "automatic",
              filingStatus: "single",
              stateCode: "",
              dependents: 0,
              extraFederalWithholding: 0,
              taxYear: 2026,
            }),
            mode:
              event.target.value ===
              "manual"
                ? "manual"
                : "automatic",
          },
        })
      }
      className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
    >
      <option value="automatic">
        Automatic Estimate
      </option>

      <option value="manual">
        Manual
      </option>
    </select>
  </div>

  {draft.taxProfile?.mode !== "manual" && (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-black uppercase text-white">
            Filing Status
          </label>

          <select
            value={
              draft.taxProfile
                ?.filingStatus ??
              "single"
            }
            onChange={(event) =>
              updateDraft({
                taxProfile: {
                  ...(draft.taxProfile ?? {
                    mode: "automatic",
                    filingStatus:
                      "single",
                    stateCode: "",
                    dependents: 0,
                    extraFederalWithholding:
                      0,
                    taxYear: 2026,
                  }),
                  filingStatus:
                    event.target
                      .value as NonNullable<
                      IncomeSource["taxProfile"]
                    >["filingStatus"],
                },
              })
            }
            className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
          >
            <option value="single">
              Single
            </option>

            <option value="married_joint">
              Married Filing Jointly
            </option>

            <option value="married_separate">
              Married Filing Separately
            </option>

            <option value="head_of_household">
              Head of Household
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase text-white">
            State
          </label>

          <input
            type="text"
            maxLength={2}
            placeholder="FL"
            value={
              draft.taxProfile
                ?.stateCode ?? ""
            }
            onChange={(event) =>
              updateDraft({
                taxProfile: {
                  ...(draft.taxProfile ?? {
                    mode: "automatic",
                    filingStatus:
                      "single",
                    stateCode: "",
                    dependents: 0,
                    extraFederalWithholding:
                      0,
                    taxYear: 2026,
                  }),
                  stateCode:
                    event.target.value
                      .toUpperCase()
                      .slice(0, 2),
                },
              })
            }
            className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold uppercase text-black"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-black uppercase text-white">
            Dependents
          </label>

          <input
            type="number"
            min="0"
            step="1"
            value={
              draft.taxProfile
                ?.dependents ?? 0
            }
            onChange={(event) =>
              updateDraft({
                taxProfile: {
                  ...(draft.taxProfile ?? {
                    mode: "automatic",
                    filingStatus:
                      "single",
                    stateCode: "",
                    dependents: 0,
                    extraFederalWithholding:
                      0,
                    taxYear: 2026,
                  }),
                  dependents:
                    Math.max(
                      0,
                      Number(
                        event.target
                          .value
                      ) || 0
                    ),
                },
              })
            }
            className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase text-white">
            Extra Federal Withholding
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-black text-black">
              $
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                draft.taxProfile
                  ?.extraFederalWithholding ??
                0
              }
              onChange={(event) =>
                updateDraft({
                  taxProfile: {
                    ...(draft.taxProfile ?? {
                      mode: "automatic",
                      filingStatus:
                        "single",
                      stateCode: "",
                      dependents: 0,
                      extraFederalWithholding:
                        0,
                      taxYear: 2026,
                    }),
                    extraFederalWithholding:
                      Math.max(
                        0,
                        Number(
                          event.target
                            .value
                        ) || 0
                      ),
                  },
                })
              }
              className="w-full rounded-xl border-2 border-black bg-white py-2 pl-8 pr-3 font-bold text-black"
            />
          </div>
        </div>
      </div>
    </>
  )}

  <button
    type="button"
    onClick={() => {
      const saved =
        saveProfileSettings();
    
      if (saved) {
        setIsTaxProfileEditing(false);
      }
    }}
    className="rounded-xl border-[3px] border-black bg-emerald-400 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
  >
    Save Tax Profile
  </button>
</div>
</>
) : (

  <div className="rounded-2xl border-[3px] border-black bg-[#0F5132] p-4 text-white shadow-[4px_4px_0px_black]">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
          ✅ Tax Profile Saved
        </p>

        <p className="mt-2 text-sm font-black">
          {draft.taxProfile?.mode === "manual"
            ? "Manual tax setup"
            : "Automatic tax estimate"}
        </p>

        {draft.taxProfile?.mode !== "manual" && (
          <p className="mt-1 text-xs font-semibold text-emerald-100">
            {draft.taxProfile?.filingStatus
              ?.replaceAll("_", " ") || "Single"}
            {" • "}
            {draft.taxProfile?.stateCode || "No state set"}
            {" • "}
            {draft.taxProfile?.dependents ?? 0} dependent
            {(draft.taxProfile?.dependents ?? 0) === 1
              ? ""
              : "s"}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          setIsTaxProfileEditing(true)
        }
        className="w-fit rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
      >
        ✏️ Edit
      </button>
    </div>
  </div>
)}

           {/* DIFFERENTIALS */}
<div className="space-y-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-black uppercase text-white">
        🌙 Differentials & Additional Pay
      </p>

      <p className="mt-1 text-xs font-semibold text-blue-200">
        Save the extra-pay rules that normally apply to this job.
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        const nextAdjustment = {
          id: crypto.randomUUID(),
          name: "",
          type: "hourly" as const,
          amount: 0,
          active: true,
        };

        updateDraft({
          payAdjustments: [
            ...(draft.payAdjustments ?? []),
            nextAdjustment,
          ],
        });

        setEditingAdjustmentId(
          nextAdjustment.id
        );
      }}
      className="w-fit rounded-xl border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
    >
      + Add Pay Adjustment
    </button>
  </div>

  {(draft.payAdjustments ?? []).length === 0 ? (
    <div className="rounded-xl border-2 border-dashed border-slate-500 p-4 text-center">
      <p className="text-xs font-semibold text-slate-300">
        No differentials or additional pay added yet.
      </p>
    </div>
  ) : (
    <div className="space-y-3">
      {(draft.payAdjustments ?? []).map(
        (adjustment) =>
          editingAdjustmentId === adjustment.id ? (
            <div
              key={adjustment.id}
              className="rounded-2xl border-[2px] border-black bg-[#16245f] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-blue-200">
                    Pay Name
                  </label>

                  <input
                    type="text"
                    value={adjustment.name}
                    placeholder="Night Differential"
                    onChange={(event) =>
                      updateDraft({
                        payAdjustments: (
                          draft.payAdjustments ?? []
                        ).map((item) =>
                          item.id === adjustment.id
                            ? {
                                ...item,
                                name: event.target.value,
                              }
                            : item
                        ),
                      })
                    }
                    className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-blue-200">
                    Type
                  </label>

                  <select
                    value={adjustment.type}
                    onChange={(event) =>
                      updateDraft({
                        payAdjustments: (
                          draft.payAdjustments ?? []
                        ).map((item) =>
                          item.id === adjustment.id
                            ? {
                                ...item,
                                type:
                                  event.target.value ===
                                  "flat"
                                    ? "flat"
                                    : "hourly",
                              }
                            : item
                        ),
                      })
                    }
                    className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
                  >
                    <option value="hourly">
                      Extra $ / Hour
                    </option>

                    <option value="flat">
                      Flat $
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-blue-200">
                    Amount
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={adjustment.amount}
                      onChange={(event) =>
                        updateDraft({
                          payAdjustments: (
                            draft.payAdjustments ?? []
                          ).map((item) =>
                            item.id === adjustment.id
                              ? {
                                  ...item,
                                  amount:
                                    Number(
                                      event.target.value
                                    ) || 0,
                                }
                              : item
                          ),
                        })
                      }
                      className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 pr-9 font-bold text-black"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-black text-black">
                      $
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-black uppercase text-white">
                  <input
                    type="checkbox"
                    checked={
                      adjustment.active !== false
                    }
                    onChange={(event) =>
                      updateDraft({
                        payAdjustments: (
                          draft.payAdjustments ?? []
                        ).map((item) =>
                          item.id === adjustment.id
                            ? {
                                ...item,
                                active:
                                  event.target.checked,
                              }
                            : item
                        ),
                      })
                    }
                    className="h-4 w-4"
                  />

                  Active
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const saved =
                        saveProfileSettings();

                      if (saved) {
                        setEditingAdjustmentId(
                          null
                        );
                      }
                    }}
                    className="rounded-lg border-2 border-black bg-emerald-400 px-3 py-1.5 text-[10px] font-black uppercase text-black"
                  >
                    Save Default
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateDraft({
                        payAdjustments: (
                          draft.payAdjustments ??
                          []
                        ).filter(
                          (item) =>
                            item.id !==
                            adjustment.id
                        ),
                      });

                      setEditingAdjustmentId(
                        null
                      );
                    }}
                    className="rounded-lg border-2 border-black bg-[#F43F5E] px-3 py-1.5 text-[10px] font-black uppercase text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={adjustment.id}
              className="rounded-2xl border-[3px] border-black bg-[#0F5132] p-4 text-white shadow-[4px_4px_0px_black]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-200">
                    ✅ Pay Adjustment Saved
                  </p>

                  <p className="mt-2 text-sm font-black">
                    {adjustment.name ||
                      "Pay Adjustment"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-emerald-100">
                    {adjustment.type === "hourly"
                      ? `+$${adjustment.amount}/hr`
                      : `+$${adjustment.amount} flat`}

                    {adjustment.active === false
                      ? " • Inactive"
                      : " • Active"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAdjustmentId(
                        adjustment.id
                      )
                    }
                    className="rounded-lg border-2 border-black bg-[#60A5FA] px-3 py-1.5 text-[10px] font-black uppercase text-black"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextAdjustments = (
                        draft.payAdjustments ?? []
                      ).filter(
                        (item) =>
                          item.id !==
                          adjustment.id
                      );

                      updateDraft({
                        payAdjustments:
                          nextAdjustments,
                      });
                    }}
                    className="rounded-lg border-2 border-black bg-[#F43F5E] px-3 py-1.5 text-[10px] font-black uppercase text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
      )}
    </div>
  )}
</div>
 
{/* TAXES & DEDUCTIONS */}
<div className="space-y-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-black uppercase text-white">
        🧾 Taxes & Deductions
      </p>

      <p className="mt-1 text-xs font-semibold text-blue-200">
        Save the deductions that normally come out of this paycheck.
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        const nextDeduction = {
          id: crypto.randomUUID(),
          name: "",
          type: "percent" as const,
          amount: 0,
          active: true,
        };

        updateDraft({
          payrollDeductions: [
            ...(draft.payrollDeductions ?? []),
            nextDeduction,
          ],
        });

        setEditingDeductionId(
          nextDeduction.id
        );
      }}
      className="w-fit rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
    >
      + Add Deduction
    </button>
  </div>

  {(draft.payrollDeductions ?? []).length === 0 ? (
    <div className="rounded-xl border-2 border-dashed border-slate-500 p-4 text-center">
      <p className="text-xs font-semibold text-slate-300">
        No deductions added yet.
      </p>
    </div>
  ) : (
    <div className="space-y-3">
      {(draft.payrollDeductions ?? []).map(
        (deduction) =>
          editingDeductionId === deduction.id ? (
            <div
              key={deduction.id}
              className="rounded-2xl border-[2px] border-black bg-[#16245f] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-blue-200">
                    Deduction Name
                  </label>

                  <input
                    type="text"
                    value={deduction.name}
                    placeholder="Health Insurance"
                    onChange={(event) =>
                      updateDraft({
                        payrollDeductions: (
                          draft.payrollDeductions ?? []
                        ).map((item) =>
                          item.id === deduction.id
                            ? {
                                ...item,
                                name: event.target.value,
                              }
                            : item
                        ),
                      })
                    }
                    className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-blue-200">
                    Type
                  </label>

                  <select
                    value={deduction.type}
                    onChange={(event) =>
                      updateDraft({
                        payrollDeductions: (
                          draft.payrollDeductions ?? []
                        ).map((item) =>
                          item.id === deduction.id
                            ? {
                                ...item,
                                type:
                                  event.target.value === "flat"
                                    ? "flat"
                                    : "percent",
                              }
                            : item
                        ),
                      })
                    }
                    className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-bold text-black"
                  >
                    <option value="percent">
                      Percent
                    </option>

                    <option value="flat">
                      Flat $
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase text-blue-200">
                    Amount
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deduction.amount}
                      onChange={(event) =>
                        updateDraft({
                          payrollDeductions: (
                            draft.payrollDeductions ?? []
                          ).map((item) =>
                            item.id === deduction.id
                              ? {
                                  ...item,
                                  amount:
                                    Number(
                                      event.target.value
                                    ) || 0,
                                }
                              : item
                          ),
                        })
                      }
                      className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 pr-9 font-bold text-black"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-black text-black">
                      {deduction.type === "percent"
                        ? "%"
                        : "$"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-black uppercase text-white">
                  <input
                    type="checkbox"
                    checked={
                      deduction.active !== false
                    }
                    onChange={(event) =>
                      updateDraft({
                        payrollDeductions: (
                          draft.payrollDeductions ?? []
                        ).map((item) =>
                          item.id === deduction.id
                            ? {
                                ...item,
                                active:
                                  event.target.checked,
                              }
                            : item
                        ),
                      })
                    }
                    className="h-4 w-4"
                  />

                  Active
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const saved =
                        saveProfileSettings();

                      if (saved) {
                        setEditingDeductionId(
                          null
                        );
                      }
                    }}
                    className="rounded-lg border-2 border-black bg-emerald-400 px-3 py-1.5 text-[10px] font-black uppercase text-black"
                  >
                    Save Default
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateDraft({
                        payrollDeductions: (
                          draft.payrollDeductions ??
                          []
                        ).filter(
                          (item) =>
                            item.id !==
                            deduction.id
                        ),
                      });

                      setEditingDeductionId(
                        null
                      );
                    }}
                    className="rounded-lg border-2 border-black bg-[#F43F5E] px-3 py-1.5 text-[10px] font-black uppercase text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={deduction.id}
              className="rounded-2xl border-[3px] border-black bg-[#0F5132] p-4 text-white shadow-[4px_4px_0px_black]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-200">
                    ✅ Deduction Saved
                  </p>

                  <p className="mt-2 text-sm font-black">
                    {deduction.name ||
                      "Deduction"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-emerald-100">
                    {deduction.type === "percent"
                      ? `${deduction.amount}%`
                      : `$${deduction.amount} flat`}

                    {deduction.active === false
                      ? " • Inactive"
                      : " • Active"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingDeductionId(
                        deduction.id
                      )
                    }
                    className="rounded-lg border-2 border-black bg-[#60A5FA] px-3 py-1.5 text-[10px] font-black uppercase text-black"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateDraft({
                        payrollDeductions: (
                          draft.payrollDeductions ??
                          []
                        ).filter(
                          (item) =>
                            item.id !==
                            deduction.id
                        ),
                      });
                    }}
                    className="rounded-lg border-2 border-black bg-[#F43F5E] px-3 py-1.5 text-[10px] font-black uppercase text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
      )}
    </div>
  )}
</div>
            
            {/* HOURLY SUMMARY */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border-[3px] border-black bg-[#080A16] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Gross Estimate
                </p>

                <p className="mt-2 text-xl font-black text-white">
                  {money(
                    estimatedGross
                  )}
                </p>
              </div>

              <div className="rounded-2xl border-[3px] border-black bg-[#080A16] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Estimated
                  Deductions
                </p>

                <p className="mt-2 text-xl font-black text-rose-300">
                  -
                  {money(
                    totalEstimatedDeductions
                  )}
                </p>
              </div>

              <div className="rounded-2xl border-[3px] border-black bg-emerald-400 p-4 text-black">
                <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                  Estimated
                  Take-Home
                </p>

                <p className="mt-2 text-xl font-black">
                  {money(
                    estimatedTakeHome
                  )}
                </p>
              </div>
            </div>
          </>
        )}

                {/* PAY FREQUENCY */}
                {draft.recurrence !== "one_time" && (
        <div>
          <label
            htmlFor={`income-frequency-${source.id}`}
            className="mb-2 block text-sm font-black uppercase text-white"
          >
            📅 Pay Frequency
          </label>

          <select
            id={`income-frequency-${source.id}`}
            value={draft.frequency}
            onChange={(event) =>
              updateDraft({
                frequency:
                  event.target
                    .value as IncomeSource["frequency"],
              })
            }
            className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none focus:ring-4 focus:ring-yellow-300"
          >
            <option value="weekly">
              Weekly
            </option>

            <option value="biweekly">
              Biweekly
            </option>

            <option value="semimonthly">
              Semi-Monthly
            </option>

            <option value="monthly">
              Monthly
            </option>
          </select>
          </div>
        )}

        {/* START DATE */}
        <div>
          <label
            htmlFor={`income-start-date-${source.id}`}
            className="mb-2 block text-sm font-black uppercase text-white"
          >
                        {draft.recurrence === "one_time"
              ? "🗓 Payment Date"
              : "🗓 Start Date"}
          </label>

          <input
            id={`income-start-date-${source.id}`}
            type="date"
            value={draft.startDate}
            onChange={(event) => {
              const startDate =
                event.target.value;
            
              const day =
                Number(
                  startDate.split("-")[2]
                ) || 1;
            
              updateDraft({
                startDate,
            
                ...(draft.frequency === "monthly"
                  ? {
                      monthlyPayDay: day,
                    }
                  : {}),
              });
            }}
            className="w-full rounded-2xl border-3 border-black bg-white px-4 py-3 font-bold text-black outline-none [color-scheme:light] focus:ring-4 focus:ring-yellow-300"
          />
        </div>
      </div>

      {/* FOOTER */}
<div className="grid grid-cols-2 border-t-4 border-black">
  <button
    type="button"
    onClick={onCancel}
    className="border-r-2 border-black bg-white py-4 font-black uppercase text-black transition hover:bg-gray-100"
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleFinalSave}
    className="bg-emerald-400 py-4 font-black uppercase text-black transition hover:bg-emerald-300"
  >
    💾 Save
  </button>
</div>
    </div>
  );
}