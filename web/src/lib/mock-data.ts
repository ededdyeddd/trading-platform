/**
 * Mock data for the trading terminal prototype.
 * Single source of truth — replace with real API calls later.
 */

export type InstrumentCategory =
  | "stocks"
  | "majors"
  | "minors"
  | "exotic"
  | "metals"
  | "crypto"
  | "indices"
  | "energy";

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
  category: InstrumentCategory;
  favorite: boolean;
  /** Decimal places used when displaying bid/ask in lists. */
  precision: number;
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
 * Catalog — mixed equities, forex, metals, crypto, indices, energy.
 *
 * The original prototype was equities-only; we expanded the catalog so
 * the instruments panel can demonstrate category filtering matching the
 * competitor reference (Favorites / Majors / Metals / Crypto / Indices /
 * Stocks / Energy / Exotic / Minors / All) without committing to a full
 * forex experience elsewhere. Other panels still use NVDA via
 * ACTIVE_SYMBOL, so equities pricing logic is untouched.
 * ─────────────────────────────────────────────────────────────────────*/

export const WATCHLIST: Instrument[] = [
  // Stocks
  { symbol: "AAPL",    name: "Apple Inc.",                bid: 223.69,   ask: 223.71,   last: 223.71,   change: -3.07,  changePct: -1.35, volume: 17_172_625,  signal: "down", category: "stocks",  favorite: true,  precision: 2 },
  { symbol: "AMC",     name: "AMC Entertainment",         bid: 4.42,     ask: 4.43,     last: 4.43,     change: 0.05,   changePct: 1.04,  volume: 4_651_679,   signal: "up",   category: "stocks",  favorite: false, precision: 2 },
  { symbol: "AMD",     name: "Advanced Micro Devices",    bid: 162.16,   ask: 162.18,   last: 162.16,   change: 2.38,   changePct: 1.49,  volume: 23_047_227,  signal: "up",   category: "stocks",  favorite: false, precision: 2 },
  { symbol: "AMZN",    name: "Amazon.com",                bid: 182.11,   ask: 182.13,   last: 182.11,   change: -2.65,  changePct: -1.43, volume: 17_902_276,  signal: "down", category: "stocks",  favorite: true,  precision: 2 },
  { symbol: "DIS",     name: "The Walt Disney Co.",       bid: 93.45,    ask: 93.47,    last: 93.45,    change: -0.71,  changePct: -0.75, volume: 3_133_241,   signal: "down", category: "stocks",  favorite: false, precision: 2 },
  { symbol: "F",       name: "Ford Motor Co.",            bid: 10.34,    ask: 10.35,    last: 10.34,    change: -0.13,  changePct: -1.19, volume: 24_752_575,  signal: "down", category: "stocks",  favorite: false, precision: 2 },
  { symbol: "GOOGL",   name: "Alphabet Inc.",             bid: 165.94,   ask: 165.96,   last: 165.95,   change: 0.09,   changePct: 0.05,  volume: 7_772_554,   signal: "up",   category: "stocks",  favorite: false, precision: 2 },
  { symbol: "KO",      name: "The Coca-Cola Co.",         bid: 70.37,    ask: 70.39,    last: 70.42,    change: -0.59,  changePct: -0.82, volume: 3_813_902,   signal: "down", category: "stocks",  favorite: false, precision: 2 },
  { symbol: "META",    name: "Meta Platforms",            bid: 578.92,   ask: 578.94,   last: 578.92,   change: 6.11,   changePct: 1.07,  volume: 6_671_762,   signal: "up",   category: "stocks",  favorite: false, precision: 2 },
  { symbol: "MSFT",    name: "Microsoft Corp.",           bid: 415.03,   ask: 415.05,   last: 415.03,   change: -2.10,  changePct: -0.50, volume: 6_951_770,   signal: "down", category: "stocks",  favorite: true,  precision: 2 },
  { symbol: "NFLX",    name: "Netflix Inc.",              bid: 703.88,   ask: 703.90,   last: 703.88,   change: -7.21,  changePct: -1.01, volume: 986_315,     signal: "down", category: "stocks",  favorite: false, precision: 2 },
  { symbol: "NVDA",    name: "Nvidia Corp.",              bid: 121.90,   ask: 121.92,   last: 121.90,   change: 3.05,   changePct: 2.57,  volume: 210_335_961, signal: "up",   category: "stocks",  favorite: true,  precision: 2 },
  { symbol: "TSLA",    name: "Tesla Inc.",                bid: 239.49,   ask: 239.51,   last: 239.49,   change: -9.53,  changePct: -3.83, volume: 54_356_236,  signal: "down", category: "stocks",  favorite: false, precision: 2 },

  // Majors (forex)
  { symbol: "EUR/USD", name: "Euro vs US Dollar",         bid: 1.08945,  ask: 1.08947,  last: 1.08946,  change: 0.0021, changePct: 0.19,  volume: 89_500_000,  signal: "up",   category: "majors",  favorite: true,  precision: 5 },
  { symbol: "GBP/USD", name: "British Pound vs US Dollar",bid: 1.27123,  ask: 1.27127,  last: 1.27125,  change: -0.0014,changePct: -0.11, volume: 41_200_000,  signal: "down", category: "majors",  favorite: false, precision: 5 },
  { symbol: "USD/JPY", name: "US Dollar vs Japanese Yen", bid: 149.234,  ask: 149.238,  last: 149.236,  change: 0.412,  changePct: 0.28,  volume: 58_300_000,  signal: "up",   category: "majors",  favorite: false, precision: 3 },
  { symbol: "USD/CHF", name: "US Dollar vs Swiss Franc",  bid: 0.88134,  ask: 0.88137,  last: 0.88135,  change: -0.0009,changePct: -0.10, volume: 18_400_000,  signal: "down", category: "majors",  favorite: false, precision: 5 },
  { symbol: "AUD/USD", name: "Australian Dollar vs USD",  bid: 0.65823,  ask: 0.65826,  last: 0.65824,  change: 0.0008, changePct: 0.12,  volume: 24_100_000,  signal: "up",   category: "majors",  favorite: false, precision: 5 },
  { symbol: "USD/CAD", name: "US Dollar vs Canadian Dollar", bid: 1.36412, ask: 1.36416, last: 1.36414, change: 0.0017, changePct: 0.12,  volume: 19_700_000,  signal: "up",   category: "majors",  favorite: false, precision: 5 },
  { symbol: "NZD/USD", name: "New Zealand Dollar vs USD", bid: 0.60214,  ask: 0.60218,  last: 0.60216,  change: -0.0011,changePct: -0.18, volume: 8_300_000,   signal: "down", category: "majors",  favorite: false, precision: 5 },

  // Minors (cross pairs, no USD)
  { symbol: "EUR/GBP", name: "Euro vs British Pound",     bid: 0.87048,  ask: 0.87061,  last: 0.87055,  change: 0.0009, changePct: 0.10,  volume: 11_400_000,  signal: "up",   category: "minors",  favorite: false, precision: 5 },
  { symbol: "EUR/JPY", name: "Euro vs Japanese Yen",      bid: 186.558,  ask: 186.574,  last: 186.566,  change: 0.612,  changePct: 0.33,  volume: 14_200_000,  signal: "up",   category: "minors",  favorite: false, precision: 3 },
  { symbol: "GBP/JPY", name: "British Pound vs Japanese Yen", bid: 189.732, ask: 189.748, last: 189.740, change: 0.503, changePct: 0.27,  volume: 9_100_000,   signal: "up",   category: "minors",  favorite: false, precision: 3 },
  { symbol: "EUR/AUD", name: "Euro vs Australian Dollar", bid: 1.64094,  ask: 1.64111,  last: 1.64102,  change: -0.0042,changePct: -0.26, volume: 6_300_000,   signal: "down", category: "minors",  favorite: false, precision: 5 },
  { symbol: "EUR/CHF", name: "Euro vs Swiss Franc",       bid: 0.95987,  ask: 0.95994,  last: 0.95990,  change: -0.0007,changePct: -0.07, volume: 5_700_000,   signal: "down", category: "minors",  favorite: false, precision: 5 },
  { symbol: "AUD/JPY", name: "Australian Dollar vs Japanese Yen", bid: 98.234, ask: 98.247, last: 98.240, change: 0.302, changePct: 0.31, volume: 7_400_000, signal: "up",   category: "minors",  favorite: false, precision: 3 },
  { symbol: "CAD/JPY", name: "Canadian Dollar vs Japanese Yen", bid: 109.412, ask: 109.428, last: 109.420, change: 0.231, changePct: 0.21, volume: 4_800_000, signal: "up",   category: "minors",  favorite: false, precision: 3 },

  // Exotic
  { symbol: "USD/TRY", name: "US Dollar vs Turkish Lira", bid: 32.4123,  ask: 32.4287,  last: 32.4205,  change: 0.0834, changePct: 0.26,  volume: 2_100_000,   signal: "up",   category: "exotic",  favorite: false, precision: 4 },
  { symbol: "USD/ZAR", name: "US Dollar vs South African Rand", bid: 18.7234, ask: 18.7298, last: 18.7266, change: -0.0421, changePct: -0.22, volume: 1_800_000, signal: "down", category: "exotic", favorite: false, precision: 4 },
  { symbol: "USD/MXN", name: "US Dollar vs Mexican Peso", bid: 17.0234,  ask: 17.0289,  last: 17.0262,  change: 0.0312, changePct: 0.18,  volume: 3_400_000,   signal: "up",   category: "exotic",  favorite: false, precision: 4 },
  { symbol: "USD/SGD", name: "US Dollar vs Singapore Dollar", bid: 1.34123, ask: 1.34141, last: 1.34132, change: -0.0008, changePct: -0.06, volume: 1_900_000, signal: "down", category: "exotic", favorite: false, precision: 5 },
  { symbol: "EUR/PLN", name: "Euro vs Polish Zloty",      bid: 4.21861,  ask: 4.23492,  last: 4.22676,  change: 0.0123, changePct: 0.29,  volume: 1_200_000,   signal: "up",   category: "exotic",  favorite: false, precision: 5 },
  { symbol: "EUR/SEK", name: "Euro vs Swedish Krona",     bid: 10.76326, ask: 10.79496, last: 10.77911, change: -0.0212,changePct: -0.20, volume: 1_500_000,   signal: "down", category: "exotic",  favorite: false, precision: 5 },
  { symbol: "EUR/NOK", name: "Euro vs Norwegian Krone",   bid: 11.05595, ask: 11.06600, last: 11.06097, change: 0.0182, changePct: 0.16,  volume: 1_300_000,   signal: "up",   category: "exotic",  favorite: false, precision: 5 },
  { symbol: "USD/HKD", name: "US Dollar vs Hong Kong Dollar", bid: 7.82123, ask: 7.82147, last: 7.82135, change: 0.0008, changePct: 0.01, volume: 2_200_000, signal: "up",   category: "exotic",  favorite: false, precision: 5 },

  // Metals
  { symbol: "XAU/USD", name: "Gold Spot vs US Dollar",    bid: 2034.52,  ask: 2034.78,  last: 2034.65,  change: 8.42,   changePct: 0.42,  volume: 12_300_000,  signal: "up",   category: "metals",  favorite: true,  precision: 2 },
  { symbol: "XAG/USD", name: "Silver Spot vs US Dollar",  bid: 23.452,   ask: 23.489,   last: 23.470,   change: -0.123, changePct: -0.52, volume: 6_700_000,   signal: "down", category: "metals",  favorite: false, precision: 3 },
  { symbol: "XPT/USD", name: "Platinum Spot vs US Dollar",bid: 932.20,   ask: 932.45,   last: 932.33,   change: 3.21,   changePct: 0.35,  volume: 1_400_000,   signal: "up",   category: "metals",  favorite: false, precision: 2 },
  { symbol: "XPD/USD", name: "Palladium Spot vs US Dollar",bid: 1024.10, ask: 1024.45,  last: 1024.27,  change: -5.32,  changePct: -0.52, volume: 980_000,     signal: "down", category: "metals",  favorite: false, precision: 2 },

  // Crypto
  { symbol: "BTC/USD", name: "Bitcoin",                   bid: 67234.50, ask: 67238.10, last: 67236.30, change: 432.10, changePct: 0.65,  volume: 28_400_000,  signal: "up",   category: "crypto",  favorite: true,  precision: 2 },
  { symbol: "ETH/USD", name: "Ethereum",                  bid: 3245.20,  ask: 3245.45,  last: 3245.33,  change: -42.10, changePct: -1.28, volume: 14_700_000,  signal: "down", category: "crypto",  favorite: true,  precision: 2 },
  { symbol: "SOL/USD", name: "Solana",                    bid: 156.82,   ask: 156.85,   last: 156.83,   change: 4.32,   changePct: 2.83,  volume: 5_300_000,   signal: "up",   category: "crypto",  favorite: false, precision: 2 },
  { symbol: "XRP/USD", name: "Ripple",                    bid: 0.5234,   ask: 0.5236,   last: 0.5235,   change: 0.0021, changePct: 0.40,  volume: 8_900_000,   signal: "up",   category: "crypto",  favorite: false, precision: 4 },
  { symbol: "DOGE/USD",name: "Dogecoin",                  bid: 0.1523,   ask: 0.1525,   last: 0.1524,   change: -0.0034,changePct: -2.18, volume: 6_400_000,   signal: "down", category: "crypto",  favorite: false, precision: 4 },
  { symbol: "ADA/USD", name: "Cardano",                   bid: 0.4523,   ask: 0.4525,   last: 0.4524,   change: 0.0089, changePct: 2.01,  volume: 4_100_000,   signal: "up",   category: "crypto",  favorite: false, precision: 4 },

  // Indices
  { symbol: "SPX500",  name: "US 500",                    bid: 5234.20,  ask: 5234.50,  last: 5234.35,  change: 12.40,  changePct: 0.24,  volume: 32_400_000,  signal: "up",   category: "indices", favorite: false, precision: 2 },
  { symbol: "NAS100",  name: "US Tech 100",               bid: 18234.20, ask: 18234.80, last: 18234.50, change: 87.20,  changePct: 0.48,  volume: 21_300_000,  signal: "up",   category: "indices", favorite: false, precision: 2 },
  { symbol: "US30",    name: "US Wall Street 30",         bid: 39234.10, ask: 39234.60, last: 39234.35, change: -41.20, changePct: -0.10, volume: 15_800_000,  signal: "down", category: "indices", favorite: false, precision: 2 },
  { symbol: "GER40",   name: "Germany 40",                bid: 18532.20, ask: 18532.80, last: 18532.50, change: 24.10,  changePct: 0.13,  volume: 7_200_000,   signal: "up",   category: "indices", favorite: false, precision: 2 },
  { symbol: "UK100",   name: "UK 100",                    bid: 7823.40,  ask: 7823.80,  last: 7823.60,  change: -12.30, changePct: -0.16, volume: 5_900_000,   signal: "down", category: "indices", favorite: false, precision: 2 },
  { symbol: "JP225",   name: "Japan 225",                 bid: 39823.20, ask: 39823.80, last: 39823.50, change: 142.10, changePct: 0.36,  volume: 9_400_000,   signal: "up",   category: "indices", favorite: false, precision: 2 },
  { symbol: "HK50",    name: "Hong Kong 50",              bid: 17234.50, ask: 17235.10, last: 17234.80, change: -52.40, changePct: -0.30, volume: 4_700_000,   signal: "down", category: "indices", favorite: false, precision: 2 },

  // Energy
  { symbol: "WTI",     name: "Crude Oil WTI",             bid: 78.342,   ask: 78.378,   last: 78.360,   change: 0.421,  changePct: 0.54,  volume: 11_200_000,  signal: "up",   category: "energy",  favorite: false, precision: 3 },
  { symbol: "BRENT",   name: "Crude Oil Brent",           bid: 82.451,   ask: 82.487,   last: 82.469,   change: 0.512,  changePct: 0.62,  volume: 9_800_000,   signal: "up",   category: "energy",  favorite: false, precision: 3 },
  { symbol: "NGAS",    name: "Natural Gas",               bid: 2.3451,   ask: 2.3489,   last: 2.3470,   change: -0.0421,changePct: -1.76, volume: 6_300_000,   signal: "down", category: "energy",  favorite: false, precision: 4 },
];

