"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GripHorizontal, X } from "lucide-react";
import { computePnl, formatUsd, getInstrument } from "@/lib/mock-data";
import { usePositions } from "@/lib/positions-context";
import { useQuote } from "@/lib/quotes-context";
import { TickerIcon } from "@/components/ticker-icon";

/**
 * Edit-position dialog — opens from the pencil icon on a row in the
 * Open positions table. Mirrors `<OpenPositionDialog>` visually
 * (compact floating panel, draggable header) but only exposes the
 * fields that make sense to mutate while a position is live: take
 * profit and stop loss. Volume / side / open price are read-only —
 * changing those would require a partial close, which is out of
 * scope for the prototype.
 *
 * Saving calls `updatePosition(id, { takeProfit, stopLoss })` on the
 * provider; an empty input clears the value (sets to null). The
 * dialog reads the live position by id, so external updates (live
 * PnL ticks, mark price changes) keep the summary fresh and the
 * dialog auto-closes if the position is closed elsewhere.
 */

const DIALOG_WIDTH = 320;
const DIALOG_EST_HEIGHT = 380;

export function EditPositionDialog({
  positionId,
  anchor,
  onClose,
}: {
  positionId: string;
  /** Optional initial viewport position; clamped inside the viewport. */
  anchor?: { x: number; y: number };
  onClose: () => void;
}) {
  const { positions, updatePosition } = usePositions();
  const position = positions.find((p) => p.id === positionId);
  const live = useQuote(position?.symbol ?? "");
  const instrument = getInstrument(position?.symbol ?? "");
  const precision = instrument?.precision ?? 2;

  // Initial TP/SL strings come from the position at mount; subsequent
  // re-renders (live ticks) don't reset what the user has typed.
  const [tp, setTp] = useState<string>(() =>
    position?.takeProfit != null ? position.takeProfit.toFixed(precision) : ""
  );
  const [sl, setSl] = useState<string>(() =>
    position?.stopLoss != null ? position.stopLoss.toFixed(precision) : ""
  );

  // Auto-close if the position disappears (e.g., closed elsewhere).
  const positionMissing = !position;
  useEffect(() => {
    if (positionMissing) onClose();
  }, [positionMissing, onClose]);

  // Position state for the floating panel — initialised once.
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") {
      return anchor ?? { x: 200, y: 80 };
    }
    const fallback = {
      x: Math.max(16, (window.innerWidth - DIALOG_WIDTH) / 2),
      y: Math.max(16, (window.innerHeight - DIALOG_EST_HEIGHT) / 3),
    };
    const target = anchor ?? fallback;
    // Clamp so the FULL dialog (including footer) fits within the
    // viewport — anchors near the bottom would otherwise leave the
    // Save/Cancel buttons clipped off-screen.
    return {
      x: Math.max(8, Math.min(target.x, window.innerWidth - DIALOG_WIDTH - 8)),
      y: Math.max(
        8,
        Math.min(target.y, window.innerHeight - DIALOG_EST_HEIGHT - 8)
      ),
    };
  });
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

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

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      if (!dragOffsetRef.current) return;
      const next = {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      };
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
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    dragOffsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setDragging(true);
    e.preventDefault();
  }

  if (!position) return null;
  if (typeof document === "undefined") return null;

  const { symbol, side, volume, openPrice } = position;
  const tpNum = tp.trim() ? Number(tp) : null;
  const slNum = sl.trim() ? Number(sl) : null;
  const tpValid = tp.trim() === "" || (Number.isFinite(tpNum) && tpNum! > 0);
  const slValid = sl.trim() === "" || (Number.isFinite(slNum) && slNum! > 0);
  const dirty =
    (tpNum ?? null) !== (position.takeProfit ?? null) ||
    (slNum ?? null) !== (position.stopLoss ?? null);
  const canSave = tpValid && slValid && dirty;

  const currentPrice =
    side === "buy"
      ? live?.bid ?? instrument?.bid ?? openPrice
      : live?.ask ?? instrument?.ask ?? openPrice;
  const pnl = computePnl(position, currentPrice);
  const pnlPositive = pnl >= 0;

  function handleSave() {
    if (!canSave) return;
    updatePosition(positionId, { takeProfit: tpNum, stopLoss: slNum });
    onClose();
  }

  return createPortal(
    <div
      role="dialog"
      aria-label={`Edit position on ${symbol}`}
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
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${
            side === "buy" ? "text-buy" : "text-sell"
          }`}
        >
          {side === "buy" ? "Buy" : "Sell"}
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

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        <ReadOnlyRow label="Volume" value={String(volume)} />
        <ReadOnlyRow
          label="Open price"
          value={openPrice.toFixed(precision)}
        />
        <ReadOnlyRow
          label="Current"
          value={currentPrice.toFixed(precision)}
          tone={pnlPositive ? "buy" : "sell"}
        />

        <div className="my-1 border-t border-border" />

        <EditableRow
          label="Take profit"
          value={tp}
          onChange={setTp}
          placeholder="Not set"
          precision={precision}
          fallback={side === "buy" ? currentPrice + 1 : currentPrice - 1}
        />
        <EditableRow
          label="Stop loss"
          value={sl}
          onChange={setSl}
          placeholder="Not set"
          precision={precision}
          fallback={side === "buy" ? currentPrice - 1 : currentPrice + 1}
        />

        {/* Live PnL summary */}
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-[11px]">
          <span className="text-text-muted">Live P/L</span>
          <span
            className={`font-mono font-semibold tabular-nums ${
              pnlPositive ? "text-buy" : "text-sell"
            }`}
          >
            {pnlPositive ? "+" : "−"}
            {formatUsd(Math.abs(pnl))}
          </span>
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
          onClick={handleSave}
          disabled={!canSave}
          aria-disabled={!canSave}
          className={`flex h-8 items-center justify-center rounded-md bg-accent px-3 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover ${
            !canSave ? "cursor-not-allowed opacity-50 hover:opacity-50" : ""
          }`}
        >
          Save changes
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Row helpers
 * ─────────────────────────────────────────────────────────────────────*/

function ReadOnlyRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "buy" | "sell";
}) {
  const valueClass =
    tone === "buy"
      ? "text-buy"
      : tone === "sell"
        ? "text-sell"
        : "text-text";
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-text-muted">{label}</span>
      <span className={`font-mono tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

function EditableRow({
  label,
  value,
  onChange,
  placeholder,
  precision,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  precision: number;
  fallback: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-[11px] text-text-muted">{label}</span>
      <div className="flex h-8 flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs focus-within:border-accent">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent font-mono tabular-nums text-text placeholder:text-text-muted focus:outline-none"
        />
        <div className="flex items-center gap-2 border-l border-border pl-2 text-text-muted">
          <button
            type="button"
            onClick={() =>
              onChange(
                (value ? Number(value) - 1 : fallback - 1).toFixed(precision)
              )
            }
            aria-label="Decrease"
            className="leading-none hover:text-text"
          >
            −
          </button>
          <button
            type="button"
            onClick={() =>
              onChange(
                (value ? Number(value) + 1 : fallback + 1).toFixed(precision)
              )
            }
            aria-label="Increase"
            className="leading-none hover:text-text"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
