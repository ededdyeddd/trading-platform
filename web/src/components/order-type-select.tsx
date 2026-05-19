"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Order-type dropdown — single source of truth for picking
 * Market / Limit / Stop. Used by `<OrderPanel>` (right-hand form) and
 * `<OpenPositionDialog>` (double-click ticket) so both surfaces offer
 * the same set of order types in the same chrome.
 *
 * Click-outside and Escape dismiss the menu. Caller owns the selected
 * value via `value`/`onChange`.
 */

export type OrderType = "market" | "limit" | "stop";

export const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: "market", label: "Market" },
  { value: "limit", label: "Limit" },
  { value: "stop", label: "Stop" },
];

export function OrderTypeSelect({
  value,
  onChange,
}: {
  value: OrderType;
  onChange: (next: OrderType) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const current = useMemo(
    () => ORDER_TYPES.find((o) => o.value === value),
    [value]
  );

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, handleOutsideClick, handleKey]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs hover:bg-surface-3"
      >
        <span className="text-text">{current?.label ?? "Market"}</span>
        <div className="flex-1" />
        <ChevronDown
          size={12}
          className={`text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-border bg-surface-2 py-1 shadow-lg"
        >
          {ORDER_TYPES.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors ${
                  selected
                    ? "bg-surface-3 text-text"
                    : "text-text-muted hover:bg-surface-3 hover:text-text"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
