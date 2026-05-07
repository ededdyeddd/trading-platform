"use client";

import { ArrowDown, ArrowUp, ChevronRight, Search, Star } from "lucide-react";
import { ACTIVE_SYMBOL, WATCHLIST, type Instrument } from "@/lib/mock-data";
import { TickerIcon } from "@/components/ticker-icon";

export function InstrumentsPanel() {
  return (
    <div className="flex h-full flex-col gap-2 px-3 pb-3">
      {/* Search */}
      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs">
        <Search size={12} className="text-text-muted" />
        <span className="text-text-muted">Search…</span>
      </div>

      {/* Favorites */}
      <button className="flex h-8 items-center gap-2 rounded-md bg-surface-2 px-3 text-xs hover:bg-surface-3">
        <ChevronRight size={12} className="text-text-muted" />
        <Star size={12} className="text-text-muted" />
        <span className="text-text">Favorites</span>
      </button>

      {/* Column headers */}
      <div className="flex items-center gap-2 px-2 pt-1 text-[10px] uppercase tracking-wider text-text-muted">
        <span>Symbol</span>
        <div className="flex-1" />
        <span className="w-14 text-right">Bid</span>
        <span className="w-14 text-right">Ask</span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-0.5">
        {WATCHLIST.map((instrument) => (
          <InstrumentRow
            key={instrument.symbol}
            instrument={instrument}
            active={instrument.symbol === ACTIVE_SYMBOL}
          />
        ))}
      </div>
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
  const { symbol, bid, ask, signal } = instrument;
  const sideBg = signal === "down" ? "bg-sell-soft text-sell" : "bg-buy-soft text-buy";

  return (
    <button
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
        active ? "bg-surface-2" : "hover:bg-surface-2"
      }`}
    >
      <span className="select-none font-mono text-[8px] leading-none text-text-subtle">
        ⋮⋮
      </span>
      <TickerIcon symbol={symbol} size={14} />
      <span className="font-semibold text-text">{symbol}</span>
      <div className="flex-1" />
      {signal === "up" && <ArrowUp size={11} className="text-buy" />}
      {signal === "down" && <ArrowDown size={11} className="text-sell" />}
      <span
        className={`w-14 rounded px-1 py-0.5 text-right font-mono text-[10px] tabular-nums ${sideBg}`}
      >
        {bid.toFixed(2)}
      </span>
      <span
        className={`w-14 rounded px-1 py-0.5 text-right font-mono text-[10px] tabular-nums ${sideBg}`}
      >
        {ask.toFixed(2)}
      </span>
    </button>
  );
}
