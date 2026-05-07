# Project knowledge base

Practical reference for understanding the trading terminal prototype — what things mean, where they live, how they connect. Read top-to-bottom or jump to a section.

## What this is

Web prototype of a desktop trading terminal, built as a base for user testing.

- **Visual style** is a synthesis of:
  - **Robinhood Legends** — chartreuse-green accent (`#C8FF00`), data density, dark surfaces, mono numerics, table conventions
  - **Revolut** — rounded panels (12–16px radius), pill chips, soft cards, subtle teal-glow background
- **Layout structure** comes from **Exness** MetaTrader-style terminal — 7 zones: HeaderBar, SideRail, ContextualPanel, ChartPanel, OrderPanel, PositionsPanel, StatusBar
- **Asset class** is **equities** (stocks). Even though Exness is a forex platform, we kept equity vocabulary and mock data — no forex lots/pips/leverage emphasis
- **Drawing tools sidebar** (TradingView-style) is intentionally **omitted** for the prototype

## Three-artifact design system

Every visual decision lives in three places that stay synced:

1. **`design/design.md`** — human-readable styleguide. Source of truth for tokens (color/type/spacing/radius/elevation/motion) AND component patterns (panel chrome, buttons, inputs, tables, etc.).
2. **`web/src/app/globals.css`** — `@theme` block (Tailwind v4) that mirrors `design.md` Section A as CSS custom properties. The web prototype reads from here.
3. **Figma file** (planned) — same tokens defined as Figma Variables, same screens defined as frames. Edits here flow back to `design.md` + `globals.css` via the Figma MCP.

Open `design/tokens-preview.html` in a browser for a standalone visual reference of every token + component pattern.

---

## Trading glossary

Domain terms that appear in the UI:

| Term | What it means |
|---|---|
| **Symbol / ticker** | Short identifier for an instrument (AAPL, NVDA, AMZN, …) |
| **Bid** | Highest price someone is willing to buy at; **what you can SELL at** |
| **Ask** | Lowest price someone is willing to sell at; **what you can BUY at** |
| **Spread** | `ask − bid`. Cost of a round-trip in/out. Forex shows pips; equities show cents |
| **Last** | Most recent traded price |
| **Volume** | Shares traded in a period (per candle = per minute by default here) |
| **OHLC** | A candle's Open / High / Low / Close prices |
| **Position** | An open trade — you bought (or shorted) N shares; market price now drifts vs your entry |
| **Entry price** | Price at which a position was opened |
| **TP** (Take Profit) | A price target where the position auto-closes for profit |
| **SL** (Stop Loss) | A price level where the position auto-closes to limit loss |
| **P/L** | Profit/Loss in dollars; positive = green, negative = red |
| **Day P/L** | P/L for the current trading day |
| **Total P/L** | Cumulative across all positions |
| **Pending order** | An order not yet filled — waiting for market to hit a trigger |
| **Buy Limit** | Buy when price *drops* to a target (cheaper than now) |
| **Sell Limit** | Sell when price *rises* to a target (richer than now) |
| **Stop** | Trigger a market order when price *crosses* a stop price |
| **Market order** | Execute immediately at best available price |
| **Limit order** | Execute only at limit price *or better* |
| **Time in force** | How long an order stays active (Good for day, GTC, …) |
| **Buying power** | How much capital you can deploy on new positions |
| **Cash** | Liquid funds in the account |
| **Balance** | Total account value (cash + position market value) |
| **Equity** | Same as balance for prototype purposes |
| **Margin used** | Capital tied up in open positions |
| **Sentiment** | Mock indicator showing % of buyers vs sellers (visual only) |

---

## Component map

