import {
  ArrowDown,
  ArrowUp,
  Bell,
  Calendar,
  Camera,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Filter,
  GalleryVerticalEnd,
  Grid3x3,
  LayoutGrid,
  ListFilter,
  Maximize2,
  MoreHorizontal,
  Plus,
  Redo2,
  Save,
  Search,
  Settings,
  Signal,
  Star,
  TrendingUp,
  Undo2,
  User,
  X,
} from "lucide-react";

export default function Home() {
  return (
    <div
      className="grid h-screen w-screen text-neutral-700"
      style={{
        background: "#e5e5e5",
        gridTemplateRows: "52px 1fr 240px 36px",
        gridTemplateColumns: "48px 280px 1fr 360px",
        gridTemplateAreas: `
          "header    header    header    header"
          "rail      context   chart     order"
          "rail      positions positions order"
          "status    status    status    status"
        `,
        gap: 1,
      }}
    >
      <Header />
      <Rail />
      <Context />
      <Chart />
      <Positions />
      <Order />
      <Status />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Zone wrapper
 * ─────────────────────────────────────────────────────────────────────*/

function Zone({
  area,
  children,
}: {
  area: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ gridArea: area }}
      className="relative overflow-hidden bg-white"
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Header bar
 * ─────────────────────────────────────────────────────────────────────*/

function Header() {
  return (
    <Zone area="header">
      <div className="flex h-full items-center gap-3 px-3">
        <span className="font-semibold tracking-tight text-neutral-700">
          TermX
        </span>
        <div className="ml-2 flex items-center gap-0.5">
          <Tab symbol="AAPL" />
          <Tab symbol="NVDA" active />
          <Tab symbol="AMZN" hasPosition />
          <button className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex h-8 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs">
          <span className="text-neutral-500">Demo</span>
          <span className="font-mono font-medium text-neutral-700">
            $9,605.17
          </span>
          <ChevronDown size={12} className="text-neutral-400" />
        </div>
        <div className="flex items-center gap-3 text-neutral-400">
          <Bell size={16} />
          <Clock size={16} />
          <Grid3x3 size={16} />
          <User size={18} className="rounded-full bg-neutral-200 p-0.5" />
        </div>
        <button className="flex h-9 items-center justify-center rounded-md bg-neutral-700 px-4 text-xs font-medium text-white">
          Deposit
        </button>
      </div>
    </Zone>
  );
}

function Tab({
  symbol,
  active = false,
  hasPosition = false,
}: {
  symbol: string;
  active?: boolean;
  hasPosition?: boolean;
}) {
  return (
    <div
      className={`flex h-9 items-center gap-1.5 px-2.5 text-xs ${
        active
          ? "border-b-2 border-neutral-700 font-semibold text-neutral-700"
          : "border-b-2 border-transparent text-neutral-500"
      }`}
    >
      <div className="h-3 w-3 rounded-full bg-neutral-300" />
      <span>{symbol}</span>
      {hasPosition && (
        <span className="font-mono text-[9px] tracking-tighter text-neutral-400">
          ‖‖‖
        </span>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Side rail
 * ─────────────────────────────────────────────────────────────────────*/

function Rail() {
  return (
    <Zone area="rail">
      <div className="flex h-full flex-col items-center gap-1 py-3">
        <RailIcon icon={<ListFilter size={16} />} active />
        <RailIcon icon={<Calendar size={16} />} />
        <RailIcon icon={<Settings size={16} />} />
      </div>
    </Zone>
  );
}

function RailIcon({
  icon,
  active = false,
}: {
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div className="relative">
      {active && (
        <div className="absolute -left-3 top-1.5 h-5 w-0.5 rounded-r-full bg-neutral-700" />
      )}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-md ${
          active ? "bg-neutral-200 text-neutral-700" : "text-neutral-400"
        }`}
      >
        {icon}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Contextual panel — Instruments
 * ─────────────────────────────────────────────────────────────────────*/

const watchlist = [
  { sym: "AAPL", bid: "223.69", ask: "223.71", dir: "down" as const },
  { sym: "AMD", bid: "162.16", ask: "162.18", dir: "up" as const },
  { sym: "NVDA", bid: "121.90", ask: "121.92", dir: "up" as const, active: true },
  { sym: "TSLA", bid: "239.49", ask: "239.51", dir: "down" as const },
  { sym: "MSFT", bid: "415.03", ask: "415.05", dir: "down" as const },
  { sym: "META", bid: "578.92", ask: "578.94", dir: "up" as const },
  { sym: "GOOGL", bid: "165.95", ask: "165.97", dir: "up" as const },
  { sym: "AMZN", bid: "182.11", ask: "182.13", dir: "down" as const },
  { sym: "NFLX", bid: "703.88", ask: "703.90", dir: "down" as const },
];

function Context() {
  return (
    <Zone area="context">
      <div className="flex h-full flex-col gap-2 p-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Instruments
        </span>
        {/* search */}
        <div className="flex h-8 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs">
          <Search size={12} className="text-neutral-400" />
          <span className="text-neutral-400">Search…</span>
        </div>
        {/* favorites collapsible */}
        <div className="flex h-8 items-center gap-2 rounded-md bg-neutral-50 px-3 text-xs">
          <ChevronRight size={12} className="text-neutral-400" />
          <Star size={12} className="text-neutral-400" />
          <span className="text-neutral-700">Favorites</span>
        </div>
        {/* column headers */}
        <div className="flex items-center gap-2 px-2 pt-1 text-[10px] uppercase tracking-wider text-neutral-400">
          <span>Symbol</span>
          <div className="flex-1" />
          <span className="w-12 text-right">Bid</span>
          <span className="w-12 text-right">Ask</span>
        </div>
        {/* rows */}
        <div className="flex flex-col gap-0.5 overflow-hidden">
          {watchlist.map((row) => (
            <ListRow key={row.sym} {...row} />
          ))}
        </div>
      </div>
    </Zone>
  );
}

function ListRow({
  sym,
  bid,
  ask,
  dir,
  active = false,
}: {
  sym: string;
  bid: string;
  ask: string;
  dir: "up" | "down";
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
        active ? "bg-neutral-100" : ""
      }`}
    >
      <span className="font-mono text-[8px] leading-none text-neutral-300">
        ⋮⋮
      </span>
      <div className="h-4 w-4 rounded-full bg-neutral-200" />
      <span className="font-semibold text-neutral-700">{sym}</span>
      <div className="flex-1" />
      {dir === "up" ? (
        <ArrowUp size={11} className="text-neutral-500" />
      ) : (
        <ArrowDown size={11} className="text-neutral-500" />
      )}
      <span className="w-12 rounded bg-neutral-50 px-1 py-0.5 text-right font-mono text-[10px] text-neutral-600">
        {bid}
      </span>
      <span className="w-12 rounded bg-neutral-50 px-1 py-0.5 text-right font-mono text-[10px] text-neutral-600">
        {ask}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Chart panel
 * ─────────────────────────────────────────────────────────────────────*/

const priceAxis = ["122.10", "122.05", "122.00", "121.95", "121.90", "121.85", "121.80", "121.75"];

function Chart() {
  return (
    <Zone area="chart">
      <div className="flex h-full flex-col">
        {/* toolbar */}
        <div className="flex h-11 items-center gap-2 border-b border-neutral-200 px-3 text-xs">
          <ToolbarBtn label="1m" />
          <ToolbarBtn icon={<TrendingUp size={13} />} />
          <ToolbarBtn icon={<span className="font-mono text-[10px]">fx</span>} label="Indicators" />
          <ToolbarBtn icon={<LayoutGrid size={13} />} />
          <ToolbarBtn icon={<Undo2 size={13} />} />
          <ToolbarBtn icon={<Redo2 size={13} />} />
          <div className="flex-1" />
          <ToolbarBtn icon={<Save size={13} />} label="Save" hasChevron />
          <ToolbarBtn icon={<Camera size={13} />} />
          <div className="flex h-7 items-center gap-2 rounded-md bg-neutral-200 px-2 font-mono text-[11px] text-neutral-700">
            <span>−$0.05</span>
            <X size={11} className="text-neutral-500" />
          </div>
          <ToolbarBtn icon={<Maximize2 size={13} />} />
        </div>

        {/* canvas + axis */}
        <div className="relative flex flex-1 overflow-hidden">
          <div className="relative flex flex-1 items-end gap-1 px-4 py-4">
            {/* OHLC overlay */}
            <div className="absolute left-4 top-3 z-10 flex items-center gap-3 font-mono text-[11px]">
              <span className="font-sans font-semibold text-neutral-700">NVDA · 1m</span>
              <span className="text-neutral-500">O 121.85</span>
              <span className="text-neutral-500">H 122.10</span>
              <span className="text-neutral-500">L 121.78</span>
              <span className="text-neutral-700">C 121.90</span>
              <span className="text-neutral-500">+0.05 (+0.04%)</span>
            </div>

            {/* candles */}
            {Array.from({ length: 60 }).map((_, i) => {
              const noise = Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.3));
              const h = 25 + noise * 60 + (i % 7 === 0 ? 10 : 0);
              const isUp = (i * 17) % 5 < 3;
              return (
                <div
                  key={i}
                  className={isUp ? "bg-neutral-300" : "bg-neutral-500"}
                  style={{ width: 5, height: `${h}%` }}
                />
              );
            })}

            {/* TP line */}
            <PriceLineLabel top="28%" label="TP" tone="muted" />
            <div className="pointer-events-none absolute left-4 right-2 top-[28%] border-t border-dashed border-neutral-300" />

            {/* Entry line + chip */}
            <div className="pointer-events-none absolute left-4 right-2 top-[42%] border-t border-dashed border-neutral-500" />
            <div className="absolute right-16 top-[42%] z-10 flex h-5 -translate-y-1/2 items-center gap-1.5 rounded-sm bg-neutral-700 px-2 font-mono text-[10px] text-white">
              <span>1</span>
              <span className="opacity-50">·</span>
              <span>−$0.05</span>
              <X size={9} className="opacity-70" />
            </div>

            {/* SL line */}
            <PriceLineLabel top="58%" label="SL" tone="muted" />
            <div className="pointer-events-none absolute left-4 right-2 top-[58%] border-t border-dashed border-neutral-300" />
          </div>

          {/* price axis */}
          <div className="relative flex w-16 flex-col justify-between border-l border-neutral-100 px-2 py-2 font-mono text-[10px] text-neutral-500">
            {priceAxis.map((price, i) => (
              <span key={price} className={i === 4 ? "text-neutral-700" : ""}>
                {price}
              </span>
            ))}
            {/* current price tag */}
            <div className="absolute right-1 top-[42%] flex h-5 -translate-y-1/2 items-center justify-center rounded-sm bg-neutral-700 px-2 font-mono text-[10px] font-medium text-white">
              121.90
            </div>
          </div>
        </div>

        {/* bottom timeframe range strip */}
        <div className="flex h-10 items-center gap-1 border-t border-neutral-200 px-3 text-xs">
          {["5y", "1y", "6m", "3m", "1m", "5d", "1d"].map((k) => (
            <button
              key={k}
              className={`flex h-6 w-9 items-center justify-center rounded text-[11px] ${
                k === "1m"
                  ? "bg-neutral-200 font-medium text-neutral-700"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {k}
            </button>
          ))}
          <button className="ml-1 flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100">
            <Calendar size={12} />
          </button>
          <div className="flex-1" />
          <span className="font-mono text-[11px] text-neutral-500">
            16:57:03 UTC
          </span>
          <button className="rounded px-2 py-1 text-[11px] text-neutral-500 hover:bg-neutral-100">
            auto
          </button>
        </div>
      </div>
    </Zone>
  );
}

function ToolbarBtn({
  icon,
  label,
  hasChevron = false,
}: {
  icon?: React.ReactNode;
  label?: string;
  hasChevron?: boolean;
}) {
  return (
    <button className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] text-neutral-600 hover:bg-neutral-100">
      {icon}
      {label && <span>{label}</span>}
      {hasChevron && <ChevronDown size={11} className="text-neutral-400" />}
    </button>
  );
}

function PriceLineLabel({
  top,
  label,
  tone,
}: {
  top: string;
  label: string;
  tone: "muted" | "strong";
}) {
  return (
    <span
      className={`absolute left-6 z-10 -translate-y-1/2 rounded-sm px-1.5 py-0.5 font-mono text-[9px] ${
        tone === "muted"
          ? "bg-neutral-200 text-neutral-600"
          : "bg-neutral-700 text-white"
      }`}
      style={{ top }}
    >
      {label}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Order panel
 * ─────────────────────────────────────────────────────────────────────*/

function Order() {
  return (
    <Zone area="order">
      <div className="flex h-full flex-col gap-3 p-3">
        {/* header */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-neutral-300" />
          <span className="text-sm font-semibold text-neutral-700">NVDA</span>
          <span className="text-xs text-neutral-400">Nvidia Corp.</span>
          <div className="flex-1" />
          <X size={14} className="text-neutral-400" />
        </div>

        {/* mode dropdown */}
        <div className="flex h-9 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs">
          <span className="text-neutral-500">Order mode</span>
          <span className="font-medium text-neutral-700">Regular form</span>
          <div className="flex-1" />
          <ChevronDown size={12} className="text-neutral-400" />
        </div>

        {/* sell/buy quote split */}
        <div className="relative flex gap-1">
          <QuoteCard side="sell" price="121" subPrice="90" />
          <QuoteCard side="buy" price="121" subPrice="92" />
          <div className="absolute left-1/2 top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white font-mono text-[10px] font-medium text-neutral-500">
            0.02
          </div>
        </div>

        {/* sentiment bar */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="w-7 text-neutral-500">48%</span>
          <div className="flex h-1.5 flex-1 overflow-hidden rounded-full">
            <div className="h-full w-[48%] rounded-l-full bg-neutral-500" />
            <div className="h-full w-[52%] rounded-r-full bg-neutral-300" />
          </div>
          <span className="w-7 text-right text-neutral-500">52%</span>
        </div>

        {/* tabs */}
        <div className="flex border-b border-neutral-200 text-xs">
          <button className="flex-1 border-b-2 border-neutral-700 py-2 font-medium text-neutral-700">
            Market
          </button>
          <button className="flex-1 border-b-2 border-transparent py-2 text-neutral-500">
            Pending
          </button>
        </div>

        {/* form fields */}
        <FormField label="Volume" value="1" suffix="Shares" hasSteppers />
        <FormField label="Take Profit" value="Not set" suffix="Price ▾" hasSteppers />
        <FormField label="Stop Loss" value="Not set" suffix="Price ▾" hasSteppers />

        <div className="flex-1" />

        {/* CTA */}
        <button className="flex h-10 items-center justify-center rounded-md bg-neutral-700 text-sm font-medium text-white">
          Buy NVDA · 1 Share
        </button>
        <button className="flex h-9 items-center justify-center rounded-md border border-neutral-200 text-xs text-neutral-700">
          Cancel
        </button>

        {/* footer */}
        <div className="flex flex-col gap-1.5 border-t border-neutral-200 pt-2 text-xs">
          <FooterRow label="Fees" value="≈ $0.00" />
          <FooterRow label="Margin used" value="$0.00" />
          <FooterRow label="Buying power" value="$8,861.10" />
          <button className="flex items-center gap-1 text-[11px] text-neutral-500">
            More
            <ChevronDown size={10} />
          </button>
        </div>
      </div>
    </Zone>
  );
}

function QuoteCard({
  side,
  price,
  subPrice,
}: {
  side: "sell" | "buy";
  price: string;
  subPrice: string;
}) {
  return (
    <div className="flex h-16 flex-1 flex-col justify-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        {side === "sell" ? "Sell" : "Buy"}
      </span>
      <div className="flex items-baseline gap-0.5 font-mono">
        <span className="text-base font-semibold text-neutral-600">
          {price}.
        </span>
        <span className="text-2xl font-semibold leading-none text-neutral-700">
          {subPrice}
        </span>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  suffix,
  hasSteppers = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  hasSteppers?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <div className="flex h-9 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-xs">
        <span className="font-mono font-medium text-neutral-700">{value}</span>
        {suffix && <span className="text-neutral-400">{suffix}</span>}
        <div className="flex-1" />
        {hasSteppers && (
          <div className="flex items-center gap-2 text-neutral-400">
            <span>−</span>
            <span>+</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FooterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-mono text-neutral-700">{value}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Positions panel
 * ─────────────────────────────────────────────────────────────────────*/

function Positions() {
  return (
    <Zone area="positions">
      <div className="flex h-full flex-col">
        {/* tabs */}
        <div className="flex h-10 items-center gap-3 border-b border-neutral-200 px-3 text-xs">
          <div className="flex items-center gap-1.5 border-b-2 border-neutral-700 py-2 font-medium text-neutral-700">
            <span>Open</span>
            <span className="rounded-full bg-neutral-700 px-1.5 py-0.5 text-[9px] font-medium text-white">
              1
            </span>
          </div>
          <span className="text-neutral-500">Pending</span>
          <span className="text-neutral-500">Closed</span>
          <div className="flex-1" />
          <Filter size={14} className="text-neutral-400" />
          <GalleryVerticalEnd size={14} className="text-neutral-400" />
          <MoreHorizontal size={14} className="text-neutral-400" />
          <X size={14} className="text-neutral-400" />
        </div>

        {/* table header */}
        <div className="grid grid-cols-[80px_60px_70px_90px_90px_80px_80px_90px_80px_60px] items-center gap-3 border-b border-neutral-100 px-3 py-2 text-[10px] uppercase tracking-wider text-neutral-400">
          <span>Symbol</span>
          <span>Type</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Open price</span>
          <span className="text-right">Current</span>
          <span className="text-right">T/P</span>
          <span className="text-right">S/L</span>
          <span className="text-right">Position</span>
          <span className="text-right">P/L USD</span>
          <span></span>
        </div>

        {/* row */}
        <div className="grid grid-cols-[80px_60px_70px_90px_90px_80px_80px_90px_80px_60px] items-center gap-3 border-b border-neutral-50 px-3 py-2.5 text-xs">
          <span className="font-semibold text-neutral-700">NVDA</span>
          <span className="text-neutral-700">Buy</span>
          <span className="text-right font-mono text-neutral-700">1</span>
          <span className="text-right font-mono text-neutral-700">121.85</span>
          <span className="text-right font-mono text-neutral-700">121.90</span>
          <span className="text-right font-mono text-neutral-500">122.50</span>
          <span className="text-right font-mono text-neutral-500">121.40</span>
          <span className="text-right font-mono text-neutral-500">485720</span>
          <span className="text-right font-mono font-medium text-neutral-700">
            +$0.05
          </span>
          <span className="flex items-center justify-end gap-2 text-neutral-400">
            <Edit3 size={12} />
            <X size={12} />
          </span>
        </div>

        {/* empty rows for visual fill */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 border-b border-neutral-50" />
        ))}
      </div>
    </Zone>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Status bar
 * ─────────────────────────────────────────────────────────────────────*/

function Status() {
  return (
    <Zone area="status">
      <div className="flex h-full items-center gap-6 px-4 text-[11px]">
        <StatusItem label="Balance" value="$10,000.09" />
        <StatusItem label="Buying power" value="$8,861.10" />
        <StatusItem label="Cash" value="$9,431.10" />
        <StatusItem label="Day P/L" value="−$50.18" />
        <StatusItem label="Total P/L" value="+$235.40" />
        <StatusItem label="Margin used" value="$1,138.99" />
        <div className="flex-1" />
        <button className="flex h-6 items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-neutral-700">
          <span>Close all</span>
          <ChevronDown size={11} className="text-neutral-400" />
        </button>
        <Signal size={14} className="text-neutral-400" />
      </div>
    </Zone>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-neutral-500">{label}:</span>
      <span className="font-mono font-medium text-neutral-700">{value}</span>
    </div>
  );
}
