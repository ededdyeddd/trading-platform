"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GripHorizontal, X } from "lucide-react";
import { formatUsd, getInstrument } from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import { useAccountStats, usePositions } from "@/lib/positions-context";
import { useQuote } from "@/lib/quotes-context";
import { TickerIcon } from "@/components/ticker-icon";
import { type Side } from "@/components/sell-buy-quote";
import { OrderTypeSelect, type OrderType } from "@/components/order-type-select";

/**
 * Open-position dialog — triggered by double-click on an InstrumentsPanel
 * row. Rendered as a **floating panel** (no backdrop, app stays
 * interactive); the user can drag the header to reposition it
 * anywhere on the screen, just like a broker-style detachable order
 * ticket.
 *
 * Layout mirrors the broker-flow reference:
 *
 *   Header (drag · ticker · price · close)
 *   Buy / Sell quote split (live bid/ask + side select)
 *   Order type    [Market / Limit / Stop]
 *   Quantity      [..][−][+]
 *   Limit/Stop price (Limit/Stop only)
 *   Take Profit / Stop Loss
 *   ────────────────────────────────
 *   Estimated cost / Buying power summary
 *   [Cancel]              [Buy/Sell SYMBOL · N Shares]
 *
 * Confirm opens the position via PositionsProvider AND calls
 * `openTab(symbol)` so the user lands on that instrument's tab/chart
 * right after the trade. Escape and the X button close it; clicking
 * elsewhere does NOT close (this is a panel, not a modal).
 */

const DIALOG_WIDTH = 320;
const DIALOG_EST_HEIGHT = 460;

