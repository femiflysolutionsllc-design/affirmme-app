"use client";

import React, { useState } from "react";

import {
  BillFrequency,
  BillItem,
  type PaycheckAllocation,
} from "../lib/paysplitStore";

import type {
  PayWindow,
} from "../lib/PaycheckPlannerStore";

import CurrencyInput from "../paysplit-ui/CurrencyInput";

type Assign =
  | "A"
  | "B"
  | "both";

type AssignmentMode =
  | "auto"
  | "single"
  | "split";

type BillWithAssign =
  BillItem & {
    assignTo?: Assign;
    assignedPaycheckId?: string;
  };

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

function getTodayISO() {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function money(
  value: number
) {
  const safeValue =
    Number.isFinite(value)
      ? value
      : 0;

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(
    safeValue
  );
}

const frequencyOptions: {
  value: BillFrequency;
  label: string;
  description: string;
}[] = [
  {
    value: "monthly",
    label: "Monthly",
    description:
      "Once every month",
  },
  {
    value: "semi-monthly",
    label: "Twice Monthly",
    description:
      "Two selected days each month",
  },
  {
    value: "biweekly",
    label: "Every 2 Weeks",
    description:
      "Repeats every fourteen days",
  },
  {
    value: "weekly",
    label: "Weekly",
    description:
      "Repeats every seven days",
  },
  {
    value: "one-time",
    label: "One Time",
    description:
      "A single scheduled payment",
  },
];

export default function AddBillForm({
  onAdd,
  payWindows,
}: {
  onAdd: (
    bill: Omit<
      BillWithAssign,
      "id" | "updatedAt"
    >
  ) => void;

  payWindows: PayWindow[];
}) {
  const [
    name,
    setName,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState(
      "Mortgage"
    );

  const [
    amount,
    setAmount,
  ] =
    useState(0);

  const [
    frequency,
    setFrequency,
  ] =
    useState<BillFrequency>(
      "monthly"
    );

  const [
    dueDay,
    setDueDay,
  ] =
    useState("1");

  const [
    secondDueDay,
    setSecondDueDay,
  ] =
    useState("15");

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      getTodayISO()
    );

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(false);

  const [
    assignedPayWindowId,
    setAssignedPayWindowId,
  ] =
    useState<string>("");

  const [
    assignmentMode,
    setAssignmentMode,
  ] =
    useState<AssignmentMode>(
      "auto"
    );

  const [
    allocationAmounts,
    setAllocationAmounts,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const selectedPayWindow =
    payWindows.find(
      (window) =>
        window.id ===
        assignedPayWindowId
    );

  const legacyAssignment:
    Assign =
    assignmentMode ===
    "split"
      ? "both"
      : selectedPayWindow
          ?.half ??
        "A";

  function normalizeDay(
    value: string
  ) {
    return String(
      clamp(
        Number(
          value || 1
        ),
        1,
        31
      )
    );
  }

  function updateAllocation(
    payWindowId: string,
    allocationAmount: number
  ) {
    setAllocationAmounts(
      (current) => ({
        ...current,

        [payWindowId]:
          Math.max(
            0,
            Number(
              allocationAmount ||
                0
            )
          ),
      })
    );
  }

  function splitEquallyAcrossFirstTwo() {
    if (
      payWindows.length <
        2 ||
      amount <= 0
    ) {
      return;
    }

    const firstAmount =
      Math.round(
        (amount / 2) *
          100
      ) / 100;

    const secondAmount =
      Math.round(
        (amount -
          firstAmount) *
          100
      ) / 100;

    setAllocationAmounts({
      [payWindows[0].id]:
        firstAmount,

      [payWindows[1].id]:
        secondAmount,
    });
  }

  function resetForm() {
    setName("");
    setCategory(
      "Mortgage"
    );
    setAmount(0);
    setFrequency(
      "monthly"
    );
    setDueDay("1");
    setSecondDueDay(
      "15"
    );
    setStartDate(
      getTodayISO()
    );
    setAssignedPayWindowId(
      ""
    );
    setAssignmentMode(
      "auto"
    );
    setAllocationAmounts(
      {}
    );
    setIsOpen(false);
  }

  function saveBill() {
    if (
      !name.trim()
    ) {
      alert(
        "Add a bill name first."
      );

      return;
    }

    if (
      amount <= 0
    ) {
      alert(
        "Enter a bill amount greater than zero."
      );

      return;
    }

    if (
      payWindows.length ===
      0
    ) {
      alert(
        "Add an income source before saving this bill."
      );

      return;
    }

    if (
      (
        frequency ===
          "weekly" ||
        frequency ===
          "biweekly" ||
        frequency ===
          "one-time"
      ) &&
      !startDate
    ) {
      alert(
        "Choose a payment date."
      );

      return;
    }

    const primaryDay =
      clamp(
        Number(
          dueDay || 1
        ),
        1,
        31
      );

    const secondaryDay =
      clamp(
        Number(
          secondDueDay ||
            15
        ),
        1,
        31
      );

    if (
      frequency ===
        "semi-monthly" &&
      primaryDay ===
        secondaryDay
    ) {
      alert(
        "Choose two different payment days."
      );

      return;
    }

    let paycheckAllocations:
      PaycheckAllocation[] =
      [];

    let finalAssignedPayWindowId =
      "";

    /*
     * AUTO
     *
     * No manual allocation is saved.
     * The bill schedule determines
     * when the obligation is due.
     */
    if (
      assignmentMode ===
      "auto"
    ) {
      paycheckAllocations =
        [];
    }

    /*
     * ONE PAY WINDOW
     */
    if (
      assignmentMode ===
      "single"
    ) {
      finalAssignedPayWindowId =
        assignedPayWindowId ||
        payWindows[0]
          ?.id ||
        "";

      paycheckAllocations =
        [
          {
            paycheckId:
              finalAssignedPayWindowId,

            amount:
              Math.max(
                0,
                Number(
                  amount || 0
                )
              ),
          },
        ];
    }

    /*
     * SPLIT ACROSS WINDOWS
     */
    if (
      assignmentMode ===
      "split"
    ) {
      paycheckAllocations =
        payWindows
          .map(
            (
              window
            ) => ({
              paycheckId:
                window.id,

              amount:
                Math.max(
                  0,
                  Number(
                    allocationAmounts[
                      window.id
                    ] || 0
                  )
                ),
            })
          )
          .filter(
            (
              allocation
            ) =>
              allocation.amount >
              0
          );

      const allocatedTotal =
        paycheckAllocations.reduce(
          (
            total,
            allocation
          ) =>
            total +
            allocation.amount,
          0
        );

      const difference =
        Math.abs(
          allocatedTotal -
            Number(
              amount || 0
            )
        );

      if (
        paycheckAllocations.length <
        2
      ) {
        alert(
          "Choose at least two pay windows when splitting a bill."
        );

        return;
      }

      if (
        difference >
        0.01
      ) {
        alert(
          `Your split must equal the bill total. You assigned ${money(
            allocatedTotal
          )} of ${money(
            amount
          )}.`
        );

        return;
      }
    }

    const newBill:
      Omit<
        BillWithAssign,
        "id" | "updatedAt"
      > = {
      name:
        name.trim(),

      category:
        category.trim() ||
        "Bills",

      amount:
        Math.max(
          0,
          Number(
            amount || 0
          )
        ),

      status:
        "unpaid",

      frequency,

      note:
        "",

      paidAt:
        "",

      assignTo:
        legacyAssignment,

      assignedPaycheckId:
        assignmentMode ===
        "single"
          ? finalAssignedPayWindowId
          : undefined,

      paycheckAllocations,
    };

    if (
      frequency ===
      "monthly"
    ) {
      newBill.dueDay =
        primaryDay;
    }

    if (
      frequency ===
      "semi-monthly"
    ) {
      newBill.dueDay =
        primaryDay;

      newBill.secondDueDay =
        secondaryDay;
    }

    if (
      frequency ===
        "weekly" ||
      frequency ===
        "biweekly" ||
      frequency ===
        "one-time"
    ) {
      newBill.startDate =
        startDate;
    }

    onAdd(
      newBill
    );

    resetForm();
  }

  return (
    <div className="add-bill-form-shell relative mt-5 overflow-hidden rounded-[26px]border-[3px] border-black bg-[#111933] p-6 shadow-[8px_8px_0px_rgba(0,0,0,.75)]">
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",

          backgroundSize:
            "14px 14px",
        }}
      />

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) =>
              !current
          )
        }
        className="relative inline-flex rounded-full border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[5px_5px_0px_black] transition hover:-translate-y-1"
      >
        {isOpen
          ? "✕ Close Bill Form"
          : "➕ Add a Bill"}
      </button>

      {isOpen && (
        <>
          {/* BILL BASICS */}
          <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                Name
              </label>

              <input
                className="mt-2 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                value={
                  name
                }
                onChange={(
                  event
                ) =>
                  setName(
                    event.target
                      .value
                  )
                }
                placeholder="Car insurance"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                Category
              </label>

              <select
                className="mt-2 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                value={
                  category
                }
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value
                  )
                }
              >
                <optgroup label="🏠 Home">
                  <option value="Mortgage">
                    Mortgage
                  </option>

                  <option value="Rent">
                    Rent
                  </option>

                  <option value="HOA">
                    HOA
                  </option>

                  <option value="Electricity">
                    Electricity
                  </option>

                  <option value="Water">
                    Water
                  </option>

                  <option value="Gas Utility">
                    Gas Utility
                  </option>

                  <option value="Internet">
                    Internet
                  </option>

                  <option value="Cable">
                    Cable
                  </option>

                  <option value="Phone">
                    Phone
                  </option>
                </optgroup>

                <optgroup label="🚗 Transportation">
                  <option value="Car Payment">
                    Car Payment
                  </option>

                  <option value="Car Insurance">
                    Car Insurance
                  </option>

                  <option value="Gas">
                    Gas
                  </option>

                  <option value="Tolls">
                    Tolls
                  </option>

                  <option value="Maintenance">
                    Maintenance
                  </option>

                  <option value="Transportation">
                    Transportation
                  </option>
                </optgroup>

                <optgroup label="💳 Debt">
                  <option value="Credit Card">
                    Credit Card
                  </option>

                  <option value="Student Loan">
                    Student Loan
                  </option>

                  <option value="Personal Loan">
                    Personal Loan
                  </option>

                  <option value="Medical Debt">
                    Medical Debt
                  </option>

                  <option value="Other Debt">
                    Other Debt
                  </option>
                </optgroup>

                <optgroup label="🍎 Living">
                  <option value="Groceries">
                    Groceries
                  </option>

                  <option value="Medical">
                    Medical
                  </option>

                  <option value="Childcare">
                    Childcare
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Pet Care">
                    Pet Care
                  </option>

                  <option value="Insurance">
                    Insurance
                  </option>
                </optgroup>

                <optgroup label="❤️ Lifestyle">
                  <option value="Gym">
                    Gym
                  </option>

                  <option value="Streaming">
                    Streaming
                  </option>

                  <option value="Subscriptions">
                    Subscriptions
                  </option>

                  <option value="Entertainment">
                    Entertainment
                  </option>

                  <option value="Personal">
                    Personal
                  </option>

                  <option value="Savings">
                    Savings
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                Amount
              </label>

              <CurrencyInput
                value={
                  Number(
                    amount || 0
                  )
                }
                onChange={
                  setAmount
                }
                className="mt-2 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
              />
            </div>
          </div>

          {/* PAYMENT SCHEDULE */}
          <div className="relative mt-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
              Payment Schedule
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {frequencyOptions.map(
                (
                  option
                ) => {
                  const selected =
                    frequency ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() =>
                        setFrequency(
                          option.value
                        )
                      }
                      className={
                        "rounded-2xl border-[3px] border-black p-3 text-left shadow-[4px_4px_0px_black] transition hover:-translate-y-1 " +
                        (selected
                          ? "bg-[#22C55E] text-black"
                          : "bg-[#60A5FA] text-black")
                      }
                    >
                      <span className="block text-xs font-black uppercase">
                        {selected
                          ? "● "
                          : "○ "}
                        {
                          option.label
                        }
                      </span>

                      <span className="mt-1 block text-xs font-semibold opacity-80">
                        {
                          option.description
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* DUE DATE RULES */}
          <div className="relative mt-5">
            {frequency ===
              "monthly" && (
              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                  Monthly Due
                  Day
                </label>

                <div className="relative mt-2">
                  <input
                    inputMode="numeric"
                    className="w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 pr-24 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                    value={
                      dueDay
                    }
                    onChange={(
                      event
                    ) => {
                      const value =
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            2
                          );

                      setDueDay(
                        value
                      );
                    }}
                    onBlur={() =>
                      setDueDay(
                        normalizeDay(
                          dueDay
                        )
                      )
                    }
                    placeholder="1"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-wider text-slate-400">
                    Every Month
                  </span>
                </div>
              </div>
            )}

            {frequency ===
              "semi-monthly" && (
              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                  Twice-Monthly
                  Due Days
                </label>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <input
                    inputMode="numeric"
                    className="w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                    value={
                      dueDay
                    }
                    onChange={(
                      event
                    ) =>
                      setDueDay(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            2
                          )
                      )
                    }
                    onBlur={() =>
                      setDueDay(
                        normalizeDay(
                          dueDay
                        )
                      )
                    }
                    placeholder="1"
                    aria-label="First monthly due day"
                  />

                  <input
                    inputMode="numeric"
                    className="w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                    value={
                      secondDueDay
                    }
                    onChange={(
                      event
                    ) =>
                      setSecondDueDay(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            2
                          )
                      )
                    }
                    onBlur={() =>
                      setSecondDueDay(
                        normalizeDay(
                          secondDueDay
                        )
                      )
                    }
                    placeholder="15"
                    aria-label="Second monthly due day"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Example: 1st and
                  15th of every
                  month.
                </p>
              </div>
            )}

            {(
              frequency ===
                "weekly" ||
              frequency ===
                "biweekly" ||
              frequency ===
                "one-time"
            ) && (
              <div>
                <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                  {frequency ===
                  "one-time"
                    ? "Payment Date"
                    : "First Payment Date"}
                </label>

                <input
                  type="date"
                  value={
                    startDate
                  }
                  onChange={(
                    event
                  ) =>
                    setStartDate(
                      event.target
                        .value
                    )
                  }
                  className="mt-2 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                />

                <p className="mt-2 text-xs text-slate-400">
                  {frequency ===
                    "weekly" &&
                    "AffirmMe will repeat this payment every seven days."}

                  {frequency ===
                    "biweekly" &&
                    "AffirmMe will repeat this payment every fourteen days."}

                  {frequency ===
                    "one-time" &&
                    "This payment will appear only on the selected date."}
                </p>
              </div>
            )}
          </div>

          {/* BUDGET WINDOW ASSIGNMENT */}
          <div className="relative mt-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
              Budget Window
              Assignment
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {/* AUTO */}
              <button
                type="button"
                onClick={() =>
                  setAssignmentMode(
                    "auto"
                  )
                }
                className={
                  "rounded-2xl border-[3px] border-black p-4 text-left shadow-[4px_4px_0px_black] transition hover:-translate-y-1 " +
                  (assignmentMode ===
                  "auto"
                    ? "bg-[#22C55E] text-black"
                    : "bg-[#60A5FA] text-black")
                }
              >
                <span className="block text-xs font-black uppercase">
                  {assignmentMode ===
                  "auto"
                    ? "● "
                    : "○ "}
                  Auto by Due Date
                </span>

                <span className="mt-1 block text-xs font-semibold opacity-80">
                  Let PaySplit place
                  each occurrence in
                  its scheduled due
                  window.
                </span>
              </button>

              {/* SINGLE */}
              <button
                type="button"
                onClick={() =>
                  setAssignmentMode(
                    "single"
                  )
                }
                className={
                  "rounded-2xl border-[3px] border-black p-4 text-left shadow-[4px_4px_0px_black] transition hover:-translate-y-1 " +
                  (assignmentMode ===
                  "single"
                    ? "bg-[#22C55E] text-black"
                    : "bg-[#60A5FA] text-black")
                }
              >
                <span className="block text-xs font-black uppercase">
                  {assignmentMode ===
                  "single"
                    ? "● "
                    : "○ "}
                  One Pay Window
                </span>

                <span className="mt-1 block text-xs font-semibold opacity-80">
                  Put the full bill
                  amount in one
                  budgeting window.
                </span>
              </button>

              {/* SPLIT */}
              <button
                type="button"
                onClick={() =>
                  setAssignmentMode(
                    "split"
                  )
                }
                className={
                  "rounded-2xl border-[3px] border-black p-4 text-left shadow-[4px_4px_0px_black] transition hover:-translate-y-1 " +
                  (assignmentMode ===
                  "split"
                    ? "bg-[#22C55E] text-black"
                    : "bg-[#60A5FA] text-black")
                }
              >
                <span className="block text-xs font-black uppercase">
                  {assignmentMode ===
                  "split"
                    ? "● "
                    : "○ "}
                  Split Across Pay
                  Windows
                </span>

                <span className="mt-1 block text-xs font-semibold opacity-80">
                  Divide the bill
                  between two or more
                  budgeting windows.
                </span>
              </button>
            </div>

            {payWindows.length >
            0 ? (
              <>
                {/* AUTO MODE */}
                {assignmentMode ===
                  "auto" && (
                  <div className="mt-5 rounded-2xl border-[3px] border-black bg-[#0F5132] p-4 text-white shadow-[4px_4px_0px_black]">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
                      ✨ Automatic
                      Scheduling
                    </p>

                    <p className="mt-2 text-sm font-bold">
                      PaySplit will use
                      this bill&apos;s
                      due date and
                      recurrence schedule
                      to place each
                      occurrence in the
                      correct budgeting
                      window.
                    </p>

                    <p className="mt-2 text-xs font-semibold text-emerald-100">
                      You can manually
                      fund or split the
                      bill later if you
                      want money reserved
                      from earlier
                      windows.
                    </p>
                  </div>
                )}

                {/* SINGLE MODE */}
                {assignmentMode ===
                  "single" && (
                  <div className="mt-5">
                    <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                      Assign Full
                      Amount To Pay
                      Window
                    </label>

                    <select
                      value={
                        assignedPayWindowId ||
                        payWindows[0]
                          ?.id ||
                        ""
                      }
                      onChange={(
                        event
                      ) =>
                        setAssignedPayWindowId(
                          event.target
                            .value
                        )
                      }
                      className="mt-3 w-full rounded-xl border-[3px] border-black bg-[#080A16] p-3 text-sm font-semibold text-slate-100 shadow-[4px_4px_0px_rgba(0,0,0,.75)]"
                    >
                      {payWindows.map(
                        (
                          window
                        ) => (
                          <option
                            key={
                              window.id
                            }
                            value={
                              window.id
                            }
                          >
                            {
                              window.label
                            }{" "}
                            •{" "}
                            {money(
                              window.totalIncome
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                {/* SPLIT MODE */}
                {assignmentMode ===
                  "split" && (
                  <div className="mt-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                          Split Amounts
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          The assigned
                          amounts must
                          equal the full
                          bill total.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          splitEquallyAcrossFirstTwo
                        }
                        disabled={
                          payWindows.length <
                            2 ||
                          amount <= 0
                        }
                        className="w-fit rounded-full border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Split 50/50
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {payWindows.map(
                        (
                          window
                        ) => (
                          <div
                            key={
                              window.id
                            }
                            className="grid gap-3 rounded-2xl border-[3px] border-black bg-[#080A16] p-4 shadow-[4px_4px_0px_rgba(0,0,0,.75)] sm:grid-cols-[1fr_180px] sm:items-center"
                          >
                            <div>
                              <p className="text-sm font-black text-white">
                                {window.half ===
                                "A"
                                  ? "Pay Window A"
                                  : "Pay Window B"}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-400">
                                {
                                  window.label
                                }
                                {" • "}
                                {money(
                                  window.totalIncome
                                )}
                                {" available"}
                              </p>
                            </div>

                            <CurrencyInput
                              value={
                                Number(
                                  allocationAmounts[
                                    window.id
                                  ] ||
                                    0
                                )
                              }
                              onChange={(
                                value
                              ) =>
                                updateAllocation(
                                  window.id,
                                  value
                                )
                              }
                              className="w-full rounded-xl border-[3px] border-black bg-[#111933] p-3 text-sm text-slate-100"
                            />
                          </div>
                        )
                      )}
                    </div>

                    {(() => {
                      const allocatedTotal =
                        Object.values(
                          allocationAmounts
                        ).reduce(
                          (
                            total,
                            value
                          ) =>
                            total +
                            Math.max(
                              0,
                              Number(
                                value ||
                                  0
                              )
                            ),
                          0
                        );

                      const remainingToAssign =
                        Number(
                          amount ||
                            0
                        ) -
                        allocatedTotal;

                      return (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-xl border-[3px] border-black bg-[#60A5FA] p-3 text-black">
                            <p className="text-xs font-black uppercase">
                              Bill Total
                            </p>

                            <p className="mt-1 font-black">
                              {money(
                                amount
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl border-[3px] border-black bg-[#FACC15] p-3 text-black">
                            <p className="text-xs font-black uppercase">
                              Assigned
                            </p>

                            <p className="mt-1 font-black">
                              {money(
                                allocatedTotal
                              )}
                            </p>
                          </div>

                          <div
                            className={
                              "rounded-xl border-[3px] border-black p-3 text-black " +
                              (Math.abs(
                                remainingToAssign
                              ) <=
                              0.01
                                ? "bg-[#22C55E]"
                                : "bg-[#FB7185]")
                            }
                          >
                            <p className="text-xs font-black uppercase">
                              {remainingToAssign <
                              0
                                ? "Over Assigned"
                                : "Left to Assign"}
                            </p>

                            <p className="mt-1 font-black">
                              {money(
                                Math.abs(
                                  remainingToAssign
                                )
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-3 rounded-xl border-[3px] border-black bg-[#080A16] p-4 text-sm font-semibold text-amber-200">
                Add an income source
                before assigning this
                bill to a pay window.
              </div>
            )}
          </div>

          {/* SAVE */}
          <button
            type="button"
            onClick={
              saveBill
            }
            disabled={
              payWindows.length ===
              0
            }
            className="relative mt-6 w-full rounded-2xl border-[3px] border-black bg-[#FACC15] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[6px_6px_0px_black] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Save Bill
          </button>
        </>
      )}
    </div>
  );
}