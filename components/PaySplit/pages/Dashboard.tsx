"use client";

import React, { useMemo } from "react";
import PageShell from "../paysplit-ui/PageShell";
import SectionCard from "../paysplit-ui/SectionCard";
import HeroBanner from "../../ui/HeroBanner";
import ComicBurst from "../../ui/ComicBurst";
import { generateCoach } from "../lib/coachEngine";
import FinancialCoach from "../dashboard/FinancialCoach";
import type { PaySplitView } from "../PaySplitApp";
import QuickActions from "../dashboard/QuickActions";
import MonthlyCommandCenter from "../dashboard/MonthlyCommandCenter";
import BillsCenter from "../dashboard/BillsCenter";
import ActivityGoals from "../dashboard/ActivityGoals";

import {
  BILLS_KEY,
  BillItem,
  PAYMENT_HISTORY_KEY,
  PaymentItem,
  useSyncedLocalStorageState,
} from "../lib/paysplitStore";

import { defaultBills } from "../lib/billDefaults";

const PIGGYBANK_KEY = "paysplit_piggybank_v2";
const SPLITBILLS_KEY = "paysplit_splitbills_v3";
const ACCOUNTS_KEY = "paysplit_accounts_v1";



function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseISO(s: string) {
  const [y, m, d] = (s || "").split("-").map(Number);
  if (!y || !m || !d) return null;

  const dt = new Date(y, m - 1, d);

  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }

  return dt;
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function nextDueDateISO(dueDay: number, today = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const y = t.getFullYear();
  const m = t.getMonth();

  const dThisMonth = clamp(dueDay, 1, daysInMonth(y, m));
  const thisMonthDue = new Date(y, m, dThisMonth);

  if (thisMonthDue < t) {
    const nextMonth = new Date(y, m + 1, 1);
    const ny = nextMonth.getFullYear();
    const nm = nextMonth.getMonth();
    const dNextMonth = clamp(dueDay, 1, daysInMonth(ny, nm));

    return toISODate(new Date(ny, nm, dNextMonth));
  }

  return toISODate(thisMonthDue);
}

