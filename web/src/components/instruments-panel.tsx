"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Search, Star, X } from "lucide-react";
import {
  CATEGORY_OPTIONS,
  WATCHLIST,
  filterInstruments,
  type CategoryFilter,
  type Instrument,
} from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import { useFavorites } from "@/lib/favorites-context";
import { useQuote } from "@/lib/quotes-context";
import { TickerIcon } from "@/components/ticker-icon";

export function InstrumentsPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("favorites");
  const { favorites } = useFavorites();
  const { activeSymbol } = useActiveInstrument();

  const results = useMemo(
    () => filterInstruments(WATCHLIST, category, query, favorites),
    [category, query, favorites]
  );

  return (
    <div className="flex flex-col px-3 pb-3">
      {/* Sticky search + category controls — pin to top of the parent's
          scroll viewport so they stay visible while the list scrolls. */}
      <div className="sticky top-0 z-10 -mx-3 flex flex-col gap-2 bg-surface px-3 pb-2 pt-1">
        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs focus-within:border-accent">
          <Search size={12} className="text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-text placeholder:text-text-muted focus:outline-none"
            aria-label="Search instruments"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="flex h-4 w-4 items-center justify-center rounded-full text-text-muted hover:bg-surface-3 hover:text-text"
            >
              <X size={11} />
            </button>
          )}
        </div>

        <CategorySelect value={category} onChange={setCategory} />
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-text-muted">
        <span>Symbol</span>
        <div className="flex-1" />
        <span className="w-12 text-center">Signal</span>
        <span className="w-16 text-right">Bid</span>
        <span className="w-16 text-right">Ask</span>
      </div>

      {/* List / empty state */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-12 text-center">
          <span className="text-xs text-text-muted">No instruments found</span>
          <span className="text-[11px] text-text-subtle">
            Try a different search or category
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {results.map((instrument) => (
            <InstrumentRow
              key={instrument.symbol}
              instrument={instrument}
              active={instrument.symbol === activeSymbol}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const current = CATEGORY_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs hover:bg-surface-3"
      >
        <span className="text-text">{current?.label ?? "All"}</span>
        <div className="flex-1" />
        <ChevronDown
          size={12}
          className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-surface-2 py-1 shadow-lg"
        >
          {CATEGORY_OPTIONS.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
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

function InstrumentRow({
  instrument,
  active,
}: {
  instrument: Instrument;
  active: boolean;
}) {
  const { symbol, precision } = instrument;
  const live = useQuote(symbol);
  const { isFavorite, toggle } = useFavorites();
  const bid = live?.bid ?? instrument.bid;
  const ask = live?.ask ?? instrument.ask;
  const signal = live?.signal ?? instrument.signal;
  const fav = isFavorite(symbol);
  const sideBg =
    signal === "down"
      ? "bg-sell-soft text-sell"
      : signal === "up"
        ? "bg-buy-soft text-buy"
        : "bg-surface-2 text-text-muted";

  return (
    <button
      aria-current={active ? "true" : undefined}
      className={`relative flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
        active ? "bg-surface-2" : "hover:bg-surface-2"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent"
        />
      )}
      <span
        role="button"
        tabIndex={0}
        aria-label={fav ? `Remove ${symbol} from favorites` : `Add ${symbol} to favorites`}
        aria-pressed={fav}
        onClick={(e) => {
          e.stopPropagation();
          toggle(symbol);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            toggle(symbol);
          }
        }}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors ${
          fav
            ? "text-warning hover:text-warning/80"
            : "text-text-subtle hover:text-text"
        }`}
      >
        <Star size={12} fill={fav ? "currentColor" : "none"} />
      </span>
      <TickerIcon symbol={symbol} size={16} />
      <span className="truncate font-semibold text-text">{symbol}</span>
      <div className="flex-1" />
      <span className="flex w-12 items-center justify-center">
        {signal === "up" && <ArrowUp size={11} className="text-buy" />}
        {signal === "down" && <ArrowDown size={11} className="text-sell" />}
        {signal === null && <span className="text-text-subtle">–</span>}
      </span>
      <span
        className={`w-16 rounded px-1 py-0.5 text-right font-mono text-[10px] tabular-nums ${sideBg}`}
      >
        {bid.toFixed(precision)}
      </span>
      <span
        className={`w-16 rounded px-1 py-0.5 text-right font-mono text-[10px] tabular-nums ${sideBg}`}
      >
        {ask.toFixed(precision)}
      </span>
    </button>
  );
}
