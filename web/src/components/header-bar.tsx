"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Clock,
  Plus,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { formatUsd } from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import {
  useAccountStats,
  useHasOpenPosition,
} from "@/lib/positions-context";
import { AddInstrumentDialog } from "@/components/add-instrument-dialog";
import { TickerIcon } from "@/components/ticker-icon";
import { WidgetsMenu } from "@/components/widgets-menu";
import { useSettings } from "@/lib/settings-context";

export function HeaderBar() {
  const { activeSymbol, openTabs, setActiveSymbol, closeTab } =
    useActiveInstrument();
  const stats = useAccountStats();
  const { settings } = useSettings();
  const showTabs = settings.widgets.chart;
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const canCloseTabs = openTabs.length > 1;

  return (
    <header className="flex h-[52px] items-center gap-3 bg-surface px-3">
      <Logo />

      {/* instrument tabs — overflow scrolls horizontally with a soft
          fade on the trailing edge so the account selector keeps its
          space when many tabs are open. */}
      {showTabs ? (
        <div className="ml-2 flex h-full min-w-0 flex-1 items-center">
          <div
            className="flex h-full min-w-0 flex-1 items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent_100%)]"
          >
            {openTabs.map((symbol) => (
              <InstrumentTab
                key={symbol}
                symbol={symbol}
                active={symbol === activeSymbol}
                canClose={canCloseTabs}
                onClick={() => setActiveSymbol(symbol)}
                onClose={() => closeTab(symbol)}
              />
            ))}
          </div>
          <button
            aria-label="Add instrument"
            onClick={() => setAddDialogOpen(true)}
            className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <Plus size={14} />
          </button>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {addDialogOpen && (
        <AddInstrumentDialog onClose={() => setAddDialogOpen(false)} />
      )}

      {/* account selector */}
      <button className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs hover:bg-surface-3">
        <span className="rounded-sm bg-buy-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-buy">
          Demo
        </span>
        <span className="font-mono font-medium text-text tabular-nums">
          {formatUsd(stats.equity)}
        </span>
        <span className="text-[11px] text-text-muted">USD</span>
        <ChevronDown size={12} className="text-text-muted" />
      </button>

      {/* icon group */}
      <div className="flex items-center gap-2 text-text-muted">
        <IconButton aria-label="Notifications">
          <Bell size={16} />
        </IconButton>
        <IconButton aria-label="Alerts">
          <Clock size={16} />
        </IconButton>
        <WidgetsMenu />
        <button
          aria-label="Account"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text"
        >
          <User size={14} />
        </button>
      </div>

      {/* deposit CTA */}
      <button className="flex h-9 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover">
        Deposit
      </button>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-1.5 px-1 text-[15px] font-semibold tracking-tight text-text">
      <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-fg">
        <TrendingUp size={14} strokeWidth={2.5} />
      </div>
      <span>TermX</span>
    </div>
  );
}

function InstrumentTab({
  symbol,
  active,
  canClose,
  onClick,
  onClose,
}: {
  symbol: string;
  active: boolean;
  canClose: boolean;
  onClick: () => void;
  onClose: () => void;
}) {
  const hasPosition = useHasOpenPosition(symbol);
  return (
    <div
      className={`group relative flex h-[52px] shrink-0 items-center border-b-2 transition-colors ${
        active
          ? "border-accent"
          : "border-transparent hover:border-border"
      }`}
    >
      <button
        onClick={onClick}
        aria-current={active ? "true" : undefined}
        className={`flex h-full items-center gap-1.5 pl-3 pr-1 text-sm transition-colors ${
          active
            ? "font-semibold text-text"
            : "text-text-muted hover:text-text"
        }`}
      >
        <TickerIcon symbol={symbol} size={14} />
        <span>{symbol}</span>
        {hasPosition && (
          <span
            aria-label="Has open position"
            title="Has open position"
            className="h-2 w-2 shrink-0 rounded-[1px] bg-accent"
          />
        )}
      </button>
      {canClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${symbol} tab`}
          // Always visible on the active tab; appear on hover for inactive
          // ones so the chrome stays quiet.
          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm text-text-subtle transition-opacity hover:bg-surface-2 hover:text-text ${
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}

function IconButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
      {...props}
    >
      {children}
    </button>
  );
}
