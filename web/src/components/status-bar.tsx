"use client";

import { ChevronDown } from "lucide-react";
import { formatUsd } from "@/lib/mock-data";
import { useAccountStats } from "@/lib/positions-context";

export function StatusBar() {
  const stats = useAccountStats();
  const dayPnlPositive = stats.dayPnL >= 0;
  const totalPnlPositive = stats.totalPnL >= 0;

  return (
    <footer className="flex h-9 w-full items-center gap-6 bg-surface px-4 text-[11px]">
      <Stat label="Balance" value={formatUsd(stats.balance)} />
      <Stat label="Buying power" value={formatUsd(stats.buyingPower)} />
      <Stat label="Cash" value={formatUsd(stats.cash)} />
      <Stat
        label="Day P/L"
        value={`${dayPnlPositive ? "+" : "−"}${formatUsd(Math.abs(stats.dayPnL))}`}
        tone={dayPnlPositive ? "buy" : "sell"}
      />
      <Stat
        label="Total P/L"
        value={`${totalPnlPositive ? "+" : "−"}${formatUsd(Math.abs(stats.totalPnL))}`}
        tone={totalPnlPositive ? "buy" : "sell"}
      />
      <Stat label="Margin used" value={formatUsd(stats.marginUsed)} />

      <div className="flex-1" />

      <button className="flex h-6 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 text-text hover:bg-surface-3">
        <span>Close all</span>
        <ChevronDown size={11} className="text-text-muted" />
      </button>
      <SignalIndicator strength={3} />
    </footer>
  );
}

function Stat({
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
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted">{label}:</span>
      <span className={`font-mono font-medium tabular-nums ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/** 4-bar wifi-style indicator. `strength` = 0..4 */
function SignalIndicator({ strength }: { strength: number }) {
  const heights = [4, 7, 10, 13];
  return (
    <div className="flex items-end gap-0.5" aria-label={`Signal ${strength}/4`}>
      {heights.map((h, i) => (
        <span
          key={i}
          className={i < strength ? "bg-text-muted" : "bg-text-subtle/40"}
          style={{ height: h, width: 2 }}
        />
      ))}
    </div>
  );
}
