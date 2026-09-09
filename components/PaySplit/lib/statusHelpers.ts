export function statusFromAfter(amount: number) {
  if (amount < 0) {
    return {
      label: "Overdrawn",
      cls: "border-rose-500/40 bg-rose-950/30 text-rose-300",
    };
  }

  if (amount < 100) {
    return {
      label: "Tight",
      cls: "border-amber-500/40 bg-amber-950/30 text-amber-300",
    };
  }

  return {
    label: "Healthy",
    cls: "border-emerald-500/40 bg-emerald-950/30 text-emerald-300",
  };
}