"use client";

type MoneyInputProps = {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
};

function parseMoney(value: string) {
  const cleaned = value.replace(/,/g, "").trim();

  if (cleaned === "") return 0;

  const n = Number(cleaned);

  return Number.isFinite(n) ? n : 0;
}

export default function MoneyInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
}: MoneyInputProps) {
  return (
    <input
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={
        value === undefined
          ? ""
          : value.toLocaleString("en-US")
      }
      onChange={(e) => onChange(parseMoney(e.target.value))}
    />
  );
}