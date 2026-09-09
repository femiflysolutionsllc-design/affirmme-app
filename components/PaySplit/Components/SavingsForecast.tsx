type Props = {
  targetDate?: string;
  remainingAmount: number;
  paycheckA: number;
  paycheckB: number;
};

function daysLeft(targetDate?: string) {
  if (!targetDate) return null;

  const target = new Date(targetDate);
  const today = new Date();

  if (Number.isNaN(target.getTime())) return null;

  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function SavingsForecast({
  targetDate,
  remainingAmount,
  paycheckA,
  paycheckB,
}: Props) {
  const days = daysLeft(targetDate);
  const perCycle = paycheckA + paycheckB;
  const paychecksNeeded =
    perCycle > 0 ? Math.ceil(remainingAmount / perCycle) * 2 : 0;

  return (
    <section className="rounded-[20px] border-[3px] border-black bg-[#080A16] p-4 shadow-[5px_5px_0px_black]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">
        📅 Savings Forecast
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#111933] p-3">
          <p className="text-[10px] font-black uppercase text-slate-400">
            Countdown
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {days === null ? "No date" : days <= 0 ? "Due now" : `${days} days`}
          </p>
        </div>

        <div className="rounded-xl bg-[#111933] p-3">
          <p className="text-[10px] font-black uppercase text-slate-400">
            Paychecks Needed
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {paychecksNeeded || "—"}
          </p>
        </div>

        <div className="rounded-xl bg-[#111933] p-3">
          <p className="text-[10px] font-black uppercase text-slate-400">
            Pace
          </p>
          <p className="mt-1 text-lg font-black text-emerald-300">
            {remainingAmount <= 0
              ? "Complete"
              : perCycle > 0
              ? "On track"
              : "Set amounts"}
          </p>
        </div>
      </div>
    </section>
  );
}