| Component | Role | File |
|---|---|---|
| `<HeaderBar>` | Top bar: logo, instrument tabs, account, icons, Deposit | [components/header-bar.tsx](../web/src/components/header-bar.tsx) |
| `<SideRail>` | Left icon nav controlling the contextual panel | [components/side-rail.tsx](../web/src/components/side-rail.tsx) |
| `<ContextualPanel>` | Wrapper that swaps between Instruments / Settings / Calendar | [components/contextual-panel.tsx](../web/src/components/contextual-panel.tsx) |
| `<InstrumentsPanel>` | Watchlist with search, favorites, bid/ask | [components/instruments-panel.tsx](../web/src/components/instruments-panel.tsx) |
| `<SettingsPanel>` | Toggle groups: chart visibility / sounds / order mode / price source | [components/settings-panel.tsx](../web/src/components/settings-panel.tsx) |
| `<ChartPanel>` | Candles + volume + position lines + toolbar + timeframe strip | [components/chart-panel.tsx](../web/src/components/chart-panel.tsx) |
| `<TickerIcon>` | Brand silhouette via `react-icons/si` or letter fallback | [components/ticker-icon.tsx](../web/src/components/ticker-icon.tsx) |
| `<OrderPanel>` *(TBD)* | Sell/Buy quote split + Mkt/Pending tabs + form + Confirm | `components/order-panel.tsx` |
| `<PositionsPanel>` *(TBD)* | Bottom table: Open / Pending / Closed | `components/positions-panel.tsx` |
| `<StatusBar>` *(TBD)* | Bottom strip: Balance / Buying power / Day P/L / Total P/L | `components/status-bar.tsx` |

---

## State & data flow

### Mock data — single source of truth
[`web/src/lib/mock-data.ts`](../web/src/lib/mock-data.ts) exports:
- `WATCHLIST`: 13 equities with bid/ask/last/change/volume/signal
- `OPEN_TABS`, `ACTIVE_SYMBOL`: instrument tabs and the focused one
- `ACCOUNT`: balance / buying power / cash / day P/L / total P/L / margin used
- `POSITIONS`: open positions (entry, current, TP, SL, P/L, position id)
- `PENDING_ORDERS`: pending limit/stop orders (currently empty)
- `CANDLES`: per-symbol OHLC + volume arrays (180 candles, deterministic random walk)
- `SENTIMENT`: per-symbol buy/sell %
- helpers: `getInstrument(symbol)`, `hasOpenPosition(symbol)`, `formatUsd(n, opts)`, `formatPct(n)`

### Settings → chart visibility
[`web/src/lib/settings-context.tsx`](../web/src/lib/settings-context.tsx) holds the user's display toggles in React Context. Components read via `useSettings()`.

**Position-line visibility rules** — the two toggles split by *marker type*, not by position state:

| Line | Shows when… |
|---|---|
| **Entry** (open position entry price) | an open position exists for the active symbol AND `Open positions` toggle is ON |
| **TP** marker | a `takeProfit` value exists (on a position OR a pending order) AND `TP / SL / Stop / Limit` toggle is ON |
| **SL** marker | a `stopLoss` value exists (on a position OR a pending order) AND `TP / SL / Stop / Limit` toggle is ON |
| **Pending order trigger line** (Buy/Sell Limit, Stop) | a pending order exists AND `TP / SL / Stop / Limit` toggle is ON |

So `Open positions` ONLY hides Entry lines. `TP / SL / Stop / Limit` hides all four named marker types — TP, SL, Limit, Stop — regardless of whether they belong to an open position or a pending order.

Other flags (`Signals`, `HMR periods`, `Price alerts`, `Economic calendar`) are reserved for future features — toggling them today doesn't change the chart.

### Active symbol
Currently a hardcoded constant (`ACTIVE_SYMBOL = "NVDA"`) in `mock-data.ts`. When tabs become clickable, it'll move to state in `page.tsx` and the active symbol will be read by HeaderBar (which tab is highlighted), ChartPanel (which candles to draw), OrderPanel (which instrument to trade), InstrumentsPanel (which row is highlighted).

---

## Design tokens

Source of truth: `web/src/app/globals.css` `@theme` block. Spec lives in `design/design.md` Section A.