export function OpenPositionDialog({
  symbol,
  anchor,
  onClose,
}: {
  symbol: string;
  /** Optional initial position (viewport coords for the dialog's
   *  top-left). Falls back to centred-on-viewport when omitted. */
  anchor?: { x: number; y: number };
  onClose: () => void;
}) {
  const instrument = getInstrument(symbol);
  const live = useQuote(symbol);
  const { openMarketPosition, openPendingOrder } = usePositions();
  const accountStats = useAccountStats();
  const { openTab } = useActiveInstrument();

  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [volume, setVolume] = useState(1);
  const [triggerPriceStr, setTriggerPriceStr] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");

  // Position state — anchored to the trigger row when an anchor is
  // provided (kept clamped inside the viewport); otherwise centred in
  // the upper third. User-mutable via drag.
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") {
      return anchor ?? { x: 200, y: 80 };
    }
    const fallback = {
      x: Math.max(16, (window.innerWidth - DIALOG_WIDTH) / 2),
      y: Math.max(16, (window.innerHeight - DIALOG_EST_HEIGHT) / 3),
    };
    const target = anchor ?? fallback;
    // Clamp inside the viewport so the title bar is always reachable.
    return {
      x: Math.max(8, Math.min(target.x, window.innerWidth - DIALOG_WIDTH - 8)),
      y: Math.max(8, Math.min(target.y, window.innerHeight - 80)),
    };
  });
  // Dragging state drives cursor styling; the ref carries the
  // cursor→top-left offset captured at drag-start so the grabbed
  // point of the header sticks to the cursor.
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

  // Escape closes — stable handler so the listener doesn't churn.
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Drag wiring — listeners live on `document` only while dragging so
  // motion continues even if the cursor briefly leaves the header
  // bounds, and we don't pay for global mousemove subscriptions when
  // the dialog is idle.
  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      if (!dragOffsetRef.current) return;
      const next = {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      };
      // Clamp so the dialog stays on-screen.
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 40;
      setPos({
        x: Math.max(-DIALOG_WIDTH + 80, Math.min(next.x, maxX)),
        y: Math.max(0, Math.min(next.y, maxY)),
      });
    }
    function onUp() {
      dragOffsetRef.current = null;
      setDragging(false);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  function handleDragStart(e: React.MouseEvent<HTMLDivElement>) {
    // Only react to primary button. Ignore drags that started on a
    // button (close X) so clicking it still closes cleanly.
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    setDragging(true);
    e.preventDefault();
  }

  if (!instrument) return null;

  const bid = live?.bid ?? instrument.bid;
  const ask = live?.ask ?? instrument.ask;
  const precision = instrument.precision;
  // Seed the trigger-price field with a sensible default when the
  // user flips to Limit/Stop — buy-side anchors to ask, sell-side to bid.
  const defaultTrigger = side === "buy" ? ask : bid;
  const triggerNum = triggerPriceStr.trim()
    ? Number(triggerPriceStr)
    : defaultTrigger;
  const tpNum = tp.trim() ? Number(tp) : null;
  const slNum = sl.trim() ? Number(sl) : null;

  const fillPrice =
    orderType === "market" ? (side === "buy" ? ask : bid) : triggerNum;
  const estimatedCost = volume * fillPrice;

  const isValid =
    volume > 0 &&
    (orderType === "market" ||
      (Number.isFinite(triggerNum) && triggerNum > 0));

  function handleConfirm() {
    if (!isValid) return;
    if (orderType === "market") {
      openMarketPosition({
        symbol,
        side,
        volume,
        openPrice: side === "buy" ? ask : bid,
        takeProfit: tpNum,
        stopLoss: slNum,
      });
    } else {
      openPendingOrder({
        symbol,
        side,
        type: orderType,
        volume,
        triggerPrice: triggerNum,
        takeProfit: tpNum,
        stopLoss: slNum,
      });
    }
    // Switch the chart/order panel to this symbol so the user sees the
    // line they just placed.
    openTab(symbol);
    onClose();
  }

  if (typeof document === "undefined") return null;

  const unit = volume === 1 ? "Share" : "Shares";
  const verb = side === "buy" ? "Buy" : "Sell";
  const confirmLabel = `${verb} ${symbol} · ${volume} ${unit}`;
  const confirmStyles =
    side === "buy"
      ? "bg-accent text-accent-fg hover:bg-accent-hover"
      : "bg-sell text-text hover:opacity-90";

  return createPortal(
    <div
      role="dialog"
      aria-label={`Open position on ${symbol}`}
      style={{ left: pos.x, top: pos.y, width: DIALOG_WIDTH }}
      className="fixed z-50 flex max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
    >
      {/* Header — drag handle */}
      <div
        onMouseDown={handleDragStart}
        className="flex select-none items-center gap-2 border-b border-border bg-surface-2 px-3 py-2"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <GripHorizontal size={12} className="shrink-0 text-text-subtle" />
        <TickerIcon symbol={symbol} size={14} />
        <span className="text-xs font-semibold text-text">{symbol}</span>
        <span className="font-mono text-xs tabular-nums text-text-muted">
          {(side === "buy" ? ask : bid).toFixed(precision)}
        </span>
        <div className="flex-1" />
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted hover:bg-surface-3 hover:text-text"
        >
          <X size={12} />
        </button>
      </div>

        {/* Scrollable body */}
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-3">
          <SideTabs value={side} onChange={setSide} />

          <Row label="Order type">
            <OrderTypeSelect value={orderType} onChange={setOrderType} />
          </Row>

          <Row label="Quantity">
            <StepperField
              value={String(volume)}
              onChange={(v) => setVolume(Number(v) || 0)}
              onMinus={() => setVolume(Math.max(0, volume - 1))}
              onPlus={() => setVolume(volume + 1)}
              mono
            />
          </Row>

          {orderType !== "market" && (
            <Row
              label={orderType === "limit" ? "Limit price" : "Stop price"}
              hint={`Bid ${bid.toFixed(precision)} · Ask ${ask.toFixed(precision)}`}
            >
              <StepperField
                value={triggerPriceStr}
                onChange={setTriggerPriceStr}
                onMinus={() =>
                  setTriggerPriceStr((prev) =>
                    (prev ? Number(prev) - 1 : defaultTrigger - 1).toFixed(
                      precision
                    )
                  )
                }
                onPlus={() =>
                  setTriggerPriceStr((prev) =>
                    (prev ? Number(prev) + 1 : defaultTrigger + 1).toFixed(
                      precision
                    )
                  )
                }
                placeholder={defaultTrigger.toFixed(precision)}
                mono
              />
            </Row>
          )}

          <Row label="Take profit">
            <StepperField
              value={tp}
              onChange={setTp}
              onMinus={() =>
                setTp((prev) =>
                  (prev ? Number(prev) - 1 : ask + 1).toFixed(precision)
                )
              }
              onPlus={() =>
                setTp((prev) =>
                  (prev ? Number(prev) + 1 : ask + 1).toFixed(precision)
                )
              }
              placeholder="Not set"
              mono
            />
          </Row>

          <Row label="Stop loss">
            <StepperField
              value={sl}
              onChange={setSl}
              onMinus={() =>
                setSl((prev) =>
                  (prev ? Number(prev) - 1 : bid - 1).toFixed(precision)
                )
              }
              onPlus={() =>
                setSl((prev) =>
                  (prev ? Number(prev) + 1 : bid - 1).toFixed(precision)
                )
              }
              placeholder="Not set"
              mono
            />
          </Row>

          {/* Summary */}
          <div className="mt-1 flex flex-col gap-1 border-t border-border pt-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Estimated cost</span>
              <span className="font-mono font-semibold text-text tabular-nums">
                {formatUsd(estimatedCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Buying power</span>
              <span className="font-mono tabular-nums text-text-muted">
                {formatUsd(accountStats.buyingPower)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-2 px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs text-text hover:bg-surface-3"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            aria-disabled={!isValid}
            className={`flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors ${confirmStyles} ${
              !isValid ? "cursor-not-allowed opacity-50 hover:opacity-50" : ""
            }`}
          >
            {confirmLabel}
          </button>
        </div>
    </div>,
    document.body
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Row — label on the left, control on the right; optional hint below.
 * ─────────────────────────────────────────────────────────────────────*/

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex w-20 flex-col gap-0.5 pt-1.5 text-[11px]">
        <span className="text-text-muted">{label}</span>
        {hint && (
          <span className="font-mono text-[9px] leading-tight text-text-subtle">
            {hint}
          </span>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Side tabs — compact Buy/Sell segmented control (replaces the larger
 * SellBuyQuoteSplit card we use in the OrderPanel).
 * ─────────────────────────────────────────────────────────────────────*/

function SideTabs({
  value,
  onChange,
}: {
  value: Side;
  onChange: (next: Side) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-md bg-surface-2 p-1">
      <button
        type="button"
        onClick={() => onChange("buy")}
        aria-pressed={value === "buy"}
        className={`flex h-7 items-center justify-center rounded text-xs font-semibold transition-colors ${
          value === "buy"
            ? "bg-accent text-accent-fg"
            : "text-text-muted hover:text-text"
        }`}
      >
        Buy
      </button>
      <button
        type="button"
        onClick={() => onChange("sell")}
        aria-pressed={value === "sell"}
        className={`flex h-7 items-center justify-center rounded text-xs font-semibold transition-colors ${
          value === "sell"
            ? "bg-sell text-text"
            : "text-text-muted hover:text-text"
        }`}
      >
        Sell
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Stepper field — same chrome as OrderPanel's FormField, simplified.
 * ─────────────────────────────────────────────────────────────────────*/

function StepperField({
  value,
  onChange,
  onMinus,
  onPlus,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (next: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs focus-within:border-accent">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent text-text placeholder:text-text-muted focus:outline-none ${
          mono ? "font-mono tabular-nums" : ""
        }`}
      />
      <div className="flex items-center gap-2 border-l border-border pl-2 text-text-muted">
        <button
          type="button"
          onClick={onMinus}
          aria-label="Decrease"
          className="leading-none hover:text-text"
        >
          −
        </button>
        <button
          type="button"
          onClick={onPlus}
          aria-label="Increase"
          className="leading-none hover:text-text"
        >
          +
        </button>
      </div>
    </div>
  );
}

