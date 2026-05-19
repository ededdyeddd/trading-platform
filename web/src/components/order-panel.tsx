"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SENTIMENT, formatUsd, getInstrument } from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import { useAccountStats, usePositions } from "@/lib/positions-context";
import { useQuote } from "@/lib/quotes-context";
import { TickerIcon } from "@/components/ticker-icon";
import { SellBuyQuoteSplit, type Side } from "@/components/sell-buy-quote";
import { SentimentBar } from "@/components/sentiment-bar";
import { OrderTypeSelect, type OrderType } from "@/components/order-type-select";

export function OrderPanel() {
  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [volume, setVolume] = useState(1);
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [openPrice, setOpenPrice] = useState("");

  const { activeSymbol } = useActiveInstrument();
  const { openMarketPosition, openPendingOrder } = usePositions();
  const accountStats = useAccountStats();
  const instrument = getInstrument(activeSymbol);
  const live = useQuote(activeSymbol);
  if (!instrument) return null;

  const bid = live?.bid ?? instrument.bid;
  const ask = live?.ask ?? instrument.ask;
  const sentiment = SENTIMENT[activeSymbol] ?? { buy: 50, sell: 50 };
  const spread = +(ask - bid).toFixed(2);

  // Parse the form's optional TP/SL/openPrice. Empty string → null.
  const tpNum = tp.trim() ? Number(tp) : null;
  const slNum = sl.trim() ? Number(sl) : null;
  const openPriceNum = openPrice.trim() ? Number(openPrice) : null;

  const isMarketValid = volume > 0;
  const isPendingValid =
    volume > 0 && openPriceNum !== null && openPriceNum > 0;
  const canConfirm = orderType === "market" ? isMarketValid : isPendingValid;

  function resetForm() {
    setVolume(1);
    setTp("");
    setSl("");
    setOpenPrice("");
  }

  function handleConfirm() {
    if (!canConfirm) return;
    if (orderType === "market") {
      // Market fill = buy at ask, sell at bid.
      openMarketPosition({
        symbol: activeSymbol,
        side,
        volume,
        openPrice: side === "buy" ? ask : bid,
        takeProfit: tpNum,
        stopLoss: slNum,
      });
    } else {
      openPendingOrder({
        symbol: activeSymbol,
        side,
        type: orderType,
        volume,
        triggerPrice: openPriceNum!,
        takeProfit: tpNum,
        stopLoss: slNum,
      });
    }
    resetForm();
  }

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

        {/* Order type — replaces the old Market/Pending tabs. Same
            dropdown chrome as <OpenPositionDialog> so both surfaces
            stay in sync. */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] text-text-muted">Order type</div>
          <OrderTypeSelect value={orderType} onChange={setOrderType} />
        </div>

        {/* Open price — required when the order is Limit or Stop. */}
        {orderType !== "market" && (
          <FormField
            label={orderType === "limit" ? "Limit price" : "Stop price"}
            value={openPrice}
            onChange={setOpenPrice}
            placeholder={bid.toFixed(2)}
            mono
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
          orderType={orderType}
          volume={volume}
          disabled={!canConfirm}
          onClick={handleConfirm}
        />
        <button
          type="button"
          onClick={resetForm}
          className="flex h-9 items-center justify-center rounded-md border border-border text-xs text-text hover:bg-surface-2"
        >
          Cancel
        </button>
        <div className="flex flex-col gap-1.5 border-t border-border pt-2 text-xs">
          <FooterRow label="Fees" value="≈ $0.00" />
          <FooterRow label="Margin used" value="$0.00" />
          <FooterRow
            label="Buying power"
            value={formatUsd(accountStats.buyingPower)}
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
  orderType,
  volume,
  disabled,
  onClick,
}: {
  side: Side;
  orderType: OrderType;
  volume: number;
  disabled: boolean;
  onClick: () => void;
}) {
  const { activeSymbol } = useActiveInstrument();
  const verb = side === "buy" ? "Buy" : "Sell";
  const unit = volume === 1 ? "Share" : "Shares";
  const label =
    orderType === "market"
      ? `${verb} ${activeSymbol} · ${volume} ${unit}`
      : `Confirm ${verb} ${orderType === "limit" ? "Limit" : "Stop"} · ${volume} ${unit}`;

  const styles =
    side === "buy"
      ? "bg-accent text-accent-fg hover:bg-accent-hover"
      : "bg-sell text-text hover:opacity-90";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`flex h-10 items-center justify-center rounded-md text-sm font-medium transition-colors ${styles} ${
        disabled ? "cursor-not-allowed opacity-50 hover:opacity-50" : ""
      }`}
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
