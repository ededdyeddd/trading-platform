"use client";

export type Side = "buy" | "sell";

export function SellBuyQuoteSplit({
  bid,
  ask,
  spread,
  selectedSide,
  onSelect,
}: {
  bid: number;
  ask: number;
  spread: number;
  selectedSide: Side | null;
  onSelect: (side: Side) => void;
}) {
  return (
    <div className="relative flex gap-1">
      <QuoteCard
        side="sell"
        price={bid}
        active={selectedSide === "sell"}
        onClick={() => onSelect("sell")}
      />
      <QuoteCard
        side="buy"
        price={ask}
        active={selectedSide === "buy"}
        onClick={() => onSelect("buy")}
      />
      <SpreadChip value={spread} />
    </div>
  );
}

function QuoteCard({
  side,
  price,
  active,
  onClick,
}: {
  side: Side;
  price: number;
  active: boolean;
  onClick: () => void;
}) {
  // Split price for the "last 2 digits enlarged" pattern: "121." regular, "90" bigger
  const intPart = Math.floor(price);
  const decimalPart = Math.round((price - intPart) * 100)
    .toString()
    .padStart(2, "0");

  const variant = side === "sell" ? sellVariant : buyVariant;
  const cls = active ? variant.active : variant.idle;
  const labelCls = active ? variant.activeLabel : variant.idleLabel;
  const priceCls = active ? variant.activePrice : variant.idlePrice;

  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col gap-1 rounded-md px-3 py-2 text-left transition-colors ${cls}`}
    >
      <span
        className={`text-[10px] font-medium uppercase tracking-wider ${labelCls}`}
      >
        {side === "sell" ? "Sell" : "Buy"}
      </span>
      <div className={`flex items-baseline font-mono ${priceCls}`}>
        <span className="text-sm font-semibold tabular-nums">{intPart}.</span>
        <span className="text-2xl font-semibold leading-none tabular-nums">
          {decimalPart}
        </span>
      </div>
    </button>
  );
}

function SpreadChip({ value }: { value: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-3 px-2 font-mono text-[10px] font-medium text-text-muted"
    >
      {value < 0.01 ? value.toFixed(3) : value.toFixed(2)}
    </div>
  );
}

const sellVariant = {
  idle: "bg-sell-soft hover:opacity-80",
  active: "bg-sell hover:opacity-95",
  idleLabel: "text-sell",
  activeLabel: "text-text",
  idlePrice: "text-text",
  activePrice: "text-text",
};

const buyVariant = {
  idle: "bg-buy-soft hover:opacity-80",
  active: "bg-accent hover:bg-accent-hover",
  idleLabel: "text-buy",
  activeLabel: "text-accent-fg",
  idlePrice: "text-text",
  activePrice: "text-accent-fg",
};
