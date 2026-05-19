"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import {
  WATCHLIST,
  filterInstruments,
  type Instrument,
} from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import { useFavorites } from "@/lib/favorites-context";
import { useQuote } from "@/lib/quotes-context";
import { TickerIcon } from "@/components/ticker-icon";

/**
 * "Add instrument" modal — minimal portal-based dialog wired to the
 * existing `filterInstruments(items, "all", query, favorites)` search.
 * Selecting a row calls `openTab(symbol)` which adds it to the header
 * tabs (or just activates an existing tab) and closes the dialog.
 *
 * Inline implementation rather than adding a Radix dialog dep — the
 * prototype only needs backdrop click + Escape to close + autofocus
 * the input.
 */

/**
 * Parent decides when to render (`{open && <AddInstrumentDialog … />}`)
 * — mount/unmount cycles reset internal state naturally, no `open`
 * prop or sync setState-in-effect needed.
 */
export function AddInstrumentDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const { favorites } = useFavorites();
  const { openTabs, openTab } = useActiveInstrument();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => filterInstruments(WATCHLIST, "all", query, favorites),
    [query, favorites]
  );

  // Escape closes — wrapped in useCallback so the listener identity is
  // stable across query changes (no unnecessary listener swaps).
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    inputRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Portal so we render at <body> rather than inside the <header>,
  // where fixed positioning would be clipped by ancestor overflow.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add instrument"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 pt-24 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-[480px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
      >
        {/* Header — search input with explicit close */}
        <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-3 py-2">
          <Search size={14} className="text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search instruments…"
            className="min-w-0 flex-1 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
            aria-label="Search instruments"
          />
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-3 hover:text-text"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto py-1">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
              <span className="text-xs text-text-muted">
                No instruments found
              </span>
              <span className="text-[11px] text-text-subtle">
                Try a different search query
              </span>
            </div>
          ) : (
            results.map((instrument) => (
              <ResultRow
                key={instrument.symbol}
                instrument={instrument}
                alreadyOpen={openTabs.includes(instrument.symbol)}
                onSelect={() => {
                  openTab(instrument.symbol);
                  onClose();
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function ResultRow({
  instrument,
  alreadyOpen,
  onSelect,
}: {
  instrument: Instrument;
  alreadyOpen: boolean;
  onSelect: () => void;
}) {
  const { symbol, name, precision } = instrument;
  const live = useQuote(symbol);
  const bid = live?.bid ?? instrument.bid;
  const ask = live?.ask ?? instrument.ask;
  const signal = live?.signal ?? instrument.signal;
  const sideBg =
    signal === "down"
      ? "bg-sell-soft text-sell"
      : signal === "up"
        ? "bg-buy-soft text-buy"
        : "bg-surface-2 text-text-muted";

  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-2"
    >
      <TickerIcon symbol={symbol} size={16} />
      <span className="font-semibold text-text">{symbol}</span>
      <span className="truncate text-text-muted">{name}</span>
      <div className="flex-1" />
      {alreadyOpen && (
        <span className="rounded-sm bg-surface-3 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
          Open
        </span>
      )}
      <span className="flex w-6 items-center justify-center">
        {signal === "up" && <ArrowUp size={11} className="text-buy" />}
        {signal === "down" && <ArrowDown size={11} className="text-sell" />}
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
