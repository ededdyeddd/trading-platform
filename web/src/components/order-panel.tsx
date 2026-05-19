"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, X } from "lucide-react";
import {
  ACCOUNT,
  SENTIMENT,
  formatUsd,
  getInstrument,
} from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import { useQuote } from "@/lib/quotes-context";
import { TickerIcon } from "@/components/ticker-icon";
import { SellBuyQuoteSplit, type Side } from "@/components/sell-buy-quote";
import { SentimentBar } from "@/components/sentiment-bar";

type OrderTab = "market" | "pending";
type PendingType = "limit" | "stop";

export function OrderPanel() {
  const [side, setSide] = useState<Side>("buy");
  const [tab, setTab] = useState<OrderTab>("market");
  const [volume, setVolume] = useState(1);
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [pendingType] = useState<PendingType>("limit");
  const [openPrice, setOpenPrice] = useState("");

  const { activeSymbol, openTabs, closeTab } = useActiveInstrument();
  const instrument = getInstrument(activeSymbol);
  const live = useQuote(activeSymbol);
  if (!instrument) return null;

  const canCloseTab = openTabs.length > 1;

  const bid = live?.bid ?? instrument.bid;
  const ask = live?.ask ?? instrument.ask;
  const sentiment = SENTIMENT[activeSymbol] ?? { buy: 50, sell: 50 };
  const spread = +(ask - bid).toFixed(2);

  return (
    <aside className="flex h-full flex-col bg-surface">
      {/* Scrollable form area */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <TickerIcon symbol={activeSymbol} size={16} />
          <span className="text-sm font-semibold text-text">
            {activeSymbol}
          </span>
          <span className="truncate text-xs text-text-muted">
            {instrument.name}
          </span>
          <div className="flex-1" />
          {canCloseTab && (
            <button
              onClick={() => closeTab(activeSymbol)}
              aria-label={`Close ${activeSymbol} tab`}
              className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-2 hover:text-text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Order mode dropdown */}
        <button className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs hover:bg-surface-3">
          <span className="text-text-muted">Order mode</span>
          <span className="font-medium text-text">Regular form</span>
          <div className="flex-1" />
          <ChevronDown size={12} className="text-text-muted" />
        </button>

        {/* Sell/Buy quote split */}
        <SellBuyQuoteSplit
          bid={bid}
          ask={ask}
          spread={spread}
          selectedSide={side}
          onSelect={setSide}
        />

        {/* Sentiment */}
        <SentimentBar buy={sentiment.buy} sell={sentiment.sell} />

        {/* Tabs */}
        <div className="flex border-b border-border text-xs">
          {(["market", "pending"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 border-b-2 py-2 transition-colors ${
                tab === t
                  ? "border-accent font-medium text-text"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {t === "market" ? "Market" : "Pending"}
            </button>
          ))}
        </div>

        {/* Form fields */}
        {tab === "pending" && (
          <FormField
            label="Open price"
            value={openPrice}
            onChange={setOpenPrice}
            placeholder={bid.toFixed(2)}
            mono
            suffix={
              <button className="flex items-center gap-1 rounded bg-surface-3 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted hover:text-text">
                {pendingType === "limit" ? "Limit" : "Stop"}
                <ChevronDown size={9} />
              </button>
            }
          />
        )}
        <FormField
          label="Volume"
          value={String(volume)}
          onChange={(v) => setVolume(Number(v) || 0)}
          mono
          suffix={<span className="text-xs text-text-muted">Shares</span>}
          steppers={{
            onMinus: () => setVolume(Math.max(0, volume - 1)),
            onPlus: () => setVolume(volume + 1),
          }}
        />
        <FormField
          label="Take Profit"
          value={tp}
          onChange={setTp}
          placeholder="Not set"
          mono
          help
          suffix={
            <button className="flex items-center gap-1 text-xs text-text-muted hover:text-text">
              Price <ChevronDown size={10} />
            </button>
          }
          steppers={{
            onMinus: () =>
              setTp(tp ? (Number(tp) - 0.5).toFixed(2) : ask.toFixed(2)),
            onPlus: () =>
              setTp(tp ? (Number(tp) + 0.5).toFixed(2) : ask.toFixed(2)),
          }}
        />
        <FormField
          label="Stop Loss"
          value={sl}
          onChange={setSl}
          placeholder="Not set"
          mono
          help
          suffix={
            <button className="flex items-center gap-1 text-xs text-text-muted hover:text-text">
              Price <ChevronDown size={10} />
            </button>
          }
          steppers={{
            onMinus: () =>
              setSl(sl ? (Number(sl) - 0.5).toFixed(2) : bid.toFixed(2)),
            onPlus: () =>
              setSl(sl ? (Number(sl) + 0.5).toFixed(2) : bid.toFixed(2)),
          }}
        />
      </div>

      {/* Sticky footer */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3">
        <ConfirmButton
          side={side}
          tab={tab}
          pendingType={pendingType}
          volume={volume}
        />
        <button className="flex h-9 items-center justify-center rounded-md border border-border text-xs text-text hover:bg-surface-2">
          Cancel
        </button>
        <div className="flex flex-col gap-1.5 border-t border-border pt-2 text-xs">
          <FooterRow label="Fees" value="≈ $0.00" />
          <FooterRow label="Margin used" value="$0.00" />
          <FooterRow
            label="Buying power"
            value={formatUsd(ACCOUNT.buyingPower)}
          />
          <button className="flex items-center gap-1 self-start text-[11px] text-text-muted hover:text-text">
            More <ChevronDown size={10} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Confirm CTA — color follows selected side
 * ─────────────────────────────────────────────────────────────────────*/

function ConfirmButton({
  side,
  tab,
  pendingType,
  volume,
}: {
  side: Side;
  tab: OrderTab;
  pendingType: PendingType;
  volume: number;
}) {
  const { activeSymbol } = useActiveInstrument();
  const verb = side === "buy" ? "Buy" : "Sell";
  const unit = volume === 1 ? "Share" : "Shares";
  const label =
    tab === "market"
      ? `${verb} ${activeSymbol} · ${volume} ${unit}`
      : `Confirm ${verb} ${pendingType === "limit" ? "Limit" : "Stop"} · ${volume} ${unit}`;

  const styles =
    side === "buy"
      ? "bg-accent text-accent-fg hover:bg-accent-hover"
      : "bg-sell text-text hover:opacity-90";

  return (
    <button
      className={`flex h-10 items-center justify-center rounded-md text-sm font-medium transition-colors ${styles}`}
    >
      {label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Form field with optional ± steppers, suffix, and help icon
 * ─────────────────────────────────────────────────────────────────────*/

function FormField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  steppers,
  mono,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
  steppers?: { onMinus: () => void; onPlus: () => void };
  mono?: boolean;
  help?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1 text-[11px] text-text-muted">
        <span>{label}</span>
        {help && <HelpCircle size={10} className="text-text-subtle" />}
      </div>
      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-xs focus-within:border-accent">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 bg-transparent text-text placeholder:text-text-muted focus:outline-none ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        />
        {suffix}
        {steppers && (
          <div className="flex items-center gap-2 border-l border-border pl-2 text-text-muted">
            <button
              type="button"
              onClick={steppers.onMinus}
              aria-label="Decrease"
              className="leading-none hover:text-text"
            >
              −
            </button>
            <button
              type="button"
              onClick={steppers.onPlus}
              aria-label="Increase"
              className="leading-none hover:text-text"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FooterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono text-text tabular-nums">{value}</span>
    </div>
  );
}
