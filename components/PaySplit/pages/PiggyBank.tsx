"use client";

import React, { useMemo, useState } from "react";
import PiggyHero from "../../ui/PiggyHero";
import MoneyInput from "../Components/MoneyInput";
import AchievementBadges from "../Components/AchievementBadges";
import SavingsForecast from "../Components/SavingsForecast";

import {
  PIGGY_BANK_STORAGE_KEY,
  PIGGY_BANK_UPDATED_EVENT,
  type PiggyBankGoal,
} from "../lib/piggyBankStore";

type Goal = PiggyBankGoal;
 
type Deposit = {
  id: string;
  amount: number;
  source: string;
  date: string;
};

const STORAGE_KEY =
  PIGGY_BANK_STORAGE_KEY;

const DEFAULT_GOALS: Goal[] = [
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

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const stored = safeParse<any>(window.localStorage.getItem(key), initial);

if (key === STORAGE_KEY && Array.isArray(stored)) {
  return stored.map((g) => ({
    ...g,
    deposits: Array.isArray(g.deposits) ? g.deposits : [],
  })) as T;
}

return stored;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
  
    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  
    if (key === PIGGY_BANK_STORAGE_KEY) {
      window.dispatchEvent(
        new CustomEvent(
          PIGGY_BANK_UPDATED_EVENT,
          {
            detail: value,
          }
        )
      );
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safe);
}

function pct(saved: number, target: number) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, (saved / target) * 100));
}

function remaining(g: Goal) {
  return Math.max(0, Number(g.targetAmount || 0) - Number(g.savedAmount || 0));
}

function recommendedSave(g: Goal) {
  const left = remaining(g);
  if (left <= 0) return 0;
  return Math.ceil(left / 10);
}

function recommendedA(g: Goal) {
  if (Number(g.autoA || 0) > 0) return Number(g.autoA);
  return recommendedSave(g);
}

function recommendedB(g: Goal) {
  if (Number(g.autoB || 0) > 0) return Number(g.autoB);
  return recommendedSave(g);
}

function getAchievements(goals: Goal[]) {
  const totalSaved = goals.reduce((s, g) => s + Number(g.savedAmount || 0), 0);
  const completed = goals.filter(
    (g) => pct(g.savedAmount || 0, g.targetAmount || 0) >= 100
  ).length;

  return [
    {
      unlocked: goals.length > 0,
      icon: "🐷",
      title: "First Goal",
      desc: "Created your first savings goal",
    },
    {
      unlocked: totalSaved >= 100,
      icon: "💵",
      title: "$100 Saved",
      desc: "Saved your first $100",
    },
    {
      unlocked: totalSaved >= 1000,
      icon: "💰",
      title: "$1,000 Saved",
      desc: "Reached $1,000 total savings",
    },
    {
      unlocked: completed >= 1,
      icon: "🏆",
      title: "Mission Complete",
      desc: "Completed your first goal",
    },
    {
      unlocked: completed >= 5,
      icon: "👑",
      title: "Financial Warrior",
      desc: "Completed five goals",
    },
  ];
}

const CATEGORY_IMAGES: Record<string, string> = {
  Emergency: "🛡️",
  House: "🏠",
  Vacation: "✈️",
  Car: "🚗",
  Wedding: "💍",
  School: "🎓",
  Medical: "🏥",
  Business: "💼",
  Investment: "📈",
  "Self Care": "💄",
  Christmas: "🎄",
  Custom: "⭐",
};

