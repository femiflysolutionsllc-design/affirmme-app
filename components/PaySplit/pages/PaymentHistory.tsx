"use client";

import React, { useMemo, useState } from "react";
import { PAYMENT_HISTORY_KEY, useSyncedLocalStorageState, PaymentItem } from "../lib/paysplitStore";

const ACCOUNTS_KEY = "paysplit_accounts_v1";

type Account = { id: string; name: string };

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(safe);
}

function monthKey(dateISO: string) {
  return (dateISO || "").slice(0, 7); // YYYY-MM
}

function prettyMonth(yyyyMm: string) {
  const [y, m] = (yyyyMm || "").split("-");
  const dt = new Date(Number(y), Number(m) - 1, 1);
  return dt.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function normalizeAccounts(list: any): Account[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter(Boolean)
    .map((a: any) => ({
      id: String(a?.id ?? ""),
      name: String(a?.name ?? "Account"),
    }))
    .filter((a: Account) => a.id);
}

function normalizeHistory(list: any): PaymentItem[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter(Boolean)
    .map((x: any) => ({
      id: String(x?.id ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`),
      dateISO:
        typeof x?.dateISO === "string" && x.dateISO.length >= 10
          ? x.dateISO.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      name: String(x?.name ?? "Payment"),
      category: String(x?.category ?? "Bills"),
      amount: Number.isFinite(Number(x?.amount)) ? Number(x.amount) : 0,
      status:
        x?.status === "paid" || x?.status === "scheduled" || x?.status === "unpaid"
          ? x.status
          : "scheduled",
      note: typeof x?.note === "string" ? x.note : "",
      ...(typeof x?.accountId === "string" && x.accountId ? { accountId: x.accountId } : {}),
      ...(typeof x?.ledgerKey === "string" ? { ledgerKey: x.ledgerKey } : {}),
    })) as any;
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function PaymentHistory() {
  const [history, setHistory] = useSyncedLocalStorageState<PaymentItem[]>(PAYMENT_HISTORY_KEY, []);
  const safeItems = useMemo(() => normalizeHistory(history), [history]);

  const [accountsRaw] = useSyncedLocalStorageState<any[]>(ACCOUNTS_KEY, []);
  const accounts = useMemo(() => normalizeAccounts(accountsRaw), [accountsRaw]);

  const accountNameById = useMemo(() => {
    const m = new Map<string, string>();
    accounts.forEach((a) => m.set(a.id, a.name));
    return m;
  }, [accounts]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PaymentItem["status"] | "all">("all");
  const [month, setMonth] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [account, setAccount] = useState<string>("all");

  const availableMonths = useMemo(() => {
    const s = new Set(safeItems.map((i) => monthKey(i.dateISO)));
    return Array.from(s).sort().reverse();
  }, [safeItems]);

  const availableCategories = useMemo(() => {
    const s = new Set(safeItems.map((i) => (i.category || "Bills").trim()).filter(Boolean));
    return Array.from(s).sort();
  }, [safeItems]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return safeItems
      .slice()
      .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
      .filter((i: any) => {
        const matchesQ =
          !needle ||
          i.name.toLowerCase().includes(needle) ||
          i.category.toLowerCase().includes(needle) ||
          (i.note ?? "").toLowerCase().includes(needle);

        const matchesStatus = status === "all" ? true : i.status === status;
        const matchesMonth = month === "all" ? true : monthKey(i.dateISO) === month;
        const matchesCategory = category === "all" ? true : (i.category || "Bills") === category;
        const matchesAccount =
          account === "all"
            ? true
            : (i.accountId || "") === account;

        return matchesQ && matchesStatus && matchesMonth && matchesCategory && matchesAccount;
      });
  }, [safeItems, q, status, month, category, account]);

  const grouped = useMemo(() => {
    const map = new Map<string, PaymentItem[]>();
    filtered.forEach((i: any) => {
      const k = monthKey(i.dateISO);
      const list = map.get(k) ?? [];
      list.push(i);
      map.set(k, list);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const totals = useMemo(() => {
    const paid = filtered.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.amount, 0);
    const scheduled = filtered.filter((i: any) => i.status === "scheduled").reduce((s: number, i: any) => s + i.amount, 0);
    const unpaid = filtered.filter((i: any) => i.status === "unpaid").reduce((s: number, i: any) => s + i.amount, 0);
    return { paid, scheduled, unpaid };
  }, [filtered]);

  function addPayment() {
    const iso = new Date().toISOString().slice(0, 10);
    const p: PaymentItem = {
      id: uid(),
      dateISO: iso,
      name: "New payment",
      category: "Bills",
      amount: 0,
      status: "scheduled",
      note: "",
    };
    setHistory((prev) => [p, ...normalizeHistory(prev)]);
  }

  function updateItem(id: string, patch: Partial<PaymentItem>) {
    setHistory((prev) => normalizeHistory(prev).map((x: any) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeItem(id: string) {
    setHistory((prev) => normalizeHistory(prev).filter((x: any) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <section className="payment-history-summary-shell relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-6 shadow-[8px_8px_0px_black]">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "radial-gradient(circle at center, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
  
        <div className="relative inline-flex rounded-full border-[3px] border-black bg-[#F43F7A] px-5 py-2 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[5px_5px_0px_black]">
          📜 Payment History
        </div>
  
        <p className="relative mt-4 text-sm font-semibold text-slate-300">
          Track paid, scheduled, unpaid, and reversed payments in one place.
        </p>
  
        <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border-[3px] border-black bg-[#111933] p-4 shadow-[6px_6px_0px_black]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Paid
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {money(totals.paid)}
            </p>
          </div>
  
          <div className="rounded-[22px] border-[3px] border-black bg-[#111933] p-4 shadow-[6px_6px_0px_black]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FACC15]">
              Scheduled
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {money(totals.scheduled)}
            </p>
          </div>
  
          <div className="rounded-[22px] border-[3px] border-black bg-[#111933] p-4 shadow-[6px_6px_0px_black]">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#F43F7A]">
              Unpaid
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {money(totals.unpaid)}
            </p>
          </div>
        </div>
      </section>
  
      <section className="payment-history-filters-shell rounded-[28px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FACC15]">
          🔎 Filters
        </p>
  
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs font-black uppercase text-slate-300">
              Search
            </label>
            <input
              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-3 text-sm text-slate-100"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rent, utilities, phone…"
            />
          </div>
  
          <div>
            <label className="text-xs font-black uppercase text-slate-300">
              Month
            </label>
            <select
              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-3 text-sm text-slate-100"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="all">All months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {prettyMonth(m)}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="text-xs font-black uppercase text-slate-300">
              Category
            </label>
            <select
              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-3 text-sm text-slate-100"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs font-black uppercase text-slate-300">
              Account
            </label>
            <select
              className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-3 text-sm text-slate-100"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              <option value="all">All accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="text-xs font-black uppercase text-slate-300">
              Status
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["all", "paid", "scheduled", "unpaid"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={
                    "rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_black] transition " +
                    (status === s
                      ? "bg-[#22C55E] text-black"
                      : "bg-[#080A16] text-slate-200")
                  }
                >
                  {s === "all"
                    ? "All"
                    : s === "paid"
                    ? "Paid"
                    : s === "scheduled"
                    ? "Scheduled"
                    : "Unpaid"}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        <button
          type="button"
          onClick={addPayment}
          className="mt-5 w-full rounded-full border-[3px] border-black bg-[#FACC15] px-5 py-3 text-sm font-black uppercase text-black shadow-[5px_5px_0px_black]"
        >
          ➕ Add Payment Item
        </button>
      </section>
  
      <section className="payment-history-results-shell space-y-4">
        {grouped.length === 0 ? (
          <div className="rounded-[28px] border-[3px] border-black bg-[#111933] p-6 text-sm font-bold text-slate-300 shadow-[8px_8px_0px_black]">
            Nothing matches your filters yet.
          </div>
        ) : (
          grouped.map(([m, list]) => (
            <div
              key={m}
              className="rounded-[28px] border-[3px] border-black bg-[#0A1024] p-5 shadow-[8px_8px_0px_black]"
            >
              <div className="inline-flex rounded-full border-[3px] border-black bg-[#60A5FA] px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[5px_5px_0px_black]">
                {prettyMonth(m)}
              </div>
  
              <div className="mt-5 space-y-3">
                {list.map((i: any) => (
                  <div
                    key={i.id}
                    className="rounded-[22px] border-[3px] border-black bg-[#111933] p-4 shadow-[6px_6px_0px_black]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black uppercase text-white">
                          {i.name}
                        </p>
  
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {i.dateISO} · {i.category}
                          {i.accountId ? (
                            <>
                              {" "}
                              ·{" "}
                              <span className="text-slate-200">
                                {accountNameById.get(i.accountId) ??
                                  "Linked account"}
                              </span>
                            </>
                          ) : null}
                        </p>
  
                        {i.note?.trim() ? (
                          <p className="mt-2 whitespace-pre-wrap text-xs font-semibold text-slate-300">
                            {i.note}
                          </p>
                        ) : null}
                      </div>
  
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">
                          {money(i.amount)}
                        </p>
  
                        <p
                          className={
                            "mt-2 inline-flex rounded-full border-[3px] border-black px-3 py-1 text-[11px] font-black uppercase shadow-[3px_3px_0px_black] " +
                            (i.status === "paid"
                              ? "bg-[#22C55E] text-black"
                              : i.status === "scheduled"
                              ? "bg-[#FACC15] text-black"
                              : "bg-[#F43F7A] text-white")
                          }
                        >
                          {String(i.status).toUpperCase()}
                        </p>
                      </div>
                    </div>
  
                    <details className="mt-4 rounded-[18px] border-[2px] border-black bg-[#080A16] p-4">
                      <summary className="cursor-pointer text-xs font-black uppercase text-white">
                        Edit Payment
                      </summary>
  
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-black uppercase text-slate-300">
                            Name
                          </label>
                          <input
                            className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-slate-100"
                            value={i.name}
                            onChange={(e) =>
                              updateItem(i.id, { name: e.target.value })
                            }
                          />
                        </div>
  
                        <div>
                          <label className="text-xs font-black uppercase text-slate-300">
                            Category
                          </label>
                          <input
                            className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-slate-100"
                            value={i.category}
                            onChange={(e) =>
                              updateItem(i.id, { category: e.target.value })
                            }
                          />
                        </div>
  
                        <div>
                          <label className="text-xs font-black uppercase text-slate-300">
                            Date
                          </label>
                          <input
                            className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-slate-100"
                            value={i.dateISO}
                            onChange={(e) =>
                              updateItem(i.id, { dateISO: e.target.value })
                            }
                          />
                        </div>
  
                        <div>
                          <label className="text-xs font-black uppercase text-slate-300">
                            Amount
                          </label>
                          <input
                            inputMode="decimal"
                            className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-slate-100"
                            value={String(i.amount)}
                            onChange={(e) =>
                              updateItem(i.id, {
                                amount: Number(e.target.value || 0),
                              })
                            }
                          />
                        </div>
  
                        <div className="sm:col-span-2">
                          <label className="text-xs font-black uppercase text-slate-300">
                            Linked Account
                          </label>
                          <select
                            className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-slate-100"
                            value={i.accountId ?? ""}
                            onChange={(e) =>
                              updateItem(i.id, { accountId: e.target.value })
                            }
                          >
                            <option value="">— Not linked —</option>
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </div>
  
                        <div className="sm:col-span-2">
                          <label className="text-xs font-black uppercase text-slate-300">
                            Status
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(["paid", "scheduled", "unpaid"] as const).map(
                              (s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => updateItem(i.id, { status: s })}
                                  className={
                                    "rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_black] " +
                                    (i.status === s
                                      ? "bg-[#22C55E] text-black"
                                      : "bg-[#111933] text-white")
                                  }
                                >
                                  {s}
                                </button>
                              )
                            )}
                          </div>
                        </div>
  
                        <div className="sm:col-span-2">
                          <label className="text-xs font-black uppercase text-slate-300">
                            Note
                          </label>
                          <textarea
                            className="mt-1 h-20 w-full resize-none rounded-xl border-[2px] border-black bg-[#111933] p-2 text-sm text-slate-100"
                            value={i.note ?? ""}
                            onChange={(e) =>
                              updateItem(i.id, { note: e.target.value })
                            }
                          />
                        </div>
                      </div>
  
                      <button
                        type="button"
                        onClick={() => removeItem(i.id)}
                        className="mt-4 rounded-full border-[3px] border-black bg-[#F43F7A] px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_black]"
                      >
                        Delete Payment
                      </button>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
                          }