function diffDays(aISO: string, bISO: string) {
  const a = parseISO(aISO);
  const b = parseISO(bISO);

  if (!a || !b) return 0;

  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function normalizeHistory(list: any): PaymentItem[] {
  if (!Array.isArray(list)) return [];

  return list.filter(Boolean).map((x: any) => ({
    id: String(x?.id ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`),
    dateISO:
      typeof x?.dateISO === "string" && x.dateISO.length >= 10
        ? x.dateISO.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    name: String(x?.name ?? "Payment"),
    category: String(x?.category ?? "Bills"),
    amount: Number(x?.amount ?? 0),
    status:
      x?.status === "paid" ||
      x?.status === "scheduled" ||
      x?.status === "unpaid"
        ? x.status
        : "scheduled",
    note: typeof x?.note === "string" ? x.note : "",
    ...(typeof x?.accountId === "string" && x.accountId
      ? { accountId: x.accountId }
      : {}),
    ...(typeof x?.ledgerKey === "string" ? { ledgerKey: x.ledgerKey } : {}),
  })) as any;
}

type PiggyGoal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  autoA: number;
  autoB: number;
};

function normalizePiggy(list: any): PiggyGoal[] {
  if (!Array.isArray(list)) return [];

  return list.filter(Boolean).map((g: any) => ({
    id: String(g?.id ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`),
    name: String(g?.name ?? "Goal"),
    targetAmount: Number(g?.targetAmount ?? 0),
    savedAmount: Number(g?.savedAmount ?? 0),
    targetDate: typeof g?.targetDate === "string" ? g.targetDate : "",
    autoA: Number(g?.autoA ?? 0),
    autoB: Number(g?.autoB ?? 0),
  }));
}
type PayFrequency = "biweekly" | "semimonthly" | "monthly";
type SplitMode = "self" | "roommate";

type SplitBill = {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
};

type SplitPlan = {
  billId: string;
  assignTo: "A" | "B" | "both";
  yourSharePct: number;
};

type SplitState = {
  mode: SplitMode;
  payFrequency: PayFrequency;
  paycheckA: number;
  paycheckB: number;
  selfCareBudget: number;
  selfCareBuckets: { id: string; label: string; budget: number }[];
  bills: SplitBill[];
  plans: SplitPlan[];
};

function normalizeSplitState(raw: any): SplitState {
  const bills = Array.isArray(raw?.bills) ? raw.bills : [];
  const plans = Array.isArray(raw?.plans) ? raw.plans : [];
  const buckets = Array.isArray(raw?.selfCareBuckets)
    ? raw.selfCareBuckets
    : [];

  return {
    mode: raw?.mode === "roommate" ? "roommate" : "self",
    payFrequency:
      raw?.payFrequency === "monthly" || raw?.payFrequency === "semimonthly"
        ? raw.payFrequency
        : "biweekly",
    paycheckA: Number(raw?.paycheckA ?? 0),
    paycheckB: Number(raw?.paycheckB ?? 0),
    selfCareBudget: Number(raw?.selfCareBudget ?? 0),
    selfCareBuckets: buckets.map((b: any) => ({
      id: String(b?.id ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`),
      label: String(b?.label ?? "Bucket"),
      budget: Number(b?.budget ?? 0),
    })),
    bills: bills.map((b: any) => ({
      id: String(b?.id ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`),
      name: String(b?.name ?? "Bill"),
      amount: Number(b?.amount ?? 0),
      dueDay: clamp(Number(b?.dueDay ?? 1), 1, 31),
      category: String(b?.category ?? "Bills"),
    })),
    plans: plans.map((p: any) => ({
      billId: String(p?.billId ?? ""),
      assignTo: p?.assignTo === "B" || p?.assignTo === "both" ? p.assignTo : "A",
      yourSharePct: clamp(Number(p?.yourSharePct ?? 100), 0, 100),
    })),
  };
}

type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  createdAt: number;
};