export default function PiggyBank() {
  const [goals, setGoals] = useLocalStorageState<Goal[]>(
    STORAGE_KEY,
    DEFAULT_GOALS
  );

  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<Record<string, number>>({});
  const [depositSource, setDepositSource] = useState<Record<string, string>>({});
  const [piggyMessage, setPiggyMessage] = useState<string>(
    "Ready to help you grow your savings."
  );

  const totals = useMemo(() => {
    const target = goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0);
    const saved = goals.reduce((s, g) => s + Number(g.savedAmount || 0), 0);
    const autoA = goals.reduce((s, g) => s + recommendedA(g), 0);
    const autoB = goals.reduce((s, g) => s + recommendedB(g), 0);

    return { target, saved, autoA, autoB };
  }, [goals]);

  const piggyCoins = Math.floor(totals.saved / 10);

  const completedGoals = goals.filter(
    (g) => pct(g.savedAmount || 0, g.targetAmount || 0) >= 100
  ).length;

  const achievements = getAchievements(goals);

  function addGoal() {
    const id = uid();
  
    setGoals((prev) => [
      {
        id,
        name: "New goal",
        targetAmount: 0,
        savedAmount: 0,
        targetDate: "",
        autoA: 0,
        autoB: 0,
        icon: "🐷",
        priority: "Medium",
        deposits: [],
        category: "Custom",
image: "🐷",
      },
      ...prev,
    ]);
  
    setOpenEditId(id);
  }
         
  function updateGoal(id: string, patch: Partial<Goal>) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  }
  
  function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }
  
  function recordDeposit(id: string) {
    const amount = Number(depositAmount[id] || 0);
    const source = depositSource[id] || "Paycheck A";
  
    if (amount <= 0) {
      alert("Enter an amount to deposit.");
      return;
    }
  
    let aiMessage = "";
  
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== id) return goal;
  
        const newSavedAmount = Math.min(
          Number(goal.targetAmount || 0),
          Number(goal.savedAmount || 0) + amount
        );
  
        const newProgress = pct(
          newSavedAmount,
          Number(goal.targetAmount || 0)
        );
  
        const newRemaining = Math.max(
          0,
          Number(goal.targetAmount || 0) - newSavedAmount
        );
  
        // ---------- AI Coach ----------
  
        if (newProgress >= 100) {
          aiMessage = `🎉 Amazing! "${goal.name}" is now fully funded. Time to celebrate and choose your next mission.`;
        } else if (
          goal.priority === "High" &&
          newProgress < 50
        ) {
          aiMessage = `🔥 Great job! You deposited ${money(
            amount
          )}. "${goal.name}" is one of your highest priorities. Stay focused—you'll thank yourself later.`;
        } else if (newProgress >= 90) {
          aiMessage = `🚀 You're almost there! Only ${money(
            newRemaining
          )} left until "${goal.name}" is complete.`;
        } else if (newProgress >= 75) {
          aiMessage = `👏 Excellent progress! "${goal.name}" is ${newProgress.toFixed(
            0
          )}% complete.`;
        } else if (newProgress >= 50) {
          aiMessage = `💪 You're over halfway there. Keep feeding this goal and don't lose momentum.`;
        } else {
          aiMessage = `🐷 Every dollar counts. You're now ${newProgress.toFixed(
            0
          )}% toward "${goal.name}".`;
        }
  
        return {
          ...goal,
  
          savedAmount: newSavedAmount,
  
          deposits: [
            {
              id: uid(),
              amount,
              source,
              date: todayLabel(),
            },
  
            ...(goal.deposits || []),
          ],
        };
      })
    );
  
    setDepositAmount((prev) => ({
      ...prev,
      [id]: 0,
    }));
  
    setDepositSource((prev) => ({
      ...prev,
      [id]: source,
    }));
  
    setPiggyMessage(aiMessage);
  }
  
  function completeGoal(id: string) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              savedAmount: Number(g.targetAmount || 0),
              completedAt: todayLabel(),
            }
          : g
      )
    );
  }

  return (
    <div className="space-y-6">
      <PiggyHero />

      <section className="piggy-snapshot-shell relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-6 shadow-[8px_8px_0px_rgba(0,0,0,.75)]">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "radial-gradient(circle at center, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative inline-flex rounded-full border-[3px] border-black bg-[#F43F7A] px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[5px_5px_0px_black]">
          ✦ Savings Snapshot
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="min-w-0 rounded-[24px] border-[3px] border-black bg-[#111933] px-4 py-3 shadow-[7px_7px_0px_black]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
              💰 Total Saved
            </p>
            <p className="mt-2 text-[clamp(1.4rem,2vw,2rem)] font-black text-white drop-shadow-[4px_4px_0px_black]">
              {money(totals.saved)}
            </p>
          </div>

          <div className="min-w-0 rounded-[24px] border-[3px] border-black bg-[#111933] px-4 py-3 shadow-[7px_7px_0px_black]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15]">
              🎯 Total Target
            </p>
            <p className="mt-2 text-[clamp(1.4rem,2vw,2rem)] font-black text-white drop-shadow-[4px_4px_0px_black]">
              {money(totals.target)}
            </p>
          </div>

          <div className="min-w-0 rounded-[24px] border-[3px] border-black bg-[#111933] px-4 py-3 shadow-[7px_7px_0px_black]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#60A5FA]">
              ⚡ Recommended Save
            </p>
            <p className="mt-2 text-lg font-black text-white">
              A: {money(totals.autoA)}
            </p>
            <p className="mt-1 text-lg font-black text-white">
              B: {money(totals.autoB)}
            </p>
          </div>

          <div className="min-w-0 rounded-[24px] border-[3px] border-black bg-[#111933] px-4 py-3 shadow-[7px_7px_0px_black]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F43F7A]">
              🪙 Piggy Coins
            </p>
            <p className="mt-2 text-[clamp(1.4rem,2vw,2rem)] font-black text-white drop-shadow-[4px_4px_0px_black]">
              {piggyCoins}
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex justify-end">
          <button
            type="button"
            onClick={addGoal}
            className="rounded-full border-[3px] border-black bg-[#FACC15] px-5 py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black] transition hover:-translate-y-1"
          >
            ➕ Add Goal
          </button>
        </div>
      </section>

      <AchievementBadges
  totalSaved={totals.saved}
  completedGoals={completedGoals}
  totalGoals={goals.length}
/>

<section className="savings-missions-shell relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-6 shadow-[8px_8px_0px_rgba(0,0,0,.75)]">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "radial-gradient(circle at center, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative inline-flex rounded-full border-[3px] border-black bg-[#F43F7A] px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[5px_5px_0px_black]">
          🎯 Savings Missions
        </div>

        <div className="relative mt-6 space-y-6">
          {goals.length === 0 ? (
            <div className="rounded-[24px] border-[3px] border-black bg-[#111933] p-8 text-center shadow-[7px_7px_0px_black]">
              <p className="text-5xl">🐷</p>
              <p className="mt-4 text-3xl font-black uppercase text-white">
                No Goals Yet
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Add your first savings mission.
              </p>
            </div>
          ) : (
            goals.map((g) => {
              const progress = pct(g.savedAmount || 0, g.targetAmount || 0);
              const isComplete = progress >= 100;

              return (
                <div key={g.id} className="savings-goal-group space-y-5">
                 <div className="savings-goal-card relative overflow-hidden rounded-[24px] border-[3px] border-black bg-[#111933] p-5 shadow-[7px_7px_0px_black]">
                    <div
                      className="absolute inset-0 opacity-[0.1]"
                      style={{
                        background:
                          "radial-gradient(circle at center, white 1px, transparent 1px)",
                        backgroundSize: "13px 13px",
                      }}
                    />

                    <div className="relative grid gap-5">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex rounded-full border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0px_black]">
                          Saving For
                          </div>
                          <div className="mt-3 inline-flex rounded-full border-[3px] border-black bg-[#111933] px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_black]">
  {g.priority === "High"
    ? "🔴 High Priority"
    : g.priority === "Low"
    ? "🟢 Low Priority"
    : "🟡 Medium Priority"}
</div>

                          {isComplete && (
                            <div className="inline-flex rounded-full bg-[#22C55E] px-4 py-2 text-xs font-black uppercase text-black">
                              🏆 Goal Completed
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center gap-4">
  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border-[3px] border-black bg-[#FACC15] text-4xl shadow-[5px_5px_0px_black]">
    {g.image || g.icon || "?"}
  </div>

  <div>
    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#60A5FA]">
      {g.category || "Custom"}
    </p>

    <h3 className="text-4xl font-black uppercase text-white drop-shadow-[4px_4px_0px_black]">
      {g.name}
    </h3>
  </div>
</div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-4">
                          <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4">
                            <p className="text-xs font-black uppercase text-emerald-300">
                              💰 Saved
                            </p>
                            <p className="mt-2 text-2xl font-black text-white">
                              {money(g.savedAmount || 0)}
                            </p>
                          </div>

                          <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4">
                            <p className="text-xs font-black uppercase text-[#FACC15]">
                              🎯 Goal
                            </p>
                            <p className="mt-2 text-2xl font-black text-white">
                              {money(g.targetAmount || 0)}
                            </p>
                          </div>

                          <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4">
                            <p className="text-xs font-black uppercase text-[#60A5FA]">
                              📅 Target Date
                            </p>
                            <p className="mt-2 text-lg font-black text-white">
                              {g.targetDate?.trim()
                                ? g.targetDate
                                : "No date set"}
                            </p>
                          </div>

                          <div className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4">
                            <p className="text-xs font-black uppercase text-[#F43F7A]">
                              💸 Left
                            </p>
                            <p className="mt-2 text-2xl font-black text-white">
                              {money(remaining(g))}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 h-3 overflow-hidden rounded-full border-[3px] border-black bg-[#080A16] shadow-[4px_4px_0px_black]">
                          <div
                            className="h-full bg-[#22C55E]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <p className="mt-3 flex justify-between text-sm font-black text-emerald-300">
                          <span>{progress.toFixed(0)}% complete</span>
                          <span className="text-[#FACC15]">
                            {money(remaining(g))} left
                          </span>
                        </p>
                      </div>

                      <div className="rounded-[20px] border-[3px] border-dashed border-[#F43F7A] bg-[#080A16]/70 p-4 shadow-[5px_5px_0px_black]">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">
                          💡 Recommended Per Paycheck
                        </p>

                        <div className="goal-paycheck-recommendations mt-3 flex flex-wrap gap-3">
                          <div className="rounded-full border-[3px] border-black bg-[#22C55E] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]">
                            Paycheck A: {money(recommendedA(g))}
                          </div>

                          <div className="rounded-full border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]">
                            Paycheck B: {money(recommendedB(g))}
                          </div>

                          <div className="rounded-full border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_black]">
                            Left: {money(remaining(g))}
                          </div>
                        </div>
                      </div>

                      <SavingsForecast
                        targetDate={g.targetDate}
                        remainingAmount={remaining(g)}
                        paycheckA={recommendedA(g)}
                        paycheckB={recommendedB(g)}
                      />

                      <div className="rounded-[24px] border-[3px] border-black bg-[#080A16] p-5 shadow-[6px_6px_0px_black]">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
                          💵 Record Deposit
                        </p>

                        <div className="mt-4 rounded-[18px] border-[2px] border-black bg-[#111933] p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">
                            🤖 AI Recommendation
                          </p>

                          <p className="mt-3 text-sm font-bold text-slate-300">
                            Paycheck A:{" "}
                            <span className="text-emerald-300">
                              {money(recommendedA(g))}
                            </span>
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-300">
                            Paycheck B:{" "}
                            <span className="text-blue-300">
                              {money(recommendedB(g))}
                            </span>
                          </p>
                        </div>

                        <label className="mt-4 block text-xs font-black uppercase text-slate-300">
                          Amount Deposited
                        </label>

                        <MoneyInput
                          className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-slate-100"
                          value={depositAmount[g.id] || 0}
                          onChange={(value) =>
                            setDepositAmount((prev) => ({
                              ...prev,
                              [g.id]: value,
                            }))
                          }
                        />

                        <label className="mt-4 block text-xs font-black uppercase text-slate-300">
                          Deposit Source
                        </label>

                        <select
                          value={depositSource[g.id] || "Paycheck A"}
                          onChange={(e) =>
                            setDepositSource((prev) => ({
                              ...prev,
                              [g.id]: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-white"
                        >
                          <option>Paycheck A</option>
                          <option>Paycheck B</option>
                          <option>Bonus</option>
                          <option>Tax Refund</option>
                          <option>Gift</option>
                          <option>Cash</option>
                          <option>Side Hustle</option>
                          <option>Other</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => recordDeposit(g.id)}
                          className="mt-5 w-full rounded-full border-[3px] border-black bg-[#22C55E] px-5 py-3 text-sm font-black uppercase text-black shadow-[4px_4px_0px_black]"
                        >
                          ➕ Deposit Into Goal
                        </button>

                        <details
                          open={openEditId === g.id}
                          className="mt-4 rounded-[18px] border-[2px] border-black bg-[#111933] p-4"
                        >
                          <summary
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenEditId(
                                openEditId === g.id ? null : g.id
                              );
                            }}
                            className="cursor-pointer text-xs font-black uppercase text-white"
                          >
                            Advanced Edit
                          </summary>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-black uppercase text-slate-300">
                                What are you saving for?
                              </label>
                              <input
                                className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                                value={g.name}
                                onChange={(e) =>
                                  updateGoal(g.id, { name: e.target.value })
                                }
                              />
                            </div>

                            <div>
                              <label className="text-xs font-black uppercase text-slate-300">
                                Goal amount
                              </label>
                              <MoneyInput
                                className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                                value={g.targetAmount}
                                onChange={(value) =>
                                  updateGoal(g.id, {
                                    targetAmount: value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="text-xs font-black uppercase text-slate-300">
                                Already saved
                              </label>
                              <MoneyInput
                                className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                                value={g.savedAmount}
                                onChange={(value) =>
                                  updateGoal(g.id, {
                                    savedAmount: value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="text-xs font-black uppercase text-slate-300">
                                Target date
                              </label>
                              <input
                                type="date"
                                className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
                                value={g.targetDate ?? ""}
                                onChange={(e) =>
                                  updateGoal(g.id, {
                                    targetDate: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
  <label className="text-xs font-black uppercase text-slate-300">
    Category
  </label>

  <select
    className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-2 text-sm text-slate-100"
    value={g.category || "Custom"}
    onChange={(e) =>
      updateGoal(g.id, {
        category: e.target.value,
        image: CATEGORY_IMAGES[e.target.value],
      })
    }
  >
    <option>Emergency</option>
    <option>House</option>
    <option>Vacation</option>
    <option>Car</option>
    <option>Wedding</option>
    <option>School</option>
    <option>Medical</option>
    <option>Business</option>
    <option>Investment</option>
    <option>Self Care</option>
    <option>Christmas</option>
    <option>Custom</option>
  </select>
</div>
                          </div>

                          <div className="mt-4 flex flex-wrap justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setOpenEditId(null)}
                              className="rounded-full border-[3px] border-black bg-[#111933] px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_black]"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => setOpenEditId(null)}
                              className="rounded-full border-[3px] border-black bg-[#FACC15] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteGoal(g.id)}
                              className="rounded-full border-[3px] border-black bg-[#F43F7A] px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_black]"
                            >
                              Delete Goal
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  <section className="rounded-[22px] border-[3px] border-black bg-[#0B1028] p-4 shadow-[6px_6px_0px_black]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-[0.18em] text-[#FACC15]">
                        📜 Savings History
                      </h4>

                      <button className="text-xs font-bold text-slate-400 hover:text-white">
                        View All
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
  {(g.deposits || []).length === 0 ? (
    <div className="rounded-xl bg-[#111933] p-3">
      <p className="text-xs font-semibold text-slate-400">
        No deposits yet. Your savings history will appear here.
      </p>
    </div>
  ) : (
    (g.deposits || []).slice(0, 5).map((deposit) => (
      <div
        key={deposit.id}
        className="flex items-center justify-between rounded-xl bg-[#111933] p-3"
      >
        <div>
          <p className="text-xs font-black text-slate-200">
            {deposit.date}
          </p>
          <p className="text-xs font-semibold text-slate-400">
            {deposit.source}
          </p>
        </div>

        <p className="text-sm font-black text-emerald-300">
          +{money(deposit.amount)}
        </p>
      </div>
    ))
  )}
</div>
                  </section>

                  <section className="rounded-[22px] border-[3px] border-black bg-[#111933] p-5 shadow-[6px_6px_0px_black]">
                    {isComplete ? (
                      <>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FACC15]">
                          🏆 Goal Completed!
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-200">
                          You did it. This mission is complete.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FACC15]">
                          🎁 Complete This Goal!
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-200">
                          You’re on your way.
                        </p>
                        <button
                          type="button"
                          onClick={() => completeGoal(g.id)}
                          className="mt-4 rounded-full border-[3px] border-black bg-[#22C55E] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]"
                        >
                          YAY! I completed this goal
                        </button>
                      </>
                    )}
                  </section>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="piggy-ai-coach-shell relative overflow-hidden rounded-[26px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]">
  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FACC15]">
    🤖 AI Savings Coach
  </p>

  <p className="mt-3 text-sm font-semibold text-slate-300">
    🐷 {piggyMessage}
  </p>
</section>
</div>
  );
}