/* ──────────────────────────────────────────────────────────────────────
 * Category filter — superset of InstrumentCategory plus derived filters.
 * "favorites"/"most-traded"/"top-movers"/"all" are computed from the
 * catalog; the rest map 1:1 to InstrumentCategory.
 * ─────────────────────────────────────────────────────────────────────*/

export type CategoryFilter =
  | "favorites"
  | "most-traded"
  | "top-movers"
  | "all"
  | InstrumentCategory;

export const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "favorites",   label: "Favorites" },
  { value: "most-traded", label: "Most traded" },
  { value: "top-movers",  label: "Top movers" },
  { value: "majors",      label: "Majors" },
  { value: "metals",      label: "Metals" },
  { value: "crypto",      label: "Crypto" },
  { value: "indices",     label: "Indices" },
  { value: "stocks",      label: "Stocks" },
  { value: "energy",      label: "Energy" },
  { value: "exotic",      label: "Exotic" },
  { value: "minors",      label: "Minors" },
  { value: "all",         label: "All" },
];

export function filterInstruments(
  items: Instrument[],
  category: CategoryFilter,
  query: string,
  favorites: ReadonlySet<string>
): Instrument[] {
  const byCategory =
    category === "all"
      ? items
      : category === "favorites"
        ? items.filter((i) => favorites.has(i.symbol))
        : category === "most-traded"
          ? [...items].sort((a, b) => b.volume - a.volume).slice(0, 15)
          : category === "top-movers"
            ? [...items]
                .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
                .slice(0, 15)
            : items.filter((i) => i.category === category);

  const q = query.trim().toLowerCase();
  if (!q) return byCategory;
  return byCategory.filter(
    (i) =>
      i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
  );
}

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
