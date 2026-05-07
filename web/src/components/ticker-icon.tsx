"use client";

import {
  SiAmd,
  SiApple,
  SiCocacola,
  SiFord,
  SiGoogle,
  SiMeta,
  SiNetflix,
  SiNvidia,
  SiTesla,
} from "react-icons/si";
import type { IconType } from "react-icons";

type IconConfig = { Icon: IconType; color: string };

/**
 * Brands available in react-icons (simple-icons subset).
 * AMZN, MSFT, DIS, AMC were removed from simple-icons after legal
 * requests — those tickers fall back to colored initial circles below.
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
};

/** Muted palette for fallback letter chips so symbols don't all look identical. */
const FALLBACK_PALETTE = [
  "#5BC0EB", // info blue
  "#FFB347", // warm amber
  "#9B7EDE", // soft purple
  "#E07A5F", // muted coral
  "#7C8B95", // text-muted gray
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
        fontSize: size * 0.55,
        backgroundColor: color,
      }}
    >
      {symbol.slice(0, 1)}
    </div>
  );
}
