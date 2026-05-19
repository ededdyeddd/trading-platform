"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CANDLES,
  CANDLES_BY_TIMEFRAME,
  DEFAULT_TIMEFRAME,
  WATCHLIST,
  type Candle,
  type Instrument,
  type Timeframe,
} from "@/lib/mock-data";

/**
 * Live-market provider.
 *
 * One setInterval drives the whole terminal heartbeat. On each tick:
 *   1. Each symbol's bid is nudged with a small random walk (spread
 *      held constant; signal reflects the latest direction).
 *   2. The candle history for each symbol is updated — last candle's
 *      close is set to the new mid (widening h/l if the mid pierces
 *      them), or a fresh candle is appended once the prior one ages
 *      out of CANDLE_SECONDS (the 1m chart timeframe).
 *
 * Quotes and candles live in a single combined state object so we
 * derive both atomically from the previous tick, avoiding the
 * setState-in-effect anti-pattern and cascading renders.
 *
 * Initial state mirrors WATCHLIST / CANDLES exactly so the SSR render
 * and the first client render produce identical markup (no hydration
 * flicker). Mutation only starts inside the post-mount effect.
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
/** Candle granularity — matches the chart's `1m` timeframe. */
const CANDLE_SECONDS = 60;

export type LiveQuote = {
  bid: number;
  ask: number;
  signal: "up" | "down" | null;
};

type Quotes = Record<string, LiveQuote>;
type CandlesBySymbol = Record<string, Candle[]>;

const QuotesContext = createContext<Quotes | null>(null);
const CandlesContext = createContext<CandlesBySymbol | null>(null);

function initialQuotes(items: Instrument[]): Quotes {
  const out: Quotes = {};
  for (const i of items) {
    out[i.symbol] = { bid: i.bid, ask: i.ask, signal: i.signal };
  }
  return out;
}

function initialCandles(): CandlesBySymbol {
  // Shallow copy so the provider state never aliases the module-level
  // mock array directly.
  const out: CandlesBySymbol = {};
  for (const [symbol, list] of Object.entries(CANDLES)) {
    out[symbol] = list;
  }
  return out;
}

function nudgeQuotes(prev: Quotes, items: Instrument[]): Quotes {
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

function tickCandles(
  prev: CandlesBySymbol,
  nextQuotes: Quotes
): CandlesBySymbol {
  const next: CandlesBySymbol = { ...prev };
  const nowSec = Math.floor(Date.now() / 1000);

  for (const symbol of Object.keys(prev)) {
    const list = prev[symbol];
    const quote = nextQuotes[symbol];
    if (!list || list.length === 0 || !quote) continue;

    const last = list[list.length - 1];
    const mid = (quote.bid + quote.ask) / 2;

    if (nowSec - last.time >= CANDLE_SECONDS) {
      const newCandle: Candle = {
        time: last.time + CANDLE_SECONDS,
        open: last.close,
        high: Math.max(last.close, mid),
        low: Math.min(last.close, mid),
        close: mid,
        volume: Math.round(50_000 + Math.random() * 200_000),
      };
      next[symbol] = [...list, newCandle];
    } else {
      const updated: Candle = {
        ...last,
        close: mid,
        high: Math.max(last.high, mid),
        low: Math.min(last.low, mid),
      };
      next[symbol] = [...list.slice(0, -1), updated];
    }
  }
  return next;
}

type MarketState = { quotes: Quotes; candles: CandlesBySymbol };

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MarketState>(() => ({
    quotes: initialQuotes(WATCHLIST),
    candles: initialCandles(),
  }));
  // Stable ref to the catalog so the effect doesn't need WATCHLIST in deps.
  const catalogRef = useRef(WATCHLIST);

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const nextQuotes = nudgeQuotes(prev.quotes, catalogRef.current);
        const nextCandles = tickCandles(prev.candles, nextQuotes);
        return { quotes: nextQuotes, candles: nextCandles };
      });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <QuotesContext.Provider value={state.quotes}>
      <CandlesContext.Provider value={state.candles}>
        {children}
      </CandlesContext.Provider>
    </QuotesContext.Provider>
  );
}

export function useQuote(symbol: string): LiveQuote | undefined {
  const ctx = useContext(QuotesContext);
  return ctx?.[symbol];
}

export function useQuotes(): Quotes {
  return useContext(QuotesContext) ?? {};
}

/**
 * Returns the live candles list for a symbol — same heartbeat as
 * `useQuote`, expressed as OHLC bars. Pure context selector: the
 * provider owns the ticking, so consuming this hook causes no extra
 * state updates of its own.
 */
export function useLiveCandles(symbol: string): Candle[] {
  const ctx = useContext(CandlesContext);
  return ctx?.[symbol] ?? CANDLES[symbol] ?? [];
}

/**
 * Returns chart candles for a (symbol, timeframe) pair. The default
 * timeframe ticks live; other timeframes return their pre-generated
 * static history (longer timeframes don't visually tick in real
 * terminals either — daily candles move once a day).
 */
export function useChartCandles(symbol: string, timeframe: Timeframe): Candle[] {
  const liveCtx = useContext(CandlesContext);
  if (timeframe === DEFAULT_TIMEFRAME) {
    return liveCtx?.[symbol] ?? CANDLES[symbol] ?? [];
  }
  return CANDLES_BY_TIMEFRAME[timeframe]?.[symbol] ?? [];
}
