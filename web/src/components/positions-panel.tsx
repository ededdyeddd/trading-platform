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
  PENDING_ORDERS,
  POSITIONS,
  type Position,
  formatUsd,
} from "@/lib/mock-data";
import { TickerIcon } from "@/components/ticker-icon";

type Tab = "open" | "pending" | "closed";

const TAB_LABELS: Record<Tab, string> = {
  open: "Open",
  pending: "Pending",
  closed: "Closed",
};

export function PositionsPanel() {
  const [tab, setTab] = useState<Tab>("open");

  const counts: Record<Tab, number> = {
    open: POSITIONS.length,
    pending: PENDING_ORDERS.length,
    closed: 0,
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
        {tab === "open" && <OpenPositionsTable rows={POSITIONS} />}
        {tab === "pending" && <EmptyState label="No pending orders" />}
        {tab === "closed" && <EmptyState label="No closed orders today" />}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Open positions table
 * ─────────────────────────────────────────────────────────────────────*/

const COLS =
  "grid-cols-[100px_70px_70px_100px_100px_90px_90px_110px_90px_60px]";

function OpenPositionsTable({ rows }: { rows: Position[] }) {
  if (rows.length === 0) {
    return <EmptyState label="No open positions" />;
  }

  return (
    <div className="min-w-full">
      <div
        className={`grid ${COLS} items-center gap-3 border-b border-border px-3 py-2 text-[10px] uppercase tracking-wider text-text-muted`}
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
        <PositionRow key={p.id} row={p} />
      ))}
    </div>
  );
}

function PositionRow({ row }: { row: Position }) {
  const positive = row.pnl >= 0;
  return (
    <div
      className={`grid ${COLS} items-center gap-3 border-b border-border/50 px-3 py-2.5 text-xs transition-colors hover:bg-surface-2`}
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
      <Editable value={row.openPrice.toFixed(2)} />
      <span className="text-right font-mono tabular-nums text-text">
        {row.currentPrice.toFixed(2)}
      </span>
      <Editable value={row.takeProfit?.toFixed(2) ?? "—"} />
      <Editable value={row.stopLoss?.toFixed(2) ?? "—"} />
      <span className="text-right font-mono tabular-nums text-text-muted">
        {row.positionId}
      </span>
      <span
        className={`text-right font-mono font-medium tabular-nums ${
          positive ? "text-buy" : "text-sell"
        }`}
      >
        {positive ? "+" : "−"}
        {formatUsd(Math.abs(row.pnl)).replace("$", "$")}
      </span>
      <div className="flex items-center justify-end gap-1.5 text-text-muted">
        <button
          aria-label="Edit position"
          className="rounded p-0.5 hover:bg-surface-3 hover:text-text"
        >
          <Edit3 size={12} />
        </button>
        <button
          aria-label="Close position"
          className="rounded p-0.5 hover:bg-surface-3 hover:text-sell"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function Editable({ value }: { value: string }) {
  return (
    <span className="cursor-pointer text-right font-mono tabular-nums text-text underline decoration-text-subtle/40 decoration-dashed underline-offset-2 hover:decoration-text-muted">
      {value}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers
 * ─────────────────────────────────────────────────────────────────────*/

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
