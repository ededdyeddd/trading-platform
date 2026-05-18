"use client";

import {
  SiAmd,
  SiApple,
  SiBitcoin,
  SiCardano,
  SiCocacola,
  SiDogecoin,
  SiEthereum,
  SiFord,
  SiGoogle,
  SiMeta,
  SiNetflix,
  SiNvidia,
  SiRipple,
  SiSolana,
  SiTesla,
} from "react-icons/si";
import type { IconType } from "react-icons";

type IconConfig = { Icon: IconType; color: string };

/**
 * Brand icons available in react-icons (simple-icons subset). Crypto
 * tickers are matched on the base asset ("BTC" from "BTC/USD"), stocks
 * on the full symbol. AMZN, MSFT, DIS, AMC were removed from
 * simple-icons after legal requests — those fall back to letter chips.
 */
const TICKER_ICONS: Record<string, IconConfig> = {
  AAPL: { Icon: SiApple, color: "#FFFFFF" },
  AMD: { Icon: SiAmd, color: "#ED1C24" },
  F: { Icon: SiFord, color: "#4A8FE6" },
  GOOGL: { Icon: SiGoogle, color: "#4285F4" },
  KO: { Icon: SiCocacola, color: "#F40009" },
  META: { Icon: SiMeta, color: "#4083F1" },
  NFLX: { Icon: SiNetflix, color: "#E50914" },
  NVDA: { Icon: SiNvidia, color: "#76B900" },
  TSLA: { Icon: SiTesla, color: "#E31937" },
  BTC: { Icon: SiBitcoin, color: "#F7931A" },
  ETH: { Icon: SiEthereum, color: "#627EEA" },
  SOL: { Icon: SiSolana, color: "#9945FF" },
  XRP: { Icon: SiRipple, color: "#23292F" },
  DOGE: { Icon: SiDogecoin, color: "#C2A633" },
  ADA: { Icon: SiCardano, color: "#0033AD" },
};

/** Currency / commodity colors for paired forex+metals icons. */
const CURRENCY_COLORS: Record<string, string> = {
  USD: "#34A853",
  EUR: "#1E5DD3",
  GBP: "#A1356A",
  JPY: "#E84A4A",
  CHF: "#D62E2E",
  AUD: "#0073B7",
  NZD: "#222F3D",
  CAD: "#E5483B",
  TRY: "#E30A17",
  ZAR: "#F2B41A",
  MXN: "#0C7B3E",
  SGD: "#D62E2E",
  PLN: "#D62E2E",
  SEK: "#005B9F",
  NOK: "#BA0C2F",
  HKD: "#D62E2E",
  XAU: "#D4AF37",
  XAG: "#C0C0C0",
  XPT: "#A8B0B5",
  XPD: "#86919A",
};

/** Muted palette for fallback letter chips (indices, energy, etc.). */
const FALLBACK_PALETTE = [
  "#5BC0EB",
  "#FFB347",
  "#9B7EDE",
  "#E07A5F",
  "#7C8B95",
];

function hashSymbol(symbol: string): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function TickerIcon({
  symbol,
  size = 16,
}: {
  symbol: string;
  size?: number;
}) {
  // Currency pair / commodity pair — render two overlapping colored chips.
  if (symbol.includes("/")) {
    const [base, quote] = symbol.split("/");
    return <PairIcon base={base} quote={quote} size={size} />;
  }

  const config = TICKER_ICONS[symbol];
  if (config) {
    const { Icon, color } = config;
    return <Icon size={size} color={color} className="shrink-0" />;
  }

  const color = FALLBACK_PALETTE[hashSymbol(symbol) % FALLBACK_PALETTE.length];
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-bg"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        backgroundColor: color,
      }}
    >
      {symbol.slice(0, 1)}
    </div>
  );
}

function PairIcon({
  base,
  quote,
  size,
}: {
  base: string;
  quote: string;
  size: number;
}) {
  const baseColor =
    CURRENCY_COLORS[base] ??
    FALLBACK_PALETTE[hashSymbol(base) % FALLBACK_PALETTE.length];
  const quoteColor =
    CURRENCY_COLORS[quote] ??
    FALLBACK_PALETTE[hashSymbol(quote) % FALLBACK_PALETTE.length];

  const chipSize = Math.round(size * 0.78);
  const overlap = Math.round(size * 0.32);
  const totalWidth = chipSize * 2 - overlap;

  return (
    <div
      aria-hidden
      className="relative shrink-0"
      style={{ width: totalWidth, height: size }}
    >
      <CurrencyChip
        code={base}
        color={baseColor}
        size={chipSize}
        style={{ left: 0, top: (size - chipSize) / 2 }}
      />
      <CurrencyChip
        code={quote}
        color={quoteColor}
        size={chipSize}
        style={{ left: chipSize - overlap, top: (size - chipSize) / 2 }}
      />
    </div>
  );
}

function CurrencyChip({
  code,
  color,
  size,
  style,
}: {
  code: string;
  color: string;
  size: number;
  style: React.CSSProperties;
}) {
  // Metals (XAU/XAG/...) — show second letter so the chip reads "AU" not "X".
  const label = code.startsWith("X") && code.length === 3 ? code[1] : code[0];
  return (
    <div
      className="absolute flex items-center justify-center rounded-full font-semibold text-bg ring-1 ring-bg"
      style={{
        ...style,
        width: size,
        height: size,
        fontSize: size * 0.55,
        backgroundColor: color,
      }}
    >
      {label}
    </div>
  );
}
