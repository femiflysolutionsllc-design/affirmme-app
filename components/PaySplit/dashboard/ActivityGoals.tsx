"use client";

import React from "react";
import SectionCard from "../paysplit-ui/SectionCard";
import EmptyState from "../../ui/EmptyState";
import ProgressCard from "../../ui/ProgressCard";

type ActivityItem = {
  id: string;
  status: "paid" | "scheduled" | "unpaid";
  name: string;
  category: string;
  dateISO: string;
  amount: number;
};

type PiggySummary = {
  totalSaved: number;
  totalTarget: number;
  progressPct: number;
  goalsCount: number;
  autoA: number;
  autoB: number;
};

type ActivityGoalsProps = {
  recentActivity: ActivityItem[];
  piggySummary: PiggySummary;
};

function money(value: number) {
  const safe = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safe);
}

export default function ActivityGoals({
  recentActivity,
  piggySummary,
}: ActivityGoalsProps) {
  return (
    <SectionCard title="Activity & Goals">
      <div className="grid gap-6 lg:grid-cols-2">
      <div className="activity-goals-panel is-activity relative overflow-hiddenrounded-[26px] border-[3px] border-black bg-[#101936] p-5 shadow-[8px_8px_0px_rgba(0,0,0,.75)]">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#3B82F6] opacity-20 blur-3xl" />

          <p className="relative text-sm font-black uppercase tracking-wide text-slate-100">
            ✦ Recent Activity
          </p>

          {recentActivity.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No Activity Yet"
              description="Once you mark bills paid, schedule payments, or make changes, your financial timeline will appear here."
            />
          ) : (
            <div className="relative mt-3 space-y-3">
              {recentActivity.map((item) => (
                <div
                key={item.id}
                data-status={item.status}
                className="theme-activity-item group relative overflow-hidden rounded-[24px] border border-[#3B82F6]/25 bg-gradient-to-r from-[#12182E] via-[#0E1226] to-[#090B18] p-5 shadow-[0_0_18px_rgba(59,130,246,.14)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/50 hover:shadow-[0_0_30px_rgba(59,130,246,.24)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 text-2xl shadow-[0_0_16px_rgba(59,130,246,.18)]"
                        style={{
                          background:
                            item.status === "paid"
                              ? "rgba(34,197,94,.15)"
                              : item.status === "scheduled"
                              ? "rgba(245,158,11,.15)"
                              : "rgba(239,68,68,.15)",
                        }}
                      >
                        {item.status === "paid"
                          ? "✅"
                          : item.status === "scheduled"
                          ? "⏳"
                          : "⚠️"}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {item.status === "paid"
                            ? "Paid"
                            : item.status === "scheduled"
                            ? "Scheduled"
                            : "Unpaid"}{" "}
                          {item.name}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {item.category} · {item.dateISO}
                        </p>
                      </div>
                    </div>

                    <p
                      className={
                        item.status === "paid"
                          ? "text-sm font-semibold text-emerald-300"
                          : item.status === "scheduled"
                          ? "text-sm font-semibold text-amber-300"
                          : "text-sm font-semibold text-slate-300"
                      }
                    >
                      {money(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="activity-goals-panel is-savings relative overflow-hidden rounded-[28px] border border-[#22C55E]/45 bg-gradient-to-br from-[#0F172A] via-[#0D1328] to-[#08101D] p-6 shadow-[0_0_34px_rgba(34,197,94,.20)]">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#22C55E] opacity-20 blur-3xl" />

          <p className="relative text-sm font-black uppercase tracking-wide text-slate-100">
            ✦ Savings Goals
          </p>

          <div className="relative mt-2 flex items-center justify-between">
            <div>
            <p className="text-5xl font-black text-[#F6C453] drop-shadow-[3px_3px_0_rgba(0,0,0,.85)]">
                {money(piggySummary.totalSaved)}
              </p>

              <p className="text-xs text-slate-400">
                Saved of {money(piggySummary.totalTarget)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-4xl font-black text-white">
                {piggySummary.progressPct}%
              </p>

              <p className="text-xs text-slate-400">
                Completed
              </p>
            </div>
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-900 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF2D8D] via-[#A855F7] to-[#F6C453] shadow-[0_0_20px_rgba(255,45,141,.42)] transition-all duration-700"
              style={{
                width: `${piggySummary.progressPct}%`,
              }}
            />
          </div>

          {piggySummary.goalsCount === 0 ? (
            <EmptyState
              icon="🐷"
              title="No Goals Yet"
              description="Start a PiggyBank goal and track your progress toward something important."
            />
          ) : (
            <div className="relative mt-3">
              <ProgressCard
                icon="🐷"
                title="PiggyBank Progress"
                subtitle={`${piggySummary.goalsCount} active goal(s)`}
                current={piggySummary.totalSaved}
                target={piggySummary.totalTarget}
                footer={`Auto-save plan: A ${money(
                  piggySummary.autoA
                )} • B ${money(piggySummary.autoB)}`}
              />
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}