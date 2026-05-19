"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  ACCOUNT,
  PENDING_ORDERS,
  POSITIONS,
  computePnl,
  getInstrument,
  type ClosedPosition,
  type PendingOrder,
  type Position,
} from "@/lib/mock-data";
import { useQuotes } from "@/lib/quotes-context";

/**
 * PositionsProvider — single source of truth for the user's trading
 * activity in the prototype:
 *
 *  - `positions`         — currently open (live PnL ticks via consumers
 *                          reading `useQuote(symbol)`)
 *  - `pendingOrders`     — waiting for trigger price; not auto-executed
 *                          (prototype: user converts manually if needed)
 *  - `closedPositions`   — history (manual close adds entries)
 *
 * Actions mutate the in-memory state (no persistence — same precedent
 * as panel sizes and favorites). Caller passes the relevant price for
 * each operation so the provider doesn't need to peek into quotes
 * context.
 */

const POSITION_ID_PREFIX = "P-";
const ORDER_ID_PREFIX = "O-";

function newId(prefix: string): string {
  // Time-prefix gives a rough sort order; random suffix avoids collisions.
  return (
    prefix +
    Date.now().toString(36) +
    Math.floor(Math.random() * 0xfff)
      .toString(36)
      .padStart(3, "0")
  );
}

export type OpenMarketArgs = {
  symbol: string;
  side: "buy" | "sell";
  volume: number;
  /** Fill price — caller passes the current ask (buy) or bid (sell). */
  openPrice: number;
  takeProfit: number | null;
  stopLoss: number | null;
};

export type OpenPendingArgs = {
  symbol: string;
  side: "buy" | "sell";
  type: "limit" | "stop";
  volume: number;
  triggerPrice: number;
  takeProfit: number | null;
  stopLoss: number | null;
};

export type PositionPatch = {
  takeProfit?: number | null;
  stopLoss?: number | null;
};

type Ctx = {
  positions: Position[];
  pendingOrders: PendingOrder[];
  closedPositions: ClosedPosition[];
  openMarketPosition: (args: OpenMarketArgs) => Position;
  openPendingOrder: (args: OpenPendingArgs) => PendingOrder;
  closePosition: (id: string, closePrice: number) => void;
  cancelPendingOrder: (id: string) => void;
  updatePosition: (id: string, patch: PositionPatch) => void;
};

/** Combined state — `closePosition` updates both `positions` and
 *  `closedPositions` atomically, in a single setState. Splitting
 *  these into separate useStates (with nested setState calls) double-
 *  applies under React strict mode and silently doubles closed rows. */
type MarketState = {
  positions: Position[];
  pendingOrders: PendingOrder[];
  closedPositions: ClosedPosition[];
};

const PositionsContext = createContext<Ctx | null>(null);

export function PositionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<MarketState>(() => ({
    positions: [...POSITIONS],
    pendingOrders: [...PENDING_ORDERS],
    closedPositions: [],
  }));

  const openMarketPosition = useCallback((args: OpenMarketArgs): Position => {
    const position: Position = {
      id: newId(POSITION_ID_PREFIX),
      symbol: args.symbol,
      side: args.side,
      volume: args.volume,
      openPrice: args.openPrice,
      takeProfit: args.takeProfit,
      stopLoss: args.stopLoss,
      openedAt: Date.now(),
    };
    setState((prev) => ({ ...prev, positions: [...prev.positions, position] }));
    return position;
  }, []);

  const openPendingOrder = useCallback(
    (args: OpenPendingArgs): PendingOrder => {
      const order: PendingOrder = {
        id: newId(ORDER_ID_PREFIX),
        symbol: args.symbol,
        side: args.side,
        type: args.type,
        volume: args.volume,
        triggerPrice: args.triggerPrice,
        takeProfit: args.takeProfit,
        stopLoss: args.stopLoss,
        createdAt: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        pendingOrders: [...prev.pendingOrders, order],
      }));
      return order;
    },
    []
  );

  const closePosition = useCallback((id: string, closePrice: number) => {
    setState((prev) => {
      const target = prev.positions.find((p) => p.id === id);
      if (!target) return prev;
      const closed: ClosedPosition = {
        ...target,
        closePrice,
        closedAt: Date.now(),
        realizedPnl: computePnl(target, closePrice),
      };
      return {
        ...prev,
        positions: prev.positions.filter((p) => p.id !== id),
        closedPositions: [...prev.closedPositions, closed],
      };
    });
  }, []);

  const cancelPendingOrder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      pendingOrders: prev.pendingOrders.filter((o) => o.id !== id),
    }));
  }, []);

  const updatePosition = useCallback((id: string, patch: PositionPatch) => {
    setState((prev) => {
      const idx = prev.positions.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const next = prev.positions.slice();
      next[idx] = { ...prev.positions[idx], ...patch };
      return { ...prev, positions: next };
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      positions: state.positions,
      pendingOrders: state.pendingOrders,
      closedPositions: state.closedPositions,
      openMarketPosition,
      openPendingOrder,
      closePosition,
      cancelPendingOrder,
      updatePosition,
    }),
    [
      state,
      openMarketPosition,
      openPendingOrder,
      closePosition,
      cancelPendingOrder,
      updatePosition,
    ]
  );

  return (
    <PositionsContext.Provider value={value}>
      {children}
    </PositionsContext.Provider>
  );
}

