"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Grid3x3 } from "lucide-react";
import { useSettings, type WidgetKey } from "@/lib/settings-context";

const WIDGETS: { key: WidgetKey; label: string; description: string }[] = [
  {
    key: "instruments",
    label: "Instruments",
    description: "Searchable list of tickers and favorites",
  },
  {
    key: "ai",
    label: "AI Insights",
    description: "Recommendation, score and analyst summary for the active symbol",
  },
  {
    key: "chart",
    label: "Chart",
    description: "Price chart with drawing tools",
  },
  {
    key: "positions",
    label: "Open orders",
    description: "Active positions and pending orders",
  },
  {
    key: "order",
    label: "Order ticket",
    description: "Place market, limit and stop orders",
  },
];

export function WidgetsMenu() {
  const { settings, setWidget } = useSettings();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        aria-label="Widgets"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 w-8 items-center justify-center rounded-md ${
          open
            ? "bg-surface-2 text-text"
            : "text-text-muted hover:bg-surface-2 hover:text-text"
        }`}
      >
        <Grid3x3 size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-md border border-border bg-surface-2 py-1 shadow-lg"
        >
          <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-subtle">
            Widgets
          </div>
          {WIDGETS.map((w) => {
            const checked = settings.widgets[w.key];
            return (
              <button
                key={w.key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={checked}
                onClick={() => setWidget(w.key, !checked)}
                className="flex w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-3"
              >
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium ${
                      checked ? "text-text" : "text-text-muted"
                    }`}
                  >
                    {w.label}
                  </div>
                  <div className="mt-0.5 text-xs leading-snug text-text-subtle">
                    {w.description}
                  </div>
                </div>
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                    checked
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-border bg-surface"
                  }`}
                >
                  {checked && <Check size={10} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
