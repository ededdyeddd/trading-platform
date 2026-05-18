# Trading terminal prototype — base setup plan

## Context

We're building a **base trading terminal prototype** to use as a starting point for user testing. The "base" is intentionally minimal:

- **Structure source**: screenshots from an existing trading platform — we copy its screen layout/anatomy
- **Visual style source**: screenshots from a different product — we apply its colors, typography, spacing
- **Two artifacts in sync**: a web prototype (Next.js) and a Figma file (layouts + design tokens)

After the base exists, the user iterates on it: edits Figma → syncs tokens/layouts back into the web prototype → tests with users. So the goal of this plan is to land the smallest base that supports that loop, not to ship a full platform.

**Decisions already made:**
- Scope: **single main terminal screen** (chart + order book + order entry + positions/portfolio)
- Stack: **Next.js + React + Tailwind**
- Figma flow: **Claude generates via MCP, user edits, Claude reads changes back**
- Style sources received: **Robinhood Legends** (3 screenshots) + **Revolut** (1 composite screenshot) — both treated as style references; Robinhood also informs structure when we get to step 4
- Structure source: separate pass after the base is approved

## Approach

The visual system has **three artifacts in sync**, each with a single role:

1. **[design/design.md](../design/design.md)** — *human-readable styleguide.* Source of truth for the design language. Token table (name, value, usage rules) PLUS component patterns (panels, buttons, inputs, tables, tabs — borders, padding, type, color rules). Built from style screenshots.
2. **[web/src/app/globals.css](../web/src/app/globals.css)** — *machine-consumed CSS variables.* Tokens live in a Tailwind v4 `@theme` block (Tailwind v4 reads tokens from CSS, not `tailwind.config.ts`). Mirrors the token table from `design.md`.
3. **Figma file** — *visual artifact for editing.* Same token set defined as Figma Variables. Layouts are component frames mirroring the React components in code.

When the user edits tokens in Figma, Claude reads them back via the Figma MCP (`get_variable_defs`) and updates both `design.md` and `globals.css` — one command propagates to the web side. Layouts work the same way via `get_design_context`.

## Steps

