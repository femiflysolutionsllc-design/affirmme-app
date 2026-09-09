"use client";

import React, { useMemo, useState } from "react";
import { PAYMENT_HISTORY_KEY } from "../lib/paysplitStore";

const ACCOUNTS_KEY = "paysplit_accounts_v1";

type AccountType = "cash" | "checking" | "savings" | "card";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color?: "emerald" | "amber" | "rose" | "slate";
  createdAt: number;
};

type PaymentHistoryItem = {
  id: string;
  dateISO?: string;
  name?: string;
  category?: string;
  amount?: number;
  status?: "paid" | "unpaid" | "scheduled";
  note?: string;
  accountId?: string;
  direction?: "inflow" | "outflow";
};

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(safe);
}

function normalizeAccounts(list: unknown): Account[] {
  const source = Array.isArray(list) ? list : [];

  function validType(value: unknown): AccountType {
    return value === "cash" ||
      value === "checking" ||
      value === "savings" ||
      value === "card"
      ? value
      : "checking";
  }

  function validColor(value: unknown): Account["color"] {
    return value === "emerald" ||
      value === "amber" ||
      value === "rose" ||
      value === "slate"
      ? value
      : "slate";
  }

  return source.map((account: any) => ({
    id: String(account?.id ?? uid()),
    name: String(account?.name ?? "Account"),
    type: validType(account?.type),
    balance: Number.isFinite(Number(account?.balance))
      ? Number(account.balance)
      : 0,
    color: validColor(account?.color),
    createdAt: Number.isFinite(Number(account?.createdAt))
      ? Number(account.createdAt)
      : Date.now(),
  }));
}

function normalizePayments(list: unknown): PaymentHistoryItem[] {
  const source = Array.isArray(list) ? list : [];

  return source.map((payment: any) => ({
    id: String(payment?.id ?? uid()),
    dateISO: String(payment?.dateISO ?? ""),
    name: String(payment?.name ?? "Payment"),
    category: String(payment?.category ?? "Bills"),
    amount: Number.isFinite(Number(payment?.amount))
      ? Number(payment.amount)
      : 0,
    status:
      payment?.status === "paid" ||
      payment?.status === "unpaid" ||
      payment?.status === "scheduled"
        ? payment.status
        : "scheduled",
    note: typeof payment?.note === "string" ? payment.note : "",
    accountId:
      typeof payment?.accountId === "string" && payment.accountId
        ? payment.accountId
        : undefined,
    direction:
      payment?.direction === "inflow" ? "inflow" : "outflow",
  }));
}

function accountIcon(type: AccountType) {
  if (type === "cash") return "💵";
  if (type === "checking") return "🏦";
  if (type === "savings") return "💰";
  return "💳";
}

function accountLabel(type: AccountType) {
  if (type === "cash") return "Cash";
  if (type === "checking") return "Checking";
  if (type === "savings") return "Savings";
  return "Credit Card";
}

