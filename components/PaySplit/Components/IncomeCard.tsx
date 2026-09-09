import type { IncomeSource } from "../lib/incomeStore";

type IncomeCardProps = {
  source: IncomeSource;
  onEdit: () => void;
  onDelete?: () => void;
};

export default function IncomeCard({
  source,
  onEdit,
  onDelete,
}: IncomeCardProps) {
  return (
    <div className="rounded-[28px] border-4 border-black bg-[#141d4d] shadow-[8px_8px_0px_#000] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-black bg-[#25388f] px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-200">
            Income Source
          </p>

          <h3 className="text-xl font-black text-white">
            {source.name || "Untitled Income"}
          </h3>
        </div>

        <span className="rounded-full border-2 border-black bg-emerald-400 px-3 py-1 text-xs font-black uppercase text-black">
          Active
        </span>
      </div>

      {/* Body */}
      <div className="space-y-5 bg-[#1d2a69] p-5 text-white">

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-2xl border-2 border-black bg-[#2d3d8f] p-4">
            <p className="text-xs font-black uppercase text-blue-200">
              Net Income
            </p>

            <p className="mt-1 text-2xl font-black">
              ${source.estimatedNetPay.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-black bg-[#2d3d8f] p-4">
            <p className="text-xs font-black uppercase text-blue-200">
              Frequency
            </p>

            <p className="mt-1 text-lg font-black capitalize">
              {source.frequency.replace("semi", "Semi-")}
            </p>
          </div>

        </div>

        <div className="rounded-2xl border-2 border-black bg-[#2d3d8f] p-4">
          <p className="text-xs font-black uppercase text-blue-200">
            Start Date
          </p>

          <p className="mt-1 text-lg font-bold">
            {source.startDate}
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="flex border-t-4 border-black">

        <button
          onClick={onEdit}
          className="flex-1 border-r-2 border-black bg-yellow-400 py-4 font-black uppercase text-black transition hover:bg-yellow-300"
        >
          ✏️ Edit
        </button>

        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 py-4 font-black uppercase text-white transition hover:bg-red-400"
        >
          🗑 Delete
        </button>

      </div>
    </div>
  );
}