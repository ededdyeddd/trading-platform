"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { WATCHLIST, type Instrument } from "@/lib/mock-data";

/**
 * Live-quotes provider.
 *
 * Every TICK_INTERVAL_MS the provider nudges each symbol's bid/ask with
 * a small random walk so the UI doesn't look static. Spread is held
 * constant; signal reflects the latest tick direction. The same shape
 * will later feed the chart panel's last-candle update — keep the
 * surface (useQuote / useQuotes) stable.
 *
 * Initial state mirrors WATCHLIST exactly so the SSR render and the
 * first client render produce identical markup (no hydration flicker).
 * Mutation only starts inside the post-mount effect.
 */

/**
 * Canonical tick cadence for any mock-data block that simulates live
 * updates (quotes, chart last-candle, sentiment, P/L, etc.). Import
 * from here — do not redefine per-component — so the whole terminal
 * heartbeats in sync.
 */
export const TICK_INTERVAL_MS = 5_000;
/** Per-tick std-dev as a fraction of mid-price. ~3 bps. */
const TICK_VOLATILITY = 0.0003;

export type LiveQuote = {
  bid: number;
  ask: number;
  signal: "up" | "down" | null;
};

type Quotes = Record<string, LiveQuote>;

const QuotesContext = createContext<Quotes | null>(null);

function initialQuotes(items: Instrument[]): Quotes {
  const out: Quotes = {};
  for (const i of items) {
    out[i.symbol] = { bid: i.bid, ask: i.ask, signal: i.signal };
  }
  return out;
}

function nudge(prev: Quotes, items: Instrument[]): Quotes {
  const next: Quotes = {};
  for (const i of items) {
    const p = prev[i.symbol];
    if (!p) {
      next[i.symbol] = { bid: i.bid, ask: i.ask, signal: i.signal };
      continue;
    }
    const mid = (p.bid + p.ask) / 2;
    const delta = (Math.random() - 0.5) * 2 * mid * TICK_VOLATILITY;
    const spread = p.ask - p.bid;
    const newBid = Math.max(0, p.bid + delta);
    const newAsk = newBid + spread;
    const signal: "up" | "down" | null =
      delta > 0 ? "up" : delta < 0 ? "down" : p.signal;
    next[i.symbol] = { bid: newBid, ask: newAsk, signal };
  }
  return next;
}

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<Quotes>(() => initialQuotes(WATCHLIST));
  // Stable ref to the catalog so the effect doesn't need WATCHLIST in deps.
  const catalogRef = useRef(WATCHLIST);

  useEffect(() => {
    const id = setInterval(() => {
      setQuotes((prev) => nudge(prev, catalogRef.current));
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <QuotesContext.Provider value={quotes}>{children}</QuotesContext.Provider>
  );
}

export function useQuote(symbol: string): LiveQuote | undefined {
  const ctx = useContext(QuotesContext);
  return ctx?.[symbol];
}

export function useQuotes(): Quotes {
  return useContext(QuotesContext) ?? {};
}