export function usePositions(): Ctx {
  const ctx = useContext(PositionsContext);
  if (!ctx) {
    throw new Error(
      "usePositions must be used inside <PositionsProvider>"
    );
  }
  return ctx;
}

/** True when the user holds any open position on this symbol. */
export function useHasOpenPosition(symbol: string): boolean {
  const { positions } = usePositions();
  return positions.some((p) => p.symbol === symbol);
}

/** True when the user has any open position OR pending order on this symbol. */
export function useHasActivity(symbol: string): boolean {
  const { positions, pendingOrders } = usePositions();
  return (
    positions.some((p) => p.symbol === symbol) ||
    pendingOrders.some((o) => o.symbol === symbol)
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Live account stats — derived from positions + closed history + live
 * quotes. Replaces the static `ACCOUNT` const for any consumer that
 * needs values that should react to trading activity.
 *
 * Prototype model (no margin amplification, no overnight concept):
 *   initial         = ACCOUNT.balance ($10k starting deposit)
 *   realizedPnL     = Σ closedPositions[i].realizedPnl
 *   unrealizedPnL   = Σ computePnl(p, markPrice) over open positions
 *   marginUsed      = Σ p.volume × p.openPrice over open positions
 *   equity (balance)= initial + realizedPnL + unrealizedPnL  (ticks live)
 *   cash / buying   = initial + realizedPnL − marginUsed    (drops on open, rises on close)
 *   dayPnL / total  = realizedPnL + unrealizedPnL           (same for a single-session prototype)
 *
 * Mark price uses the live `useQuote(symbol)`: bid for buy positions
 * (where you'd sell to close), ask for sell positions (where you'd
 * buy to close). Falls back to the seed value when no live quote yet.
 * ─────────────────────────────────────────────────────────────────────*/

export type AccountStats = {
  balance: number;
  cash: number;
  buyingPower: number;
  marginUsed: number;
  dayPnL: number;
  totalPnL: number;
  equity: number;
  realizedPnL: number;
  unrealizedPnL: number;
};

export function useAccountStats(): AccountStats {
  const { positions, closedPositions } = usePositions();
  const quotes = useQuotes();

  let unrealized = 0;
  let marginUsed = 0;
  for (const p of positions) {
    const instrument = getInstrument(p.symbol);
    const live = quotes[p.symbol];
    const mark =
      p.side === "buy"
        ? live?.bid ?? instrument?.bid ?? p.openPrice
        : live?.ask ?? instrument?.ask ?? p.openPrice;
    unrealized += computePnl(p, mark);
    marginUsed += p.volume * p.openPrice;
  }
  const realized = closedPositions.reduce((s, c) => s + c.realizedPnl, 0);

  const initial = ACCOUNT.balance;
  const equity = initial + realized + unrealized;
  const cash = initial + realized - marginUsed;
  const totalPnL = realized + unrealized;

  return {
    balance: equity,
    cash,
    buyingPower: cash,
    marginUsed,
    dayPnL: totalPnL,
    totalPnL,
    equity,
    realizedPnL: realized,
    unrealizedPnL: unrealized,
  };
}