Key brand decisions baked in:
- `--accent` / `--buy` = `#C8FF00` (Robinhood chartreuse) — used for primary CTAs, up candles, buy side
- `--sell` = `#E84545` (coral red) — sell side, down candles, destructive actions
- Backgrounds step from darkest (`--bg`) → lightest (`--surface-3`) for depth without explicit borders
- `--font-mono` = JetBrains Mono — used for ALL prices/numerics with `tabular-nums` for alignment

The chart reads tokens from CSS variables at runtime via `getComputedStyle`, so token edits in `globals.css` propagate to the chart automatically.

---

## File structure

```
trading-platform/
├── CLAUDE.md                    # Project rules (Claude reads this first)
├── design/
│   ├── design.md                # Styleguide source of truth
│   └── tokens-preview.html      # Standalone visual token reference
├── docs/
│   ├── plan.md                  # Implementation plan, kept in sync with progress
│   └── knowledge.md             # ← this file
└── web/
    └── src/
        ├── app/
        │   ├── page.tsx          # Main terminal route
        │   ├── wireframe/page.tsx # Grayscale text wireframe (visit /wireframe)
        │   ├── layout.tsx        # Root layout, fonts, metadata
        │   └── globals.css       # @theme tokens + shadcn aliases
        ├── components/
        │   ├── ui/               # shadcn primitives (button, switch, table, …)
        │   ├── header-bar.tsx
        │   ├── side-rail.tsx
        │   ├── contextual-panel.tsx
        │   ├── instruments-panel.tsx
        │   ├── settings-panel.tsx
        │   ├── chart-panel.tsx
        │   └── ticker-icon.tsx
        └── lib/
            ├── mock-data.ts          # Watchlist, candles, positions, account
            ├── settings-context.tsx  # User toggles (chart flags, sounds, …)
            └── utils.ts              # cn() class-merge helper
```

---

## Common workflows

### Add a new ticker to the watchlist
1. Append to `WATCHLIST` in [`mock-data.ts`](../web/src/lib/mock-data.ts)
2. *(optional)* Add a brand-icon entry in [`ticker-icon.tsx`](../web/src/components/ticker-icon.tsx) `TICKER_ICONS` map; otherwise it falls back to a colored letter chip
3. *(optional)* Add candle parameters in `CANDLE_PARAMS` to give it a chart

### Change a brand color
1. Edit value in `design/design.md` Section A
2. Update the matching `:root` variable in `web/src/app/globals.css`
3. *(eventually)* push to Figma Variables via MCP
4. Refresh — the chart picks up the new color too (it reads via `getComputedStyle`)

### Add a new chart-display toggle
1. Add to `CHART_TOGGLES` in [`settings-panel.tsx`](../web/src/components/settings-panel.tsx)
2. Add the corresponding flag to the type + defaults in [`settings-context.tsx`](../web/src/lib/settings-context.tsx)
3. Read it via `useSettings()` wherever it gates behavior

### Resize a panel default
Edit `defaultSize` / `minSize` / `maxSize` props (always strings with `%`) on the relevant `<ResizablePanel>` in `page.tsx`. **v4 quirk:** numeric values are interpreted as pixels, not percentages.

### Add a new shadcn primitive
`cd web && npx shadcn@latest add <component> --yes`. Component lands in `web/src/components/ui/`.

---

## Conventions

- **All numerics** use `font-mono` + `tabular-nums` for alignment (prices, P/L, volume)
- **Positive/negative** always carry `▲` / `▼` prefixes alongside color (a11y: never color alone)
- **Color semantics** — chartreuse = up/buy/positive, coral = down/sell/negative, cyan = neutral info, amber = warning/working state
- **Components are server-side by default**; only mark `"use client"` when state, refs, or browser-only APIs are needed
- **State location** — UI state (which tab is active) lives in `page.tsx`; cross-cutting state (settings, eventually account) lives in a Context under `lib/`
- **Mock data flows in one direction** — components import from `mock-data.ts`, never mutate it