export default function Accounts() {
  const [rawAccounts, setRawAccounts] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];

    return safeParse<any[]>(
      window.localStorage.getItem(ACCOUNTS_KEY),
      []
    );
  });

  const [rawPayments, setRawPayments] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];

    return safeParse<any[]>(
      window.localStorage.getItem(PAYMENT_HISTORY_KEY),
      []
    );
  });

  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState("");

  React.useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === ACCOUNTS_KEY) {
        setRawAccounts(safeParse<any[]>(event.newValue, []));
      }

      if (event.key === PAYMENT_HISTORY_KEY) {
        setRawPayments(safeParse<any[]>(event.newValue, []));
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(rawAccounts)
    );
  }, [rawAccounts]);

  const accounts = useMemo(
    () => normalizeAccounts(rawAccounts),
    [rawAccounts]
  );

  const payments = useMemo(
    () => normalizePayments(rawPayments),
    [rawPayments]
  );

  function addAccount(
    account: Omit<Account, "id" | "createdAt">
  ) {
    const nextAccount: Account = {
      ...account,
      id: uid(),
      createdAt: Date.now(),
    };

    setRawAccounts((previous) => [
      nextAccount,
      ...(Array.isArray(previous) ? previous : []),
    ]);
  }

  function updateAccount(
    id: string,
    patch: Partial<Account>
  ) {
    setRawAccounts((previous) =>
      normalizeAccounts(previous).map((account) =>
        account.id === id
          ? {
              ...account,
              ...patch,
            }
          : account
      )
    );
  }

  function deleteAccount(id: string) {
    setRawAccounts((previous) =>
      normalizeAccounts(previous).filter(
        (account) => account.id !== id
      )
    );

    const cleanedPayments = normalizePayments(payments).map(
      (payment) =>
        payment.accountId === id
          ? {
              ...payment,
              accountId: undefined,
            }
          : payment
    );

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        PAYMENT_HISTORY_KEY,
        JSON.stringify(cleanedPayments)
      );
    }

    setRawPayments(cleanedPayments);
  }

  const filteredAccounts = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return accounts;

    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(search) ||
        account.type.toLowerCase().includes(search)
    );
  }, [accounts, q]);

  const spendByAccount = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        count: number;
      }
    >();

    payments.forEach((payment) => {
      if (!payment.accountId) return;
      if (payment.status !== "paid") return;
      if (payment.direction === "inflow") return;

      const previous = map.get(payment.accountId) ?? {
        total: 0,
        count: 0,
      };

      map.set(payment.accountId, {
        total: previous.total + Number(payment.amount ?? 0),
        count: previous.count + 1,
      });
    });

    return map;
  }, [payments]);

  const netByAccount = useMemo(() => {
    const map = new Map<string, number>();

    payments.forEach((payment) => {
      if (!payment.accountId) return;
      if (payment.status !== "paid") return;

      const amount = Number(payment.amount ?? 0);
      const change =
        payment.direction === "inflow" ? amount : -amount;

      map.set(
        payment.accountId,
        (map.get(payment.accountId) ?? 0) + change
      );
    });

    return map;
  }, [payments]);

  const totalBalance = useMemo(
    () =>
      accounts.reduce(
        (sum, account) =>
          sum + Number(account.balance || 0),
        0
      ),
    [accounts]
  );

  const totalSpending = useMemo(
    () =>
      Array.from(spendByAccount.values()).reduce(
        (sum, item) => sum + item.total,
        0
      ),
    [spendByAccount]
  );

  const totalNetFlow = useMemo(
    () =>
      Array.from(netByAccount.values()).reduce(
        (sum, value) => sum + value,
        0
      ),
    [netByAccount]
  );

  return (
    <div className="space-y-6">
      {/* Financial Arsenal hero */}
      <section className="accounts-hero-shell relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-6 shadow-[8px_8px_0px_black]">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "radial-gradient(circle at center, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative">
          <div className="inline-flex rounded-full border-[3px] border-black bg-[#F43F7A] px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[5px_5px_0px_black]">
            💳 Financial Arsenal
          </div>

          <h2 className="mt-5 text-3xl font-black uppercase text-white drop-shadow-[4px_4px_0px_black] sm:text-4xl">
            Your Accounts
          </h2>

          <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-300">
            Track cash, checking, savings, and card balances from one financial
            command center.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Balance"
              value={money(totalBalance)}
              icon="💰"
              accentClass="text-emerald-300"
            />

            <SummaryCard
              label="Accounts"
              value={String(accounts.length)}
              icon="🏦"
              accentClass="text-[#60A5FA]"
            />

            <SummaryCard
              label="Linked Spending"
              value={money(totalSpending)}
              icon="💸"
              accentClass="text-[#FACC15]"
            />

            <SummaryCard
              label="Net Cash Flow"
              value={money(totalNetFlow)}
              icon="📈"
              accentClass={
                totalNetFlow >= 0
                  ? "text-emerald-300"
                  : "text-[#F43F7A]"
              }
            />
          </div>
        </div>
      </section>

      {/* Search and add account */}
      <section className="accounts-search-shell rounded-[28px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FACC15]">
          🔍 Find an Account
        </p>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-black uppercase text-slate-300">
              Search by account name or type
            </label>

            <input
              className="mt-2 w-full rounded-xl border-[2px] border-black bg-[#080A16] p-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-[#60A5FA]"
              placeholder="Cash, checking, savings, card..."
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setAddOpen((current) => !current)}
            className={
              "rounded-full border-[3px] border-black px-6 py-3 text-xs font-black uppercase shadow-[5px_5px_0px_black] transition hover:-translate-y-1 " +
              (addOpen
                ? "bg-[#F43F7A] text-white"
                : "bg-[#FACC15] text-black")
            }
          >
            {addOpen ? "✕ Close Form" : "➕ Add Account"}
          </button>
        </div>

        {addOpen && (
          <AddAccountForm
            onAdd={(account) => {
              addAccount(account);
              setAddOpen(false);
            }}
          />
        )}
      </section>

      {/* Account cards */}
      <section className="accounts-list-shell grid gap-5 lg:grid-cols-2">
        {filteredAccounts.length === 0 ? (
          <div className="rounded-[28px] border-[3px] border-black bg-[#0A1024] p-8 text-center shadow-[8px_8px_0px_black] lg:col-span-2">
            <p className="text-5xl">🏦</p>

            <p className="mt-4 text-2xl font-black uppercase text-white">
              No Accounts Found
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-400">
              Add an account or change your search.
            </p>
          </div>
        ) : (
          filteredAccounts.map((account) => {
            const spending = spendByAccount.get(account.id) ?? {
              total: 0,
              count: 0,
            };

            const netFlow = netByAccount.get(account.id) ?? 0;

            return (
              <article
                key={account.id}
                className="relative overflow-hidden rounded-[28px] border-[3px] border-black bg-[#0A1024] p-5 shadow-[8px_8px_0px_black]"
              >
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    background:
                      "radial-gradient(circle at center, white 1px, transparent 1px)",
                    backgroundSize: "13px 13px",
                  }}
                />

                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex rounded-full border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]">
                        {accountIcon(account.type)}{" "}
                        {accountLabel(account.type)}
                      </div>

                      <h3 className="mt-4 text-2xl font-black uppercase text-white drop-shadow-[4px_4px_0px_black]">
                        {account.name}
                      </h3>
                    </div>

                    <div className="rounded-[20px] border-[3px] border-black bg-[#111933] px-4 py-3 text-right shadow-[5px_5px_0px_black]">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Current Balance
                      </p>

                      <p className="mt-1 text-xl font-black text-emerald-300">
                        {money(account.balance)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] border-[3px] border-black bg-[#111933] p-4 shadow-[5px_5px_0px_black]">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FACC15]">
                        💸 Money Out
                      </p>

                      <p className="mt-2 text-xl font-black text-white">
                        {money(spending.total)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {spending.count} linked{" "}
                        {spending.count === 1 ? "payment" : "payments"}
                      </p>
                    </div>

                    <div className="rounded-[20px] border-[3px] border-black bg-[#111933] p-4 shadow-[5px_5px_0px_black]">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#60A5FA]">
                        📊 Net Activity
                      </p>

                      <p
                        className={
                          "mt-2 text-xl font-black " +
                          (netFlow >= 0
                            ? "text-emerald-300"
                            : "text-[#F43F7A]")
                        }
                      >
                        {money(netFlow)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Paid linked activity
                      </p>
                    </div>
                  </div>

                  <details className="mt-5 rounded-[20px] border-[3px] border-black bg-[#080A16] p-4 shadow-[5px_5px_0px_black]">
                    <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.14em] text-white">
                      ⚙️ Edit Account
                    </summary>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-black uppercase text-slate-300">
                          Name
                        </label>

                        <input
                          className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-3 text-sm text-slate-100"
                          value={account.name}
                          onChange={(event) =>
                            updateAccount(account.id, {
                              name: event.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black uppercase text-slate-300">
                          Type
                        </label>

                        <select
                          className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-3 text-sm text-slate-100"
                          value={account.type}
                          onChange={(event) =>
                            updateAccount(account.id, {
                              type: event.target.value as AccountType,
                            })
                          }
                        >
                          <option value="cash">Cash</option>
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                          <option value="card">Card</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-black uppercase text-slate-300">
                          Balance
                        </label>

                        <input
                          inputMode="decimal"
                          className="mt-1 w-full rounded-xl border-[2px] border-black bg-[#111933] p-3 text-sm text-slate-100"
                          value={String(account.balance)}
                          onChange={(event) =>
                            updateAccount(account.id, {
                              balance: Number(event.target.value || 0),
                            })
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteAccount(account.id)}
                      className="mt-4 rounded-full border-[3px] border-black bg-[#F43F7A] px-5 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_black]"
                    >
                      Delete Account
                    </button>
                  </details>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Future bank connections */}
      <section className="future-bank-connections-shell rounded-[28px] border-[3px] border-black bg-[#111933] p-5 shadow-[8px_8px_0px_black]">
        <div className="inline-flex rounded-full border-[3px] border-black bg-[#FACC15] px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[5px_5px_0px_black]">
          🔗 Future Bank Connections
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-300">
          This layout is ready for future bank integration. Connected balances,
          transactions, and bill payments can appear here automatically.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {[
            "Chase",
            "Navy Federal",
            "Bank of America",
            "Capital One",
            "Wells Fargo",
          ].map((bank) => (
            <div
              key={bank}
              className="rounded-full border-[3px] border-black bg-[#080A16] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_black]"
            >
              🏦 {bank}
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#60A5FA]">
          Coming in a future banking-integration phase
        </p>
      </section>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  icon: string;
  accentClass: string;
};

function SummaryCard({
  label,
  value,
  icon,
  accentClass,
}: SummaryCardProps) {
  return (
    <div className="rounded-[22px] border-[3px] border-black bg-[#111933] p-4 shadow-[6px_6px_0px_black]">
      <p
        className={`text-[10px] font-black uppercase tracking-[0.16em] ${accentClass}`}
      >
        {icon} {label}
      </p>

      <p className="mt-2 break-words text-2xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function AddAccountForm({
  onAdd,
}: {
  onAdd: (
    account: Omit<Account, "id" | "createdAt">
  ) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] =
    useState<AccountType>("checking");
  const [balance, setBalance] = useState<number>(0);

  function handleSave() {
    if (!name.trim()) {
      alert("Add an account name first.");
      return;
    }

    onAdd({
      name: name.trim(),
      type,
      balance: Number(balance || 0),
      color: "slate",
    });

    setName("");
    setType("checking");
    setBalance(0);
  }

  return (
    <div className="mt-5 rounded-[24px] border-[3px] border-black bg-[#080A16] p-5 shadow-[6px_6px_0px_black]">
      <div className="inline-flex rounded-full border-[3px] border-black bg-[#60A5FA] px-4 py-2 text-xs font-black uppercase text-black shadow-[4px_4px_0px_black]">
        ➕ Add New Account
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-black uppercase text-slate-300">
            Account Name
          </label>

          <input
            className="mt-2 w-full rounded-xl border-[2px] border-black bg-[#111933] p-3 text-sm text-slate-100"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Cash Wallet, Checking, Savings..."
          />
        </div>

        <div>
          <label className="text-xs font-black uppercase text-slate-300">
            Account Type
          </label>

          <select
            className="mt-2 w-full rounded-xl border-[2px] border-black bg-[#111933] p-3 text-sm text-slate-100"
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as AccountType
              )
            }
          >
            <option value="cash">Cash</option>
            <option value="checking">
              Checking
            </option>
            <option value="savings">
              Savings
            </option>
            <option value="card">
              Card
            </option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-black uppercase text-slate-300">
            Starting Balance
          </label>

          <input
            inputMode="decimal"
            className="mt-2 w-full rounded-xl border-[2px] border-black bg-[#111933] p-3 text-sm text-slate-100"
            value={String(balance)}
            onChange={(event) =>
              setBalance(
                Number(event.target.value || 0)
              )
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-5 w-full rounded-full border-[3px] border-black bg-[#22C55E] px-5 py-3 text-sm font-black uppercase text-black shadow-[5px_5px_0px_black] transition hover:-translate-y-1"
      >
        Save Account
      </button>
    </div>
  );
}