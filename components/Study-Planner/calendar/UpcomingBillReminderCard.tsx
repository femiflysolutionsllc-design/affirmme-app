"use client";

import type {
  UpcomingBillReminder,
} from "./calendarTypes";

type UpcomingBillReminderCardProps = {
  reminder: UpcomingBillReminder;
  isPinned: boolean;
  onAcknowledge: () => void;
  onPin: () => void;
};

function money(value: number) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(
    Number.isFinite(value)
      ? value
      : 0
  );
}

function formatDueDate(
  dateISO: string
) {
  const date = new Date(
    `${dateISO}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateISO;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

export default function UpcomingBillReminderCard({
  reminder,
  isPinned,
  onAcknowledge,
  onPin,
}: UpcomingBillReminderCardProps) {
  return (
    <div
  className={
    (isPinned
      ? ""
      : "animate-[pulse_2.8s_ease-in-out_infinite] ") +
    "rounded-[20px] border-[3px] border-black bg-[#FACC15] p-4 text-black shadow-[5px_5px_0px_black]"
  }
>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
  <p className="text-[10px] font-black uppercase tracking-[0.18em]">
    ⚠️ Upcoming Bill
  </p>

  {isPinned && (
    <span className="rounded-full border-[2px] border-black bg-[#60A5FA] px-2 py-0.5 text-[9px] font-black uppercase text-black">
      ★ Pinned
    </span>
  )}
</div>

          <p className="mt-1 text-lg font-black">
            {reminder.title} •{" "}
            {money(reminder.amount)}
          </p>

          <p className="mt-1 text-xs font-bold">
            Due{" "}
            {formatDueDate(
              reminder.dueDate
            )}
            {" · "}
            {reminder.daysUntilDue === 0
              ? "Due today"
              : `${reminder.daysUntilDue} day${
                  reminder.daysUntilDue === 1
                    ? ""
                    : "s"
                } away`}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border-[2px] border-black bg-white/70 px-2 py-1 text-[10px] font-black">
              💰 {money(
                reminder.reservedAmount
              )} reserved
            </span>

            {reminder.fullyReserved ? (
              <span className="rounded-full border-[2px] border-black bg-[#22C55E] px-2 py-1 text-[10px] font-black">
                ✓ Fully funded
              </span>
            ) : (
              <span className="rounded-full border-[2px] border-black bg-[#F43F7A] px-2 py-1 text-[10px] font-black text-white">
                {money(
                  reminder.remainingAmount
                )} still needed
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onAcknowledge}
            title="Acknowledge reminder"
            className="rounded-xl border-[3px] border-black bg-[#22C55E] px-3 py-2 text-sm font-black shadow-[3px_3px_0px_black]"
          >
            ✓
          </button>

          <button
  type="button"
  onClick={onPin}
  title={
    isPinned
      ? "Unpin reminder"
      : "Pin reminder"
  }
  className={
    "rounded-xl border-[3px] border-black px-3 py-2 text-sm font-black shadow-[3px_3px_0px_black] " +
    (isPinned
      ? "bg-[#60A5FA] text-black"
      : "bg-white text-black")
  }
>
  ★
</button>
        </div>
      </div>
    </div>
  );
}