### 1. Scaffold the Next.js app — [web/](../web/) ✅ DONE
- Next.js 16 + React 19 + Tailwind v4 + TypeScript + App Router + src/ layout
- `lightweight-charts` (TradingView's open-source chart lib — industry standard for trading UIs)
- `shadcn/ui` initialized; `button`, `input`, `tabs`, `table`, `card` primitives added in [web/src/components/ui/](../web/src/components/ui/)
- `lucide-react` for icons
- `npm run build` passes clean

### 2. Extract design language → [design/design.md](../design/design.md) ✅ DONE
Style screenshots received (Robinhood Legends × 3, Revolut × 1). Tokens and component patterns extracted into `design/design.md` with two sections:

**A. Tokens table** — for each token, three columns: name, value, usage rule. Covers color, typography, spacing, radius, elevation, motion.

**B. Component patterns** — visual specs for panel chrome, buttons (primary/sell/white/ghost/icon), inputs, select, tabs (pill/section/filter chips), tables, status badges, side indicator, charts, order book, modal, iconography.

`design/design.md` is the human-editable source of truth. Whenever it changes, `globals.css` and Figma Variables get regenerated from it.

### 3. Generate tokens from design.md → [web/src/app/globals.css](../web/src/app/globals.css) ✅ DONE
Tailwind v4 uses `@theme` blocks in CSS instead of `tailwind.config.ts`, so tokens live directly in `globals.css`:
- Every token from `design.md` Section A defined as a CSS custom property inside `@theme inline`, sourced from `:root` brand values
- Tailwind utilities auto-generated: `bg-bg`, `bg-surface`, `bg-surface-2`, `text-buy`, `text-sell`, `text-text-muted`, `bg-buy-soft`, `rounded-pill`, etc.
- shadcn aliases (`--primary`, `--card`, `--destructive`, `--ring`) re-pointed at brand tokens so existing shadcn primitives inherit our look automatically
- Spacing base set to `0.25rem` so `p-1` … `p-10` match design.md's 4px scale
- `body` styled with `--bg` + `--bg-glow` (radial cyan glow at top of viewport)
- Bonus deliverable: **[design/tokens-preview.html](../design/tokens-preview.html)** — standalone, no-server visual preview of every token (color swatches, type samples, spacing/radius/shadow scales, plus live component-pattern previews). Open directly in a browser.
- `npm run build` passes clean

### 4. Build the terminal layout — Exness structure × Robinhood style × equities data

**Structure source confirmed:** Exness MetaTrader-style terminal (analyzed in conversation). **Hybrid mode:** Exness's panel arrangement, with equities vocabulary and mock data (AAPL/NVDA/AMZN bid-ask, no forex pips/lots/leverage emphasis). **Drawing-tools sidebar omitted** for the prototype. **Settings panel included** as a switchable rail option.

**Layout — 7 zones, composed in [web/src/app/page.tsx](../web/src/app/page.tsx) via CSS Grid:**

```
┌── HeaderBar ─────────────────────────────────────────────────┐
├──┬─────────────┬──────────────────────────────┬──────────────┤
│Si│ Contextual  │ ChartPanel                   │ OrderPanel   │
│de│ Panel       │  (toolbar + canvas + lines)  │  (Sell/Buy   │
│Ra│ (Instr or   │                              │   split,     │
│il│  Settings)  │                              │   Mkt/Pend,  │
│  │             │                              │   form)      │
│  ├─────────────┴──────────────────────────────┤              │
│  │ PositionsPanel (collapsible)               │              │
├──┴────────────────────────────────────────────┴──────────────┤
└── StatusBar ────────────────────────────────────────────────┘
```

**Pre-step (validation): grayscale text wireframe** ✅ DONE — preserved at [web/src/app/wireframe/page.tsx](../web/src/app/wireframe/page.tsx) (visit `/wireframe` for reference while iterating)

**Pre-step (resize shell): replace fixed CSS grid with resizable panels** ✅ DONE — `react-resizable-panels` v4 via shadcn `<ResizablePanelGroup>` / `<ResizablePanel>` / `<ResizableHandle>`. Layout: outer horizontal (Context | Middle | Order); inner vertical (Chart / Positions). SideRail stays at fixed 48px outside the panel group. Header and Status remain full-width fixed-height. Drag handles use `bg-border` token. (Layout persistence via v4's `useDefaultLayout` hook deferred — sizes reset on refresh for now.)

**Components to build (top→bottom, left→right):**

1. **`<HeaderBar>`** — [web/src/components/header-bar.tsx](../web/src/components/header-bar.tsx) ✅ DONE
   - Logo · multi-instrument tabs (AAPL, NVDA, AMZN, +) with active state and red-bar position indicator · `Demo · $9,605.17 ▾` account selector · notification/alarm/apps/avatar icons · Deposit pill CTA
2. **`<SideRail>`** — [web/src/components/side-rail.tsx](../web/src/components/side-rail.tsx) ✅ DONE
   - Vertical icon column inside the fixed 48px aside: Instruments / Calendar / Settings. Active icon highlighted with `--color-surface-2` bg + 2px `--color-accent` left strip. Click swaps the contextual panel content via `activeRailPanel` state in `page.tsx`.
3. **`<ContextualPanel>`** wrapper — [web/src/components/contextual-panel.tsx](../web/src/components/contextual-panel.tsx) ✅ DONE — header shows panel title + close affordance, body is a vertical-scrolling region that renders one of:
   - **`<InstrumentsPanel>`** — [web/src/components/instruments-panel.tsx](../web/src/components/instruments-panel.tsx) ✅ DONE — sticky search input (controlled, with X-clear) · category dropdown (Favorites / Most traded / Top movers / Majors / Metals / Crypto / Indices / Stocks / Energy / Exotic / Minors / All) · column headers (Symbol / Signal / Bid / Ask) · filtered list from `WATCHLIST` via `filterInstruments(items, category, query, favorites)`. Each row leads with a star toggle (filled `--warning` amber when favorite, outline otherwise) wired to `useFavorites().toggle` and subscribes to `useQuote(symbol)` so bid/ask/signal update on the 5s tick. Per-instrument `precision` drives bid/ask decimal places (forex 5dp, JPY/metals 3dp, crypto/equities 2dp, etc.). Empty state when no match. **Active-instrument row** (the symbol whose chart is currently shown, i.e. `ACTIVE_SYMBOL`) gets `bg-surface-2` plus a 2px `--accent` strip on its left edge — same visual vocabulary as the side-rail's active icon and the header's active tab.
   - **`<SettingsPanel>`** — [web/src/components/settings-panel.tsx](../web/src/components/settings-panel.tsx) ✅ DONE — toggle groups: Show on chart (Signals / HMR / Price alerts / Open positions / TP-SL / Economic calendar with nested checkboxes for impact levels), Sound effects (with `?` help icon), Open order mode dropdown, Price source dropdown. Uses shadcn `<Switch>` and `<Checkbox>` primitives.
   - Calendar variant — placeholder copy for now.
4. **`<ChartPanel>`** — [web/src/components/chart-panel.tsx](../web/src/components/chart-panel.tsx) ✅ DONE
   - Top toolbar: timeframe (`1m`) · trend · `fx Indicators` · layout · undo/redo · Save ▾ · screenshot · brand-tinted P/L tag (chartreuse if positive, coral if negative) · fullscreen
   - `lightweight-charts` v5 candlestick canvas with chartreuse up/coral down candles, dotted grid in `--border`, dashed crosshair
   - Volume `HistogramSeries` in a second pane (~18% height) with side-tinted bars
   - **Position lines** via `createPriceLine`: entry (`--info` dashed), TP (`--buy` dashed), SL (`--sell` dashed), with axis labels
   - Tokens read from CSS vars at runtime so chart stays in sync with `globals.css` / `design.md`
   - `ResizeObserver` keeps chart sized to its container as panels resize
   - Bottom strip: 5y/1y/6m/3m/1m (active) /5d/1d buttons · calendar icon · live UTC clock · auto toggle
   - Drawing tools sidebar omitted (per user)
5. **`<OrderPanel>`** — [web/src/components/order-panel.tsx](../web/src/components/order-panel.tsx) ✅ DONE
   - Header: ticker icon + symbol + name + close ✕
   - Order-mode dropdown ("Regular form" — visual only)
   - **`<SellBuyQuoteSplit>`** — [web/src/components/sell-buy-quote.tsx](../web/src/components/sell-buy-quote.tsx) — two cards side-by-side. Idle: side-tinted soft bg (`--sell-soft` / `--buy-soft`). Active: solid (`--sell` / `--accent`). Price uses last-2-digits-enlarged pattern. Spread chip overlapping the seam.
   - **`<SentimentBar>`** — [web/src/components/sentiment-bar.tsx](../web/src/components/sentiment-bar.tsx) — 6px split bar with `--sell` / `--buy` segments and mono percentages on each side
   - Tabs: Market | Pending — switches the form
   - Form: Volume (shares, ± steppers) · Take Profit · Stop Loss · (Pending mode adds Open price + Limit/Stop selector at top). All inputs: `font-mono`, surface-2 bg, accent border on focus, ± steppers with sensible default increments
   - Sticky footer: Confirm CTA (chartreuse if buy, coral if sell) with dynamic label `Buy NVDA · 1 Share` / `Confirm Sell Limit · 1 Share` etc., Cancel ghost, Fees / Margin used / Buying power breakdown, More ▾
6. **`<PositionsPanel>`** — [web/src/components/positions-panel.tsx](../web/src/components/positions-panel.tsx) ✅ DONE
   - Tabs: Open (N) | Pending | Closed with count badges (active tab gets chartreuse-fg badge); right side: filter, group, more icon buttons
   - Open table (CSS grid for column alignment): Symbol with TickerIcon · Type (Buy/Sell colored) · Volume · Open price (editable dashed underline) · Current · T/P (editable) · S/L (editable) · Position id · P/L USD (colored by sign) · Edit/X actions
   - Pending and Closed render empty states for now (`PENDING_ORDERS` / closed orders not in mock data yet)
7. **`<StatusBar>`** — [web/src/components/status-bar.tsx](../web/src/components/status-bar.tsx) ✅ DONE
   - Account stats: Balance · Buying power · Cash · Day P/L (coral, since mock is negative) · Total P/L (chartreuse) · Margin used. Each is `label: value` with mono value
   - Right side: `Close all ▾` ghost button + 4-bar signal indicator

**Mock data — [web/src/lib/mock-data.ts](../web/src/lib/mock-data.ts):** ✅ DONE
- Multi-asset catalog (~50 instruments) tagged with `category` ∈ `stocks | majors | minors | exotic | metals | crypto | indices | energy` and a `favorite` flag. Coverage:
  - **Stocks** (13, original Robinhood-style set): AAPL, AMC, AMD, AMZN, DIS, F, GOOGL, KO, META, MSFT, NFLX, NVDA, TSLA
  - **Majors / Minors / Exotic** forex pairs (EUR/USD, GBP/USD, USD/JPY, …, EUR/JPY, EUR/AUD, …, USD/TRY, EUR/PLN, …)
  - **Metals** (XAU, XAG, XPT, XPD / USD), **Crypto** (BTC, ETH, SOL, XRP, DOGE, ADA / USD), **Indices** (SPX500, NAS100, US30, GER40, UK100, JP225, HK50), **Energy** (WTI, BRENT, NGAS)
- Per-instrument `precision` field — bid/ask formatted with the right decimal places per asset class
- `CategoryFilter` union + `CATEGORY_OPTIONS` + `filterInstruments(items, category, query)` helper (sorts derive Most Traded by volume, Top Movers by |changePct|; rest match `category`; then substring-match on symbol/name)
- Deterministic seeded random-walk candle generator → `CANDLES` for AAPL/NVDA/AMZN (180 candles each, 1m intervals)
- Empty default state: no open positions, no pending orders, fresh-deposit account, sentiment % for AAPL/NVDA/AMZN
- Helpers: `getInstrument`, `hasOpenPosition`, `formatUsd`, `formatPct`, `filterInstruments`
- **Note:** the order panel / chart / positions still operate on `ACTIVE_SYMBOL = "NVDA"` (equities-only flow). The forex/crypto/etc. catalog is currently surfaced only via the InstrumentsPanel list — selecting a non-equity row doesn't yet swap the active instrument elsewhere.

**State (kept simple, in `page.tsx`):**
- `activeInstrument` (string symbol)
- `activeRailPanel` ("instruments" | "calendar" | "settings")
- `positionsPanelCollapsed` (boolean)
- `orderTab` ("market" | "pending")
- `orderSide` ("buy" | "sell" — set when user clicks Buy/Sell quote)

**Favorites — [web/src/lib/favorites-context.tsx](../web/src/lib/favorites-context.tsx):** ✅ DONE
- `<FavoritesProvider>` mounted in `page.tsx` holds a mutable `Set<string>` of starred symbols, seeded from `WATCHLIST[i].favorite`
- Hook `useFavorites()` exposes `{ favorites, isFavorite, toggle }`. State is in-memory only (resets on refresh, same precedent as panel sizes)
- `filterInstruments` takes the set as its fourth arg so the "Favorites" category filter reflects live toggles immediately

**Live quotes — [web/src/lib/quotes-context.tsx](../web/src/lib/quotes-context.tsx):** ✅ DONE
- **`TICK_INTERVAL_MS = 5_000` is the canonical heartbeat for the whole terminal** — any future mock-data block that simulates live motion (chart last candle, sentiment drift, account P/L, etc.) should `import { TICK_INTERVAL_MS } from "@/lib/quotes-context"` rather than define its own interval. One cadence keeps panels in sync.
- `<QuotesProvider>` mounted in `page.tsx` (inside `SettingsProvider`) holds a `Record<symbol, {bid, ask, signal}>` keyed off `WATCHLIST`
- A `setInterval` ticks every `TICK_INTERVAL_MS`, nudging each symbol's bid by a small random walk (~3 bps of mid-price). Spread is held constant; `signal` reflects the latest tick direction
- Hooks: `useQuote(symbol)` for a single row, `useQuotes()` for the whole map
- Consumers wired: InstrumentsPanel rows (all 50+ symbols) and OrderPanel's NVDA quote → `SellBuyQuoteSplit` + TP/SL/open-price defaults
- **Future**: ChartPanel will read `useQuote(ACTIVE_SYMBOL)` to update the latest candle's close on each tick (deferred — not wired yet)

### 5. Create the Figma file via MCP
Using `mcp__claude_ai_Figma__create_new_file`:
- Single page named "Trading Terminal — Base"
- A frame for the desktop terminal screen (1440×900) matching the four-pane grid in code
- Define all design tokens from `design.md` as **Figma Variables** (Color, Number, String collections) so they show up in the Figma UI for editing
- Add lightweight component instances for each panel (header, chart placeholder, order book rows, etc.) so the structure is editable, not flattened

Save the resulting Figma URL into [docs/figma.md](figma.md) for future reference.

### 6. Document the sync workflow — [docs/sync.md](sync.md)
A short doc with the canonical commands:
- **"Pull tokens from Figma"** → Claude calls `get_variable_defs`, diffs against `design.md`, updates both `design.md` and `globals.css`
- **"Pull layout from Figma"** → Claude calls `get_design_context` on the terminal frame, updates the relevant React component(s)
- **"Push tokens to Figma"** → after editing `design.md`, Claude updates Figma Variables to match
- **Structure-source screenshots arrive** → Claude updates the four-pane layout to match the reference platform's anatomy, in both web and Figma

### 7. Apply structure screenshots (separate pass)
After the base is approved, when structure-source screenshots arrive:
- Update the four panels' anatomy (sub-tabs, table columns, ordering, headers) to match the reference platform
- Same change propagates to Figma frames via the sync workflow

## Critical files to be created or modified

- **[design/design.md](../design/design.md)** ✅ created — styleguide source of truth (step 2)
- **[web/src/app/globals.css](../web/src/app/globals.css)** ✅ updated — `@theme` token block + shadcn alias mapping (step 3)
- **[design/tokens-preview.html](../design/tokens-preview.html)** ✅ created — standalone visual preview of all tokens (step 3 bonus)
- [web/src/app/page.tsx](../web/src/app/page.tsx) — compose 7-zone CSS-grid layout
- [web/src/components/header-bar.tsx](../web/src/components/header-bar.tsx)
- [web/src/components/side-rail.tsx](../web/src/components/side-rail.tsx)
- [web/src/components/contextual-panel.tsx](../web/src/components/contextual-panel.tsx)
- [web/src/components/instruments-panel.tsx](../web/src/components/instruments-panel.tsx)
- [web/src/components/settings-panel.tsx](../web/src/components/settings-panel.tsx)
- [web/src/components/chart-panel.tsx](../web/src/components/chart-panel.tsx)
- [web/src/components/order-panel.tsx](../web/src/components/order-panel.tsx)
- [web/src/components/sell-buy-quote.tsx](../web/src/components/sell-buy-quote.tsx)
- [web/src/components/sentiment-bar.tsx](../web/src/components/sentiment-bar.tsx)
- [web/src/components/positions-panel.tsx](../web/src/components/positions-panel.tsx)
- [web/src/components/status-bar.tsx](../web/src/components/status-bar.tsx)
- [web/src/lib/mock-data.ts](../web/src/lib/mock-data.ts)
- [web/src/lib/quotes-context.tsx](../web/src/lib/quotes-context.tsx) — `QuotesProvider` + `useQuote` hook (5s tick)
- [web/src/lib/favorites-context.tsx](../web/src/lib/favorites-context.tsx) — `FavoritesProvider` + `useFavorites` hook (in-memory star toggle)
- [docs/figma.md](figma.md), [docs/sync.md](sync.md)
- New Figma file via MCP

**Removed from the previous plan** (Robinhood-only structure):
- ~~`order-book-panel.tsx`~~ — Exness/forex has no order book; replaced by `<SellBuyQuoteSplit>` + `<SentimentBar>`
- ~~`order-entry-panel.tsx`~~ — replaced by the richer `<OrderPanel>` (with Mkt/Pending tabs, confirm flow)

## Verification

For step 2+3 (design tokens):
1. `design/design.md` exists with token table and component patterns derived from the screenshots ✅
2. Every token in `design.md` has a matching CSS variable in `globals.css` `@theme` block
3. `cd web && npm run build` passes; `npm run dev` shows shadcn `<Button>` rendering with the new tokens (a visible smoke test)

For the full base:
1. `cd web && npm run dev` → terminal screen renders at localhost:3000 with all four panels visible, mock data populated, chart drawing in the new style
2. Open the Figma URL → terminal frame visible, four panel placeholders match the web layout, Variables panel shows all tokens from `design.md`
3. Edit a color variable in Figma (e.g. `--color-accent` to red) → ask Claude to "pull tokens from Figma" → reload localhost:3000 → accent color updated; `design.md` updated
4. `npm run build` succeeds with no type errors