function normalizeAccounts(list: any): Account[] {
  if (!Array.isArray(list)) return [];

  return list.filter(Boolean).map((a: any) => ({
    id: String(a?.id ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`),
    name: String(a?.name ?? "Account"),
    type: String(a?.type ?? "checking"),
    balance: Number(a?.balance ?? 0),
    createdAt: Number(a?.createdAt ?? Date.now()),
  }));
}


export default function Dashboard({
  onNavigate,
  userName,
}: {
  onNavigate: (view: PaySplitView) => void;
  userName: string;
}) {
  const [bills, setBills] = useSyncedLocalStorageState<BillItem[]>(
    BILLS_KEY,
    defaultBills()
  );

  const [history, setHistory] = useSyncedLocalStorageState<PaymentItem[]>(
    PAYMENT_HISTORY_KEY,
    []
  );

  const [piggyRaw, setPiggyRaw] = useSyncedLocalStorageState<any[]>(
    PIGGYBANK_KEY,
    []
  );

  const [, setSplitRaw] = useSyncedLocalStorageState<any>(
    SPLITBILLS_KEY,
    {}
  );

  const [accountsRaw, setAccountsRaw] = useSyncedLocalStorageState<any[]>(
    ACCOUNTS_KEY,
    []
  );

  React.useEffect(() => {
    setBills((prev) => prev);
    setHistory((prev) => normalizeHistory(prev));
    setPiggyRaw((prev) => normalizePiggy(prev as any));
    setSplitRaw((prev) => normalizeSplitState(prev));
    setAccountsRaw((prev) => normalizeAccounts(prev as any));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayISO = useMemo(() => toISODate(new Date()), []);

  const billSummary = useMemo(() => {
    const enriched = bills.map((b) => {
      const nextDue = nextDueDateISO(b.dueDay);
      const daysUntil = diffDays(nextDue, todayISO);
      const isPaid = b.status === "paid";
      const isOverdue = !isPaid && daysUntil < 0;
      const isDueSoon = !isPaid && daysUntil >= 0 && daysUntil <= 5;

      return { b, nextDue, daysUntil, isPaid, isOverdue, isDueSoon };
    });

    const overdue = enriched.filter((x) => x.isOverdue);
    const dueSoon = enriched.filter((x) => x.isDueSoon);
    const paid = enriched.filter((x) => x.isPaid);
    const upcoming = enriched.filter(
      (x) => !x.isPaid && !x.isOverdue && !x.isDueSoon
    );

    const sum = (arr: typeof enriched) =>
      arr.reduce((s, x) => s + (Number(x.b.amount) || 0), 0);

    const nextTwo = enriched
      .filter((x) => !x.isPaid)
      .slice()
      .sort((a, b) => a.nextDue.localeCompare(b.nextDue))
      .slice(0, 2);

    const timeline = enriched
      .filter((x) => !x.isPaid)
      .slice()
      .sort((a, b) => a.nextDue.localeCompare(b.nextDue))
      .slice(0, 6);

    return {
      overdueCount: overdue.length,
      dueSoonCount: dueSoon.length,
      upcomingCount: upcoming.length,
      paidCount: paid.length,
      overdueTotal: sum(overdue),
      dueSoonTotal: sum(dueSoon),
      upcomingTotal: sum(upcoming),
      paidTotal: sum(paid),
      nextTwo,
      timeline,
    };
  }, [bills, todayISO]);

  const historySummary = useMemo(() => {
    const items = normalizeHistory(history);
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const cutoffISO = toISODate(cutoff);

    const recent = items.filter((i) => (i.dateISO || "") >= cutoffISO);

    return {
      paid: recent
        .filter((i: any) => i.status === "paid")
        .reduce((s: number, i: any) => s + i.amount, 0),
      scheduled: recent
        .filter((i: any) => i.status === "scheduled")
        .reduce((s: number, i: any) => s + i.amount, 0),
      unpaid: recent
        .filter((i: any) => i.status === "unpaid")
        .reduce((s: number, i: any) => s + i.amount, 0),
      count: recent.length,
    };
  }, [history]);

  const recentActivity = useMemo(() => {
    const items = normalizeHistory(history);

    return items
      .slice()
      .sort((a, b) => (b.dateISO || "").localeCompare(a.dateISO || ""))
      .slice(0, 5);
  }, [history]);

  const piggySummary = useMemo(() => {
    const goals = normalizePiggy(piggyRaw);

    const totalSaved = goals.reduce(
      (s, g) => s + (Number(g.savedAmount) || 0),
      0
    );

    const totalTarget = goals.reduce(
      (s, g) => s + (Number(g.targetAmount) || 0),
      0
    );

    const autoA = goals.reduce((s, g) => s + (Number(g.autoA) || 0), 0);
    const autoB = goals.reduce((s, g) => s + (Number(g.autoB) || 0), 0);

    const progressPct =
      totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return {
      goalsCount: goals.length,
      totalSaved,
      totalTarget,
      autoA,
      autoB,
      progressPct,
    };
  }, [piggyRaw]);

  const accounts = useMemo(() => normalizeAccounts(accountsRaw), [accountsRaw]);

  const accountsTotal = useMemo(
    () => accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0),
    [accounts]
  );

  const nextBillDue = useMemo(() => {
    return billSummary.nextTwo.length > 0 ? billSummary.nextTwo[0] : null;
  }, [billSummary]);

  const monthlyProgress = useMemo(() => {
    const total =
      billSummary.paidCount +
      billSummary.upcomingCount +
      billSummary.dueSoonCount +
      billSummary.overdueCount;

    const percent =
      total > 0 ? Math.round((billSummary.paidCount / total) * 100) : 0;

    return { total, percent };
  }, [billSummary]);

  const financialHealth = useMemo(() => {
    let score = 100;

    if (billSummary.overdueCount > 0) {
      score -= billSummary.overdueCount * 20;
    }

    if (billSummary.dueSoonCount > 0) {
      score -= billSummary.dueSoonCount * 5;
    }

    const billsRemaining =
      billSummary.overdueTotal +
      billSummary.dueSoonTotal +
      billSummary.upcomingTotal;

    const projectedLeft = accountsTotal - billsRemaining;

    if (projectedLeft < 0) score -= 25;
    if (piggySummary.progressPct < 25) score -= 10;
    if (historySummary.count === 0) score -= 5;

    const finalScore = Math.max(0, Math.min(100, score));

    const label =
      finalScore >= 85
        ? "Excellent"
        : finalScore >= 70
          ? "Good"
          : finalScore >= 50
            ? "Needs Attention"
            : "Critical";

    const tone =
      finalScore >= 85
        ? "emerald"
        : finalScore >= 70
          ? "amber"
          : finalScore >= 50
            ? "amber"
            : "rose";

    return { score: finalScore, label, tone, projectedLeft };
  }, [
    billSummary,
    accountsTotal,
    piggySummary.progressPct,
    historySummary.count,
  ]);

  const safeToSpend = useMemo(() => {
    return Math.max(
      0,
      accountsTotal -
        billSummary.overdueTotal -
        billSummary.dueSoonTotal -
        billSummary.upcomingTotal
    );
  }, [
    accountsTotal,
    billSummary.overdueTotal,
    billSummary.dueSoonTotal,
    billSummary.upcomingTotal,
  ]);

  const hour = new Date().getHours();

  const coach = useMemo(
    () =>
      generateCoach({
        safeToSpend,
        overdueBills: billSummary.overdueCount,
        dueSoonBills: billSummary.dueSoonCount,
        financialScore: financialHealth.score,
        savingsPercent: piggySummary.progressPct,
        nextBillName: nextBillDue?.b.name,
        nextBillDays: nextBillDue?.daysUntil,
      }),
    [
      safeToSpend,
      billSummary,
      financialHealth.score,
      piggySummary.progressPct,
      nextBillDue,
    ]
  );

  const coachStyle =
  coach.mood === "danger"
    ? {
        icon: "🚨",
        label: "Priority Alert",
        accent: "#F43F7A",
        glow: "rgba(244,63,122,.30)",
      }
    : coach.mood === "warning"
      ? {
          icon: "⚡",
          label: "Coach Recommendation",
          accent: "#FACC15",
          glow: "rgba(250,204,21,.25)",
        }
      : {
          icon: "⭐",
          label: "Financial Coach",
          accent: "#22C55E",
          glow: "rgba(34,197,94,.25)",
        };

const greeting =
  hour < 12
    ? "Good Morning"
    : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <PageShell>
      <HeroBanner
        greeting={
          userName.trim()
            ? `Welcome back, ${userName.trim()} 👋`
            : "Welcome back 👋"
        }
        title="FINANCIAL COMMAND CENTER"
        subtitle={
          billSummary.nextTwo.length > 0
            ? billSummary.nextTwo[0].b.name +
              " is your next mission. " +
              String(
                billSummary.upcomingCount +
                  billSummary.dueSoonCount +
                  billSummary.overdueCount
              ) +
              " bill(s) still need your attention."
            : "All clear! No upcoming bills right now."
        }
        badge="💥 HERO MODE"
      />
<FinancialCoach
  greeting={greeting}
  onOpenBills={() => onNavigate("bills")}
  coach={coach}
  coachStyle={coachStyle}
  financialHealth={financialHealth}
  nextBillDue={nextBillDue}
  piggySummary={piggySummary}
/>

<MonthlyCommandCenter
  billSummary={billSummary}
  financialHealth={financialHealth}
  accountsTotal={accountsTotal}
  safeToSpend={safeToSpend}
  nextBillDue={nextBillDue}
  monthlyProgress={monthlyProgress}
/>

      <QuickActions onNavigate={onNavigate} />

      <BillsCenter
  billSummary={billSummary}
  onOpenBills={() => onNavigate("bills")}
/>

<ActivityGoals
  recentActivity={recentActivity}
  piggySummary={piggySummary}
/>

</PageShell>
  );
      }