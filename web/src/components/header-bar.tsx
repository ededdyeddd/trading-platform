import {
  Bell,
  ChevronDown,
  Clock,
  Grid3x3,
  Plus,
  TrendingUp,
  User,
} from "lucide-react";
import {
  ACCOUNT,
  ACTIVE_SYMBOL,
  formatUsd,
  hasOpenPosition,
  OPEN_TABS,
} from "@/lib/mock-data";
import { TickerIcon } from "@/components/ticker-icon";

export function HeaderBar() {
  return (
    <header className="flex h-[52px] items-center gap-3 bg-surface px-3">
      <Logo />

      {/* instrument tabs */}
      <div className="ml-2 flex h-full items-center">
        {OPEN_TABS.map((symbol) => (
          <InstrumentTab
            key={symbol}
            symbol={symbol}
            active={symbol === ACTIVE_SYMBOL}
            hasPosition={hasOpenPosition(symbol)}
          />
        ))}
        <button
          aria-label="Add instrument"
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1" />

      {/* account selector */}
      <button className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs hover:bg-surface-3">
        <span className="rounded-sm bg-buy-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-buy">
          Demo
        </span>
        <span className="font-mono font-medium text-text tabular-nums">
          {formatUsd(ACCOUNT.equity)}
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
        <IconButton aria-label="Apps">
          <Grid3x3 size={16} />
        </IconButton>
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
  hasPosition,
}: {
  symbol: string;
  active: boolean;
  hasPosition: boolean;
}) {
  return (
    <button
      className={`flex h-[52px] items-center gap-1.5 border-b-2 px-3 text-sm transition-colors ${
        active
          ? "border-accent font-semibold text-text"
          : "border-transparent text-text-muted hover:text-text"
      }`}
    >
      <TickerIcon symbol={symbol} size={14} />
      <span>{symbol}</span>
      {hasPosition && (
        <span
          aria-label="Has open position"
          className="font-mono text-[10px] leading-none tracking-tighter text-sell"
        >
          ‖‖‖
        </span>
      )}
    </button>
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
