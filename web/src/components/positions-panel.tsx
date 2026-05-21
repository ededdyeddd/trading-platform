"use client";

import { useState } from "react";
import {
  Edit3,
  Filter,
  GalleryVerticalEnd,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  computePnl,
  formatUsd,
  getInstrument,
  shortPositionId,
  type ClosedPosition,
  type PendingOrder,
  type Position,
} from "@/lib/mock-data";
import { usePositions } from "@/lib/positions-context";
import { useQuote } from "@/lib/quotes-context";
import { EditPositionDialog } from "@/components/edit-position-dialog";
import { TickerIcon } from "@/components/ticker-icon";

type Tab = "open" | "pending" | "closed";

const TAB_LABELS: Record<Tab, string> = {
  open: "Open",
  pending: "Pending",
  closed: "Closed",
};

export function PositionsPanel() {
  const [tab, setTab] = useState<Tab>("open");
  const [editing, setEditing] = useState<{
    positionId: string;
    anchor: { x: number; y: number };
  } | null>(null);
  const { positions, pendingOrders, closedPositions } = usePositions();

  // If the position being edited gets closed externally, the dialog
  // self-closes via its own effect — but clear our local state too so
  // we don't keep dangling references.
  const editingPositionExists =
    editing != null && positions.some((p) => p.id === editing.positionId);

  const counts: Record<Tab, number> = {
    open: positions.length,
    pending: pendingOrders.length,
    closed: closedPositions.length,
  };

  return (
    <section className="flex h-full flex-col bg-surface">
      {/* Tabs row */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border px-3 text-xs">
        {(["open", "pending", "closed"] as const).map((t) => (
          <TabButton
            key={t}
            label={TAB_LABELS[t]}
            count={counts[t]}
            active={tab === t}
            onClick={() => setTab(t)}
          />
        ))}
        <div className="flex-1" />
        <ToolIcon icon={<Filter size={14} />} label="Filter" />
        <ToolIcon icon={<GalleryVerticalEnd size={14} />} label="Group" />
        <ToolIcon icon={<MoreHorizontal size={14} />} label="More" />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {tab === "open" &&
          (positions.length === 0 ? (
            <EmptyState label="No open positions" />
          ) : (
            <OpenPositionsTable
              rows={positions}
              onEdit={(positionId, anchor) =>
                setEditing({ positionId, anchor })
              }
            />
          ))}
        {tab === "pending" &&
          (pendingOrders.length === 0 ? (
            <EmptyState label="No pending orders" />
          ) : (
            <PendingOrdersTable rows={pendingOrders} />
          ))}
        {tab === "closed" &&
          (closedPositions.length === 0 ? (
            <EmptyState label="No closed orders today" />
          ) : (
            <ClosedPositionsTable rows={closedPositions} />
          ))}
      </div>

      {editing && editingPositionExists && (
        <EditPositionDialog
          positionId={editing.positionId}
          anchor={editing.anchor}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Open positions table
 * ─────────────────────────────────────────────────────────────────────*/

const OPEN_COLS =
  "grid-cols-[100px_70px_70px_100px_100px_90px_90px_110px_90px_60px]";

function OpenPositionsTable({
  rows,
  onEdit,
}: {
  rows: Position[];
  onEdit: (positionId: string, anchor: { x: number; y: number }) => void;
}) {
  return (
    <div className="min-w-full">
      <div
        className={`grid ${OPEN_COLS} items-center gap-3 border-b border-border px-3 py-2 text-[10px] uppercase tracking-wider text-text-muted`}
      >
        <span>Symbol</span>
        <span>Type</span>
        <span className="text-right">Volume</span>
        <span className="text-right">Open price</span>
        <span className="text-right">Current</span>
        <span className="text-right">T/P</span>
        <span className="text-right">S/L</span>
        <span className="text-right">Position</span>
        <span className="text-right">P/L USD</span>
        <span></span>
      </div>
      {rows.map((p) => (
        <OpenPositionRow key={p.id} row={p} onEdit={onEdit} />
      ))}
    </div>
  );
}

function OpenPositionRow({
  row,
  onEdit,
}: {
  row: Position;
  onEdit: (positionId: string, anchor: { x: number; y: number }) => void;
}) {
  const { closePosition } = usePositions();
  const live = useQuote(row.symbol);
  const instrument = getInstrument(row.symbol);
  // Live mark price: closing a buy hits the bid, closing a sell hits the ask.
  const currentPrice =
    row.side === "buy"
      ? live?.bid ?? instrument?.bid ?? row.openPrice
      : live?.ask ?? instrument?.ask ?? row.openPrice;
  const precision = instrument?.precision ?? 2;
  const pnl = computePnl(row, currentPrice);
  const positive = pnl >= 0;

  return (
    <div
      className={`grid ${OPEN_COLS} items-center gap-3 border-b border-border/50 px-3 py-2.5 text-xs transition-colors hover:bg-surface-2`}
    >
      <div className="flex items-center gap-2">
        <TickerIcon symbol={row.symbol} size={14} />
        <span className="font-semibold text-text">{row.symbol}</span>
      </div>
      <span
        className={
          row.side === "buy"
            ? "font-medium text-buy"
            : "font-medium text-sell"
        }
      >
        {row.side === "buy" ? "Buy" : "Sell"}
      </span>
      <span className="text-right font-mono tabular-nums text-text">
        {row.volume}
      </span>
      <Editable value={row.openPrice.toFixed(precision)} />
      <span className="text-right font-mono tabular-nums text-text">
        {currentPrice.toFixed(precision)}
      </span>
      <Editable value={row.takeProfit?.toFixed(precision) ?? "—"} />
      <Editable value={row.stopLoss?.toFixed(precision) ?? "—"} />
      <span className="text-right font-mono tabular-nums text-text-muted">
        {shortPositionId(row.id)}
      </span>
      <span
        className={`text-right font-mono font-medium tabular-nums ${
          positive ? "text-buy" : "text-sell"
        }`}
      >
        {positive ? "+" : "−"}
        {formatUsd(Math.abs(pnl)).replace("$", "$")}
      </span>
      <div className="flex items-center justify-end gap-1.5 text-text-muted">
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            // Anchor the floating dialog just left of the pencil so it
            // doesn't cover the rest of the row.
            onEdit(row.id, { x: rect.left - 340, y: rect.top });
          }}
          aria-label="Edit position"
          className="rounded p-0.5 hover:bg-surface-3 hover:text-text"
        >
          <Edit3 size={12} />
        </button>
        <button
          onClick={() => closePosition(row.id, currentPrice)}
          aria-label="Close position"
          className="rounded p-0.5 hover:bg-surface-3 hover:text-sell"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Pending orders table
 * ─────────────────────────────────────────────────────────────────────*/

const PENDING_COLS =
  "grid-cols-[100px_70px_70px_100px_100px_90px_90px_110px_60px]";

function PendingOrdersTable({ rows }: { rows: PendingOrder[] }) {
  return (
    <div className="min-w-full">
      <div
        className={`grid ${PENDING_COLS} items-center gap-3 border-b border-border px-3 py-2 text-[10px] uppercase tracking-wider text-text-muted`}
      >
        <span>Symbol</span>
        <span>Side</span>
        <span className="text-right">Volume</span>
        <span className="text-right">Type</span>
        <span className="text-right">Trigger</span>
        <span className="text-right">T/P</span>
        <span className="text-right">S/L</span>
        <span className="text-right">Order</span>
        <span></span>
      </div>
      {rows.map((o) => (
        <PendingOrderRow key={o.id} row={o} />
      ))}
    </div>
  );
}

function PendingOrderRow({ row }: { row: PendingOrder }) {
  const { cancelPendingOrder } = usePositions();
  const precision = getInstrument(row.symbol)?.precision ?? 2;
  return (
    <div
      className={`grid ${PENDING_COLS} items-center gap-3 border-b border-border/50 px-3 py-2.5 text-xs transition-colors hover:bg-surface-2`}
    >
      <div className="flex items-center gap-2">
        <TickerIcon symbol={row.symbol} size={14} />
        <span className="font-semibold text-text">{row.symbol}</span>
      </div>
      <span
        className={
          row.side === "buy"
            ? "font-medium text-buy"
            : "font-medium text-sell"
        }
      >
        {row.side === "buy" ? "Buy" : "Sell"}
      </span>
      <span className="text-right font-mono tabular-nums text-text">
        {row.volume}
      </span>
      <span className="text-right text-text-muted">
        {row.type === "limit" ? "Limit" : "Stop"}
      </span>
      <span className="text-right font-mono tabular-nums text-text">
        {row.triggerPrice.toFixed(precision)}
      </span>
      <Editable value={row.takeProfit?.toFixed(precision) ?? "—"} />
      <Editable value={row.stopLoss?.toFixed(precision) ?? "—"} />
      <span className="text-right font-mono tabular-nums text-text-muted">
        {shortPositionId(row.id)}
      </span>
      <div className="flex items-center justify-end gap-1.5 text-text-muted">
        <button
          onClick={() => cancelPendingOrder(row.id)}
          aria-label="Cancel order"
          className="rounded p-0.5 hover:bg-surface-3 hover:text-sell"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Closed positions table
 * ─────────────────────────────────────────────────────────────────────*/

const CLOSED_COLS =
  "grid-cols-[100px_70px_70px_100px_100px_110px_110px_90px]";

function ClosedPositionsTable({ rows }: { rows: ClosedPosition[] }) {
  // Newest first.
  const ordered = [...rows].sort((a, b) => b.closedAt - a.closedAt);
  return (
    <div className="min-w-full">
      <div
        className={`grid ${CLOSED_COLS} items-center gap-3 border-b border-border px-3 py-2 text-[10px] uppercase tracking-wider text-text-muted`}
      >
        <span>Symbol</span>
        <span>Side</span>
        <span className="text-right">Volume</span>
        <span className="text-right">Open</span>
        <span className="text-right">Close</span>
        <span className="text-right">Position</span>
        <span className="text-right">Closed at</span>
        <span className="text-right">P/L USD</span>
      </div>
      {ordered.map((p) => (
        <ClosedPositionRow key={p.id} row={p} />
      ))}
    </div>
  );
}

function ClosedPositionRow({ row }: { row: ClosedPosition }) {
  const precision = getInstrument(row.symbol)?.precision ?? 2;
  const positive = row.realizedPnl >= 0;
  const closedAt = new Date(row.closedAt).toISOString().slice(11, 19);
  return (
    <div
      className={`grid ${CLOSED_COLS} items-center gap-3 border-b border-border/50 px-3 py-2.5 text-xs transition-colors hover:bg-surface-2`}
    >
      <div className="flex items-center gap-2">
        <TickerIcon symbol={row.symbol} size={14} />
        <span className="font-semibold text-text">{row.symbol}</span>
      </div>
      <span
        className={
          row.side === "buy"
            ? "font-medium text-buy"
            : "font-medium text-sell"
        }
      >
        {row.side === "buy" ? "Buy" : "Sell"}
      </span>
      <span className="text-right font-mono tabular-nums text-text">
        {row.volume}
      </span>
      <span className="text-right font-mono tabular-nums text-text">
        {row.openPrice.toFixed(precision)}
      </span>
      <span className="text-right font-mono tabular-nums text-text">
        {row.closePrice.toFixed(precision)}
      </span>
      <span className="text-right font-mono tabular-nums text-text-muted">
        {shortPositionId(row.id)}
      </span>
      <span className="text-right font-mono tabular-nums text-text-muted">
        {closedAt}
      </span>
      <span
        className={`text-right font-mono font-medium tabular-nums ${
          positive ? "text-buy" : "text-sell"
        }`}
      >
        {positive ? "+" : "−"}
        {formatUsd(Math.abs(row.realizedPnl)).replace("$", "$")}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers
 * ─────────────────────────────────────────────────────────────────────*/

function Editable({ value }: { value: string }) {
  return (
    <span className="text-right font-mono tabular-nums text-text">
      {value}
    </span>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 py-2 transition-colors ${
        active
          ? "border-accent font-medium text-text"
          : "border-transparent text-text-muted hover:text-text"
      }`}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium tabular-nums ${
            active
              ? "bg-accent text-accent-fg"
              : "bg-surface-2 text-text-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ToolIcon({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-2 hover:text-text"
    >
      {icon}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center px-4 text-xs text-text-subtle">
      {label}
    </div>
  );
}
