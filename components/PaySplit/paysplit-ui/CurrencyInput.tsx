"use client";

import React, { useEffect, useState } from "react";

type CurrencyInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

function formatEditableValue(value: number) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return String(value);
}

function sanitizeCurrencyInput(value: string) {
  let cleaned = value.replace(/[$,\s]/g, "");
  cleaned = cleaned.replace(/[^\d.]/g, "");

  const decimalIndex = cleaned.indexOf(".");

  if (decimalIndex !== -1) {
    const wholeNumber = cleaned.slice(0, decimalIndex);
    const decimalPart = cleaned
      .slice(decimalIndex + 1)
      .replace(/\./g, "")
      .slice(0, 2);

    cleaned = `${wholeNumber}.${decimalPart}`;
  }

  return cleaned;
}

export default function CurrencyInput({
  value,
  onChange,
  className = "",
  placeholder = "$0.00",
  disabled = false,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    formatCurrency(value)
  );

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  function handleFocus() {
    setIsFocused(true);
    setDisplayValue(formatEditableValue(value));
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const cleaned = sanitizeCurrencyInput(event.target.value);

    setDisplayValue(cleaned);

    if (cleaned === "" || cleaned === ".") {
      onChange(0);
      return;
    }

    const parsedValue = Number(cleaned);

    if (Number.isFinite(parsedValue)) {
      onChange(Math.max(0, parsedValue));
    }
  }

  function handleBlur() {
    setIsFocused(false);
    setDisplayValue(formatCurrency(value));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      disabled={disabled}
      value={displayValue}
      placeholder={placeholder}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}