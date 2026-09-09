"use client";

import { useEffect, useState } from "react";


import IncomeEditor from "./IncomeEditor";

import {
  createDefaultIncomeSource,
  loadIncomeSources,
  saveIncomeSources,
  type IncomeSource,
} from "../lib/incomeStore";

function money(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safeValue);
}

function formatFrequency(frequency: string) {
  if (frequency === "semimonthly") {
    return "Semi-Monthly";
  }

  if (frequency === "biweekly") {
    return "Biweekly";
  }

  if (!frequency) {
    return "Not scheduled";
  }

  return (
    frequency.charAt(0).toUpperCase() +
    frequency.slice(1)
  );
}

type IncomePlannerProps = {
  userStage:
  | "junior_high"
  | "high_school"
  | "college"
  | "adult";
};

export default function IncomePlanner({
  userStage,
}: IncomePlannerProps) {
  const [incomeSources, setIncomeSources] = useState<
    IncomeSource[]
  >([]);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [editingId, setEditingId] = useState<
    string | null
  >(null);

  const [newSourceId, setNewSourceId] =
  useState<string | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedSources = loadIncomeSources();

    if (savedSources.length > 0) {
      setIncomeSources(savedSources);
    } else {
      setIncomeSources([]);
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded || newSourceId) {
      return;
    }
  
    saveIncomeSources(incomeSources);
  }, [
    incomeSources,
    hasLoaded,
    newSourceId,
  ]);

  const primarySource = incomeSources[0];

  function handleAddIncomeSource() {
    const defaultSource =
      createDefaultIncomeSource();
  
    const newSource =
      userStage === "junior_high"
        ? {
            ...defaultSource,
            name: "Allowance",
            sourceType: "allowance" as const,
            payType: "fixed" as const,
          }
        : defaultSource;
  
    setIncomeSources((currentSources) => [
      ...currentSources,
      newSource,
    ]);
  
    setNewSourceId(newSource.id);
    setEditingId(newSource.id);
    setIsExpanded(true);
  }

  function handleEditIncomeSource(sourceId: string) {
    setEditingId(sourceId);
    setIsExpanded(true);
  }

  function handleSaveIncomeSource(
    updatedSource: IncomeSource
  ) {
    setIncomeSources((currentSources) =>
      currentSources.map((source) =>
        source.id === updatedSource.id
          ? updatedSource
          : source
      )
    );
  
    setNewSourceId(null);
    setEditingId(null);
    setIsExpanded(false);
  }

  function handleCancelIncomeSource() {
    if (
      newSourceId &&
      editingId === newSourceId
    ) {
      setIncomeSources(
        (currentSources) =>
          currentSources.filter(
            (source) =>
              source.id !== newSourceId
          )
      );
    }
  
    setNewSourceId(null);
    setEditingId(null);
  }

  function handleDeleteIncomeSource(
    sourceId: string
  ) {
    const sourceToDelete = incomeSources.find(
      (source) => source.id === sourceId
    );

    const shouldDelete = window.confirm(
      `Delete ${
        sourceToDelete?.name ||
        "this income source"
      }?`
    );

    if (!shouldDelete) {
      return;
    }

    setIncomeSources((currentSources) =>
      currentSources.filter(
        (source) => source.id !== sourceId
      )
    );

    if (editingId === sourceId) {
      setEditingId(null);
    }
  }

  function handleToggleExpanded() {
    setIsExpanded((current) => !current);

    if (isExpanded) {
      setEditingId(null);
    }
  }

  return (
    <section className="mb-8">
  <div className="income-planner-shell rounded-[32px] border-4 border-black bg-[#141d4d] p-5 text-white shadow-[8px_8px_0px_#000]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
                💰 Income Planner
              </h2>

              <div className="shrink-0 rounded-full border-2 border-black bg-emerald-400 px-3 py-1 text-xs font-black uppercase text-black">
                {incomeSources.length} Source
                {incomeSources.length !== 1
                  ? "s"
                  : ""}
              </div>
            </div>

            {!hasLoaded ? (
              <p className="mt-3 text-sm font-bold text-blue-200">
                Loading income sources...
              </p>
            ) : primarySource ? (
              <div className="mt-3">
                <p className="truncate text-lg font-black text-white">
                  {primarySource.name}
                  {incomeSources.length > 1 && (
                    <span className="ml-2 text-sm text-blue-200">
                      + {incomeSources.length - 1} more
                    </span>
                  )}
                </p>

                <p className="mt-1 text-sm font-bold text-blue-200">
  {primarySource.payType === "hourly"
    ? `${money(
        primarySource.hourlyRate ?? 0
      )}/hr • Hourly • ${formatFrequency(
        primarySource.frequency
      )}`
    : `${money(
        primarySource.estimatedNetPay
      )} • Fixed / Salary • ${formatFrequency(
        primarySource.frequency
      )}`}
</p>
              </div>
            ) : (
              <p className="mt-3 text-sm font-bold text-blue-200">
                No income sources added yet.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {primarySource && (
              <button
                type="button"
                onClick={() =>
                  handleEditIncomeSource(
                    primarySource.id
                  )
                }
                className="rounded-xl border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black] transition hover:-translate-y-1"
              >
                ✏️ Edit
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleExpanded}
              className="rounded-xl border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black] transition hover:-translate-y-1"
              aria-expanded={isExpanded}
            >
              {isExpanded
                ? "▲ Collapse"
                : "▼ Expand"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 border-t-[3px] border-black pt-6">
            {!hasLoaded ? (
              <div className="rounded-2xl border-2 border-black bg-[#1d2a69] p-5 text-center font-bold text-white">
                Loading income sources...
              </div>
            ) : incomeSources.length > 0 ? (
              <div className="space-y-4">
  {incomeSources.map((source) =>
    editingId === source.id ? (
      <IncomeEditor
  key={source.id}
  source={source}
  userStage={userStage}
  onSave={handleSaveIncomeSource}
  onCancel={handleCancelIncomeSource}
/>
    ) : (
      <div
        key={source.id}
        className="income-source-card overflow-hidden rounded-[24px]border-[3px] border-black bg-[#1d2a69] shadow-[5px_5px_0px_#000]"
      >
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-lg font-black text-white">
                🏢 {source.name}
              </p>

              <span
                className={
                  "rounded-full border-2 border-black px-2 py-1 text-[10px] font-black uppercase text-black " +
                  (source.active
                    ? "bg-emerald-400"
                    : "bg-slate-300")
                }
              >
                {source.active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            {source.payType === "hourly" ? (
              <p className="mt-2 text-sm font-bold text-blue-200">
                {money(
                  source.hourlyRate ?? 0
                )}
                /hr
                {" • "}
                Hourly
                {" • "}
                {formatFrequency(
                  source.frequency
                )}
              </p>
            ) : (
              <p className="mt-2 text-sm font-bold text-blue-200">
                {money(
                  source.estimatedNetPay
                )}
                /check
                {" • "}
                Fixed / Salary
                {" • "}
                {formatFrequency(
                  source.frequency
                )}
              </p>
            )}

            <p className="mt-1 text-xs font-semibold text-slate-300">
              First scheduled payday:{" "}
              {source.startDate ||
                "Not scheduled"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleEditIncomeSource(
                  source.id
                )
              }
              className="rounded-xl border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]"
            >
              ✏️ Edit
            </button>

            <button
              type="button"
              onClick={() =>
                handleDeleteIncomeSource(
                  source.id
                )
              }
              className="rounded-xl border-[3px] border-black bg-[#F43F5E] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_black]"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    )
  )}
</div>
            ) : (
              <div className="income-empty-state rounded-2xl border-2 border-dashedborder-white/50 bg-[#1d2a69] p-6 text-center">
                <p className="text-lg font-black">
                  No income sources yet
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-200">
                  Add an income source to begin
                  planning your paychecks.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddIncomeSource}
              className="add-income-source-button mt-6 rounded-2xl border-4 border-black bg-emerald-400 px-6 py-3 font-black uppercase text-black shadow-[6px_6px_0px_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              ➕ Add Income Source
            </button>
          </div>
        )}
      </div>
    </section>
  );
}