/**
 * Mock data for the trading terminal prototype.
 * Single source of truth — replace with real API calls later.
 */

export type Instrument = {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  last: number;
  change: number;
  changePct: number;
  volume: number;
  signal: "up" | "down" | null;
};

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Position = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  volume: number;
  openPrice: number;
  currentPrice: number;
  takeProfit: number | null;
  stopLoss: number | null;
  pnl: number;
  positionId: string;
};

export type PendingOrder = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "limit" | "stop" | "stop-limit";
  volume: number;
  limitPrice: number | null;
  stopPrice: number | null;
  createdAt: string;
};

export type Account = {
  balance: number;
  buyingPower: number;
  cash: number;
  dayPnL: number;
  totalPnL: number;
  marginUsed: number;
  equity: number;
};

/* ──────────────────────────────────────────────────────────────────────
 * Watchlist (mirrors Robinhood's demo set)
 * ─────────────────────────────────────────────────────────────────────*/

export const WATCHLIST: Instrument[] = [
  { symbol: "AAPL", name: "Apple Inc.", bid: 223.69, ask: 223.71, last: 223.71, change: -3.07, changePct: -1.35, volume: 17_172_625, signal: "down" },
  { symbol: "AMC", name: "AMC Entertainment", bid: 4.42, ask: 4.43, last: 4.43, change: 0.05, changePct: 1.04, volume: 4_651_679, signal: "up" },
  { symbol: "AMD", name: "Advanced Micro Devices", bid: 162.16, ask: 162.18, last: 162.16, change: 2.38, changePct: 1.49, volume: 23_047_227, signal: "up" },
  { symbol: "AMZN", name: "Amazon.com", bid: 182.11, ask: 182.13, last: 182.11, change: -2.65, changePct: -1.43, volume: 17_902_276, signal: "down" },
  { symbol: "DIS", name: "The Walt Disney Co.", bid: 93.45, ask: 93.47, last: 93.45, change: -0.71, changePct: -0.75, volume: 3_133_241, signal: "down" },
  { symbol: "F", name: "Ford Motor Co.", bid: 10.34, ask: 10.35, last: 10.34, change: -0.13, changePct: -1.19, volume: 24_752_575, signal: "down" },
  { symbol: "GOOGL", name: "Alphabet Inc.", bid: 165.94, ask: 165.96, last: 165.95, change: 0.09, changePct: 0.05, volume: 7_772_554, signal: "up" },
  { symbol: "KO", name: "The Coca-Cola Co.", bid: 70.37, ask: 70.39, last: 70.42, change: -0.59, changePct: -0.82, volume: 3_813_902, signal: "down" },
  { symbol: "META", name: "Meta Platforms", bid: 578.92, ask: 578.94, last: 578.92, change: 6.11, changePct: 1.07, volume: 6_671_762, signal: "up" },
  { symbol: "MSFT", name: "Microsoft Corp.", bid: 415.03, ask: 415.05, last: 415.03, change: -2.10, changePct: -0.50, volume: 6_951_770, signal: "down" },
  { symbol: "NFLX", name: "Netflix Inc.", bid: 703.88, ask: 703.90, last: 703.88, change: -7.21, changePct: -1.01, volume: 986_315, signal: "down" },
  { symbol: "NVDA", name: "Nvidia Corp.", bid: 121.90, ask: 121.92, last: 121.90, change: 3.05, changePct: 2.57, volume: 210_335_961, signal: "up" },
  { symbol: "TSLA", name: "Tesla Inc.", bid: 239.49, ask: 239.51, last: 239.49, change: -9.53, changePct: -3.83, volume: 54_356_236, signal: "down" },
];

/* ──────────────────────────────────────────────────────────────────────
 * Tabs / active instrument
 * ─────────────────────────────────────────────────────────────────────*/

export const OPEN_TABS: string[] = ["AAPL", "NVDA", "AMZN"];
export const ACTIVE_SYMBOL = "NVDA";

/* ──────────────────────────────────────────────────────────────────────
 * Account
 * ─────────────────────────────────────────────────────────────────────*/

export const ACCOUNT: Account = {
  balance: 10_000.0,
  buyingPower: 10_000.0,
  cash: 10_000.0,
  dayPnL: 0,
  totalPnL: 0,
  marginUsed: 0,
  equity: 10_000.0,
};

/* ──────────────────────────────────────────────────────────────────────
 * Positions / orders
 * ─────────────────────────────────────────────────────────────────────*/

// Default state: no open positions. Users will open / edit / close
// positions during research sessions (functionality TBD).
export const POSITIONS: Position[] = [];

export const PENDING_ORDERS: PendingOrder[] = [];

/* ──────────────────────────────────────────────────────────────────────
 * Candles — deterministic seeded random walk so render is stable
 * ─────────────────────────────────────────────────────────────────────*/

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateCandles(
  seed: number,
  count: number,
  basePrice: number,
  volatility: number
): Candle[] {
  const rand = makeRng(seed);
  const out: Candle[] = [];
  let price = basePrice;
  const startTime = Math.floor(Date.now() / 1000) - count * 60;
  for (let i = 0; i < count; i++) {
    const open = price;
    const direction = rand() > 0.48 ? 1 : -1;
    const change = rand() * volatility * direction;
    const close = open + change;
    const high = Math.max(open, close) + rand() * volatility * 0.4;
    const low = Math.min(open, close) - rand() * volatility * 0.4;
    const volume = Math.round((rand() * 0.7 + 0.3) * 1_000_000);
    out.push({ time: startTime + i * 60, open, high, low, close, volume });
    price = close;
  }
  return out;
}

const CANDLE_PARAMS: Record<string, { seed: number; base: number; vol: number }> = {
  AAPL: { seed: 11, base: 224, vol: 0.6 },
  NVDA: { seed: 23, base: 121, vol: 0.45 },
  AMZN: { seed: 31, base: 182, vol: 0.55 },
};

export const CANDLES: Record<string, Candle[]> = Object.fromEntries(
  Object.entries(CANDLE_PARAMS).map(([symbol, p]) => [
    symbol,
    generateCandles(p.seed, 180, p.base, p.vol),
  ])
);

/* ──────────────────────────────────────────────────────────────────────
 * Sentiment (mock buy/sell %)
 * ─────────────────────────────────────────────────────────────────────*/

export const SENTIMENT: Record<string, { buy: number; sell: number }> = {
  AAPL: { buy: 41, sell: 59 },
  NVDA: { buy: 52, sell: 48 },
  AMZN: { buy: 47, sell: 53 },
};

/* ──────────────────────────────────────────────────────────────────────
 * Helpers
 * ─────────────────────────────────────────────────────────────────────*/

export function getInstrument(symbol: string): Instrument | undefined {
  return WATCHLIST.find((i) => i.symbol === symbol);
}

export function hasOpenPosition(symbol: string): boolean {
  return POSITIONS.some((p) => p.symbol === symbol);
}

export function formatUsd(n: number, opts: { signed?: boolean } = {}): string {
  const sign = opts.signed && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
}
