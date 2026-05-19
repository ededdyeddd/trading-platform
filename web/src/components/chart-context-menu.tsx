"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getInstrument } from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import { usePositions } from "@/lib/positions-context";
import { useQuote } from "@/lib/quotes-context";

/**
 * Right-click context menu over the chart canvas. Reads the live bid/ask
 * for the active symbol and offers market + pending-order shortcuts at
 * the price under the cursor.
 *
 * Order types picked by the geometry of clicked price vs market:
 *   • clicked > ask → Buy Stop (breakout) / Sell Limit (sell-above)
 *   • clicked < bid → Buy Limit (buy-dip) / Sell Stop (cut-loss)
 *   • clicked between bid/ask → only the market actions
 *
 * Volume is hard-coded to 1 — the OrderPanel is where you go for
 * fine-grained sizing / TP-SL pre-set. This menu is the "quick trade"
 * affordance.
 */

const DEFAULT_VOLUME = 1;

export type ChartContextMenuPosition = {
  /** Viewport coords for the menu anchor (the right-click point). */
  x: number;
  y: number;
  /** Price under the cursor (derived from the candle series). */
  price: number;
};

export function ChartContextMenu({
  position,
  onClose,
}: {
  position: ChartContextMenuPosition;
  onClose: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { activeSymbol: symbol } = useActiveInstrument();
  const live = useQuote(symbol);
  const instrument = getInstrument(symbol);
  const { openMarketPosition, openPendingOrder } = usePositions();

  const bid = live?.bid ?? instrument?.bid ?? position.price;
  const ask = live?.ask ?? instrument?.ask ?? position.price;
  const precision = instrument?.precision ?? 2;

  // Decide which pending-order side fits the clicked level.
  // clicked > ask → above market: buy-stop and sell-limit live there
  // clicked < bid → below market: buy-limit and sell-stop
  // clicked in spread → only market makes sense
  let buyPending: { type: "limit" | "stop"; label: string } | null = null;
  let sellPending: { type: "limit" | "stop"; label: string } | null = null;
  if (position.price > ask) {
    buyPending = { type: "stop", label: "Buy Stop" };
    sellPending = { type: "limit", label: "Sell Limit" };
  } else if (position.price < bid) {
    buyPending = { type: "limit", label: "Buy Limit" };
    sellPending = { type: "stop", label: "Sell Stop" };
  }

  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    // mousedown covers both left and right clicks elsewhere; use
    // contextmenu too so a second right-click closes the open menu.
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("contextmenu", handleOutsideClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("contextmenu", handleOutsideClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [handleOutsideClick, handleKey]);

  function buyMarket() {
    openMarketPosition({
      symbol,
      side: "buy",
      volume: DEFAULT_VOLUME,
      openPrice: ask,
      takeProfit: null,
      stopLoss: null,
    });
    onClose();
  }
  function sellMarket() {
    openMarketPosition({
      symbol,
      side: "sell",
      volume: DEFAULT_VOLUME,
      openPrice: bid,
      takeProfit: null,
      stopLoss: null,
    });
    onClose();
  }
  function buyAtPrice(type: "limit" | "stop") {
    openPendingOrder({
      symbol,
      side: "buy",
      type,
      volume: DEFAULT_VOLUME,
      triggerPrice: position.price,
      takeProfit: null,
      stopLoss: null,
    });
    onClose();
  }
  function sellAtPrice(type: "limit" | "stop") {
    openPendingOrder({
      symbol,
      side: "sell",
      type,
      volume: DEFAULT_VOLUME,
      triggerPrice: position.price,
      takeProfit: null,
      stopLoss: null,
    });
    onClose();
  }

  if (typeof document === "undefined") return null;

  // Keep the menu inside the viewport. Rough box: ~220×~180 px.
  const left = Math.min(position.x, window.innerWidth - 240);
  const top = Math.min(position.y, window.innerHeight - 200);

  return createPortal(
    <div
      ref={wrapperRef}
      role="menu"
      aria-label="Chart trade actions"
      style={{ left, top }}
      className="fixed z-50 min-w-[200px] overflow-hidden rounded-md border border-border bg-surface-2 py-1 shadow-2xl"
      onContextMenu={(e) => e.preventDefault()}
    >
      <PriceHeader price={position.price} precision={precision} />
      <MenuItem accent="buy" onClick={buyMarket}>
        Buy at market
        <Hint>{ask.toFixed(precision)}</Hint>
      </MenuItem>
      <MenuItem accent="sell" onClick={sellMarket}>
        Sell at market
        <Hint>{bid.toFixed(precision)}</Hint>
      </MenuItem>
      {(buyPending || sellPending) && (
        <div className="my-1 border-t border-border" />
      )}
      {buyPending && (
        <MenuItem accent="buy" onClick={() => buyAtPrice(buyPending!.type)}>
          {buyPending.label} @ <Hint>{position.price.toFixed(precision)}</Hint>
        </MenuItem>
      )}
      {sellPending && (
        <MenuItem accent="sell" onClick={() => sellAtPrice(sellPending!.type)}>
          {sellPending.label} @ <Hint>{position.price.toFixed(precision)}</Hint>
        </MenuItem>
      )}
    </div>,
    document.body
  );
}

function PriceHeader({
  price,
  precision,
}: {
  price: number;
  precision: number;
}) {
  return (
    <div className="border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-wider text-text-muted">
      Trade at{" "}
      <span className="font-mono text-text">{price.toFixed(precision)}</span>
    </div>
  );
}

function MenuItem({
  accent,
  onClick,
  children,
}: {
  accent: "buy" | "sell";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const accentClass =
    accent === "buy"
      ? "text-buy hover:bg-buy-soft"
      : "text-sell hover:bg-sell-soft";
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-xs font-medium transition-colors ${accentClass}`}
    >
      {children}
    </button>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 font-mono text-[10px] text-text-muted">
      {children}
    </span>
  );
}
