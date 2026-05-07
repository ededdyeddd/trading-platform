# Design language — Trading Terminal Base

Source of truth for the visual design of the prototype. Derived from style references and feeds:
- [web/src/app/globals.css](../web/src/app/globals.css) — Tailwind v4 reads tokens from the `@theme` block here
- The Figma file Variables (mirrored from Section A)

When this file changes, both the web theme and Figma Variables get regenerated.

## References

- **Robinhood Legends** desktop terminal (3 screenshots) — primary source for color, density, chart treatment, table styling, modal patterns
- **Revolut** mobile app (1 composite screenshot, 3 screens) — secondary source for radius, pill components, soft cards, white CTA, gradient backgrounds

**Synthesis:** Robinhood's data density + chartreuse accent + mono numerics, blended with Revolut's rounded softness, pill chips, and subtle teal-glow background.

---

## A. Tokens

### Color

| Token | Value | Source | Where to use |
|---|---|---|---|
| `--color-bg` | `#0A1418` | Robinhood | App background |
| `--color-bg-glow` | `radial-gradient(ellipse at 50% -20%, rgba(91, 192, 235, 0.08), transparent 60%)` | Both | Subtle teal glow at top of viewport |
| `--color-surface` | `#0F1A1F` | Robinhood | Panel background (one step lighter than bg) |
| `--color-surface-2` | `#172226` | Robinhood | Hover, selected row, input bg |
| `--color-surface-3` | `#1F2C32` | Both | Modal bg, elevated cards |
| `--color-border` | `#1F2A30` | Robinhood | Subtle panel separators |
| `--color-border-strong` | `#2A3A42` | — | Input borders, emphasized dividers |
| `--color-text` | `#FFFFFF` | Both | Primary text (symbols, prices, titles) |
| `--color-text-muted` | `#7C8B95` | Robinhood | Column headers, secondary labels |
| `--color-text-subtle` | `#5A6770` | Both | Tertiary text, axis labels, placeholders |
| `--color-accent` | `#C8FF00` | Robinhood | Primary CTAs (Buy), active pills, chart up |
| `--color-accent-hover` | `#B8EF00` | — | Hover on accent surfaces |
| `--color-accent-fg` | `#0A1418` | — | Text on accent surfaces |
| `--color-buy` | `#C8FF00` | Robinhood | Up candles, buy side, positive change |
| `--color-buy-soft` | `rgba(200, 255, 0, 0.12)` | — | Filled status badge, depth bar (bids) |
| `--color-sell` | `#E84545` | Robinhood | Down candles, sell side, negative change |
| `--color-sell-soft` | `rgba(232, 69, 69, 0.12)` | — | Canceled status badge, depth bar (asks) |
| `--color-warning` | `#FFB347` | — | Working status, alerts |
| `--color-warning-soft` | `rgba(255, 179, 71, 0.12)` | — | Working status badge bg |
| `--color-info` | `#5BC0EB` | Revolut | Info icons, link text |
| `--color-selection` | `rgba(200, 255, 0, 0.06)` | Robinhood | Selected table row tint over surface-2 |

### Typography

**Families** — Inter is the closest open-source approximation of Robinhood's GT-America-like sans and Revolut's Aeonik. JetBrains Mono mirrors the chart-axis mono in Robinhood.

| Token | Value |
|---|---|
| `--font-sans` | `"Inter", system-ui, -apple-system, "Segoe UI", sans-serif` |
| `--font-mono` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` |

**Sizes** (rem, root 16px):

| Token | Value (px) | Where to use |
|---|---|---|
| `--text-xs` | `0.6875rem` (11) | Chart axis, tiny labels, status badges |
| `--text-sm` | `0.8125rem` (13) | Table rows, column headers |
| `--text-base` | `0.875rem` (14) | Default body, panel content |
| `--text-md` | `1rem` (16) | Panel headers, primary buttons |
| `--text-lg` | `1.125rem` (18) | Section headers |
| `--text-xl` | `1.5rem` (24) | Page titles |
| `--text-2xl` | `2rem` (32) | Account value, hero numerics |

**Weights:**

| Token | Value | Where to use |
|---|---|---|
| `--font-weight-regular` | `400` | Body text |
| `--font-weight-medium` | `500` | Buttons, emphasized cells |
| `--font-weight-semibold` | `600` | Panel headers, symbols, key numbers |
| `--font-weight-bold` | `700` | Hero text |

**Line heights:**

| Token | Value | Where to use |
|---|---|---|
| `--leading-tight` | `1.2` | Hero numerics, headlines |
| `--leading-normal` | `1.4` | Default body |
| `--leading-loose` | `1.6` | Long-form |

### Spacing (4px scale)

| Token | Value | Where to use |
|---|---|---|
| `--space-1` | `4px` | Tight inline gaps |
| `--space-2` | `8px` | Default gap |
| `--space-3` | `12px` | Compact padding |
| `--space-4` | `16px` | Default panel padding |
| `--space-5` | `20px` | Comfortable panel padding |
| `--space-6` | `24px` | Section gap |
| `--space-8` | `32px` | Major section gap |
| `--space-10` | `40px` | Page-level gaps |

### Radius

| Token | Value | Where to use |
|---|---|---|
| `--radius-sm` | `4px` | Small badges, tight corners |
| `--radius-md` | `8px` | Inputs, dropdowns, square buttons |
| `--radius-lg` | `12px` | Cards, panels |
| `--radius-xl` | `16px` | Modal containers |
| `--radius-pill` | `9999px` | Pill buttons, status badges, filter chips |

### Elevation

Robinhood is largely flat (depth via surface lightness); Revolut uses a single soft shadow on cards. Modals carry the heaviest shadow.

| Token | Value | Where to use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Subtle button lift |
| `--shadow-md` | `0 8px 24px rgba(0, 0, 0, 0.4)` | Modals, popovers, dropdowns |
| `--shadow-lg` | `0 24px 48px rgba(0, 0, 0, 0.5)` | Lifted dialogs |

### Motion

| Token | Value | Where to use |
|---|---|---|
| `--duration-fast` | `100ms` | Hover transitions |
| `--duration-base` | `150ms` | Default transitions |
| `--duration-slow` | `250ms` | Modal open, panel slide |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default easing |

---

## B. Component patterns

### App background
- Base: `--color-bg`
- Subtle radial glow at top of viewport (cyan/teal, 8% opacity, fades within ~600px) using `--color-bg-glow`. Both Robinhood and Revolut use this.

### Panel chrome
- Background: `--color-surface`
- No visible border by default — depth comes from the surface step
- Radius: `--radius-lg` (12px)
- Padding: `--space-4` (16px) default, `--space-5` (20px) for comfortable
- **Header row**: panel title (`--text-md`, `semibold`, `--color-text`) on left, action icons (filter/more) on right. Header has `--space-3` bottom padding; optional `--color-border` divider when content below is dense.
- Empty state: muted text centered, `--color-text-muted`

### Buttons
**Primary CTA (Buy / main accent)**
- BG: `--color-accent` (chartreuse)
- Text: `--color-accent-fg` (near-black), `--font-weight-medium`, `--text-base`
- Padding: `--space-2` `--space-4`
- Radius: `--radius-pill`
- Hover: BG `--color-accent-hover`

**Sell**
- Default: BG `--color-surface-2`, text `--color-sell`
- Emphasized: BG `--color-sell`, text `--color-text`
- Same padding/radius as primary

**White CTA** (Revolut-style top-level action)
- BG: `--color-text` (white)
- Text: `--color-bg`
- Used for hero actions like "Trade"

**Ghost**
- BG: transparent
- Text: `--color-text` or `--color-text-muted`
- Hover: BG `--color-surface-2`

**Icon button**
- Circular, 32px diameter (28px in dense toolbars)
- BG: `--color-surface-2` (or transparent in inline contexts)
- Hover: `--color-surface-3`
- Icon size: 16px (or 20px for primary toolbar)

### Inputs (text + number)
- BG: `--color-surface-2`
- Border: 1px solid transparent (no default border); on focus, border becomes `--color-accent`
- Padding: `--space-2` `--space-3`
- Radius: `--radius-md`
- Font: `--font-mono` for numbers, `--font-sans` for text
- **Number stepper**: `+` and `−` icon buttons stacked or side-by-side on the right edge — Robinhood Buy modal pattern
- Helper text: below input, `--text-xs`, `--color-text-muted`

### Select / dropdown
- Same chrome as input, with `chevron-down` (16px, `--color-text-muted`) on the right
- Open menu: `--color-surface-3`, `--radius-md`, `--shadow-md`, items with `--space-2` `--space-3` padding, hover `--color-surface-2`

### Tabs
**Pill tabs** (Buy/Sell in modal, time-frame selectors)
- Container: `--color-surface-2`, `--radius-pill`, padding 2px around tabs
- Active tab: BG `--color-accent` (Buy variant) or `--color-sell` (Sell variant), text high-contrast
- Inactive tab: transparent, text `--color-text-muted`

**Section tabs** (Calls/Puts, top nav)
- Text-only, `--text-base`, `--font-weight-medium`
- Active: `--color-text`, optional 2px bottom indicator in `--color-accent`
- Inactive: `--color-text-muted`

**Filter chips** (Revolut "Stocks / ETF / Bonds")
- BG: `--color-surface-2`, `--radius-pill`, padding `--space-1` `--space-3`
- Text: `--color-text`, `--text-sm`
- Active: BG `--color-surface-3` with `--color-accent` icon, or accent border

### Tables
- **Header row**: `--text-sm`, `medium`, `--color-text-muted`, no background, padding `--space-2` `--space-3`
- **Body row** height: 32–36px
- No horizontal dividers by default; on dense tables, use `--color-border` at 50% opacity
- **Symbol column**: `--color-text`, `semibold`, sans
- **Numeric columns**: `--font-mono`, right-aligned, tabular figures
- **Positive change cells**: prefix `▲`, color `--color-buy`
- **Negative change cells**: prefix `▼`, color `--color-sell`
- **Hover row**: BG `--color-surface-2`
- **Selected row**: BG `--color-surface-2` overlaid with `--color-selection` (subtle accent tint, matches the selected NVDA row in Robinhood)

### Status badges
- Padding: `2px` `--space-2`
- Radius: `--radius-sm` (Robinhood square style) or `--radius-pill` (softer Revolut style)
- Font: `--text-xs`, `medium`
- Variants:
  - **Working**: BG `--color-warning-soft`, text `--color-warning` — or outlined neutral with `--color-text-muted`
  - **Filled**: BG `--color-buy-soft`, text `--color-buy`
  - **Canceled**: BG `--color-sell-soft`, text `--color-sell`

### Side indicator (Buy / Sell column)
- Text-only, `--font-weight-medium`
- Buy: `--color-buy`
- Sell: `--color-sell`

### Charts (lightweight-charts config)
- Container BG: transparent (sits on `--color-surface`)
- **Up candle**: `--color-buy` (`#C8FF00`)
- **Down candle**: `--color-sell` (`#E84545`)
- **Wick**: same as candle body
- **Volume bars**: same colors at 60% opacity, separate pane below price
- **Grid**: `--color-border` at 30% opacity, or hidden
- **Crosshair**: dashed `--color-text-muted`, 1px
- **Axis labels**: `--font-mono`, `--text-xs`, `--color-text-muted`
- **Last price line**: `--color-accent`, dashed, with price label box in `--color-accent` / `--color-accent-fg`
- **Selected timeframe** (1D/1W/etc.) at bottom: pill tabs

### Order book *(deprecated — Exness/forex structure has no order book; replaced by Sell/Buy quote split below)*
~~Two halves: bids on top in `--color-buy`, asks on bottom in `--color-sell`~~

---

## B′. Exness-derived patterns (terminal layout)

Patterns adopted from the Exness MetaTrader-style terminal as our **structure source**. Visuals re-styled with Robinhood/Revolut tokens above.

### Header bar
- Full-width row, height ~52px, BG `--color-surface`, no bottom border (depth from surface step)
- **Logo** on far left, `--space-4` gap
- **Instrument tabs** — flexible row:
  - Each tab: instrument icon (16px) + symbol (`--text-base`, `--font-weight-medium`)
  - Active tab: white text + 2px bottom indicator in `--color-accent`
  - Inactive: `--color-text-muted`
  - Active-position indicator: 3 short red bars trailing the symbol (`--color-sell`, `--text-xs`)
  - `+` button to add a tab (`--color-text-muted`, hover `--color-text`)
- **Account selector** (right of tabs, before icons): "Demo" badge + value in `--font-mono` + chevron-down
- **Icon group** (right side, before CTA): 24px icons in `--color-text-muted`, hover `--color-text`. Order: bell · alarm · apps-grid · avatar
- **Deposit CTA** on far right: pill button, `--color-warning` BG (or `--color-accent` for our brand), `--color-bg` text, `--font-weight-medium`

### Side rail
- 48px-wide vertical column, BG transparent over app bg
- 3 icon slots stacked at top, padding `--space-3` per slot
- Active icon: `--color-text`, optional 2px left accent strip in `--color-accent`
- Inactive: `--color-text-subtle`, hover `--color-text-muted`
- Acts as a controller — selection swaps the contextual panel content; doesn't navigate away

### Contextual panel (Instruments / Settings)
- Width ~240–280px, BG `--color-surface`, height matches the chart-area row
- Header: panel title in caps with letter-spacing (`--text-xs`, `--color-text-muted`, `tracking-wider`)
- **Instruments variant** body:
  - Search input (full pattern from "Inputs" above) with magnifier icon
  - "Favorites" collapsible row (chevron + label)
  - Symbol list — each row has: drag-handle (6 dots, `--color-text-subtle`) · ticker icon (16px) · symbol (`--text-sm`, `--font-weight-semibold`) · optional Signal arrow (▲ buy, ▼ sell) · Bid · Ask. Bid/Ask in `--font-mono`, right-aligned, with chip BG `--color-buy-soft` / `--color-sell-soft` per side.
  - Hover row: BG `--color-surface-2`
- **Settings variant** body:
  - Group header: caps, `--color-text-muted`, `--text-xs`, `tracking-wider`
  - Toggle row: label on left + `<Toggle>` on right, `--space-3` vertical padding, `--color-border` divider
  - Nested checkboxes for sub-options
  - Section "Sound effects" with `?` help icon next to header

### Toggle (switch)
- Track: 36px wide, 20px tall, `--radius-pill`, BG `--color-surface-2` (off) or `--color-accent` (on)
- Thumb: 16px circle, white, `--shadow-sm`, slides 16px on toggle
- Transition: `--duration-base` `--ease-default`

### Sell / Buy quote split (the order-panel hero)
- Two cards side-by-side, gap is occupied by a centered spread chip
- **Card** (each side):
  - Padding `--space-3` `--space-4`, `--radius-md`
  - Idle BG: dark surface tinted with side color — `Sell` on `--color-sell-soft` over `--color-surface-2`; `Buy` on `--color-buy-soft` over `--color-surface-2`. (When the user clicks to enter that side's flow, BG goes solid: `--color-sell` or `--color-accent`.)
  - Top-left small label: "Sell" / "Buy" — `--text-xs`, `--font-weight-medium`, `--color-sell` / `--color-buy` (idle) or `--color-text` (active)
  - Hero quote: large bid/ask price with **the last two digits enlarged** for fast scanning. Pattern: `1.17` (regular size, `--font-weight-semibold`) followed by `99` (1.6× larger, same weight). Use `--font-mono` and `font-feature-settings: 'tnum'`.
- **Spread chip** between the cards:
  - 24px circle (or short pill), BG `--color-surface-3`, `--text-xs` `--color-text-muted`, mono — shows the spread number (e.g. `0.8`)
  - Sits centered on the seam between the two cards, slightly overlapping

### Sentiment bar
- Thin (4px) horizontal split bar, full width, `--radius-pill`
- Left segment: `--color-sell` (sell %); Right segment: `--color-buy` (buy %)
- Percentages floated above each end, `--text-xs`, mono — sell % left-aligned in `--color-sell`, buy % right-aligned in `--color-buy`
- Used in the order panel between the Sell/Buy split and the form tabs

### Position lines on chart
Drawn via `lightweight-charts` `priceLine` API. Each open position contributes:
- A horizontal dashed line across the chart at the **entry price**, color `--color-info` (or `--color-text-muted` neutral)
- A solid line at the **TP** in `--color-buy`, dashed at **SL** in `--color-sell`
- **Floating chip** anchored to the price line, padding `2px --space-2`, `--radius-sm`, BG matches line color, text `--color-bg`. Format: `volume P/L` (e.g. `0.03  -0.75 USD ✕`). The ✕ closes the position.
- **Right-edge price tag**: rectangular badge sitting on the price axis, BG matches line color, `--font-mono` `--text-xs` `--color-bg`, with the exact price

### Status bar
- Full-width row at the bottom of the app, height 36px, BG `--color-surface`, top border `--color-border`
- Left side: account stats — each item is `label: value` with `--space-1` between, items separated by `--space-6`
  - Label: `--text-xs`, `--color-text-muted`, sans
  - Value: `--text-sm`, `--font-mono`, `--color-text` (or color-coded for P/L)
- Right side: `Close all ▾` ghost button + connection signal indicator (4 short bars, `--color-text-subtle` filled by signal strength)

### Modal
- Container: `--color-surface-3`, `--radius-xl`, `--shadow-md`
- Backdrop: `rgba(0, 0, 0, 0.5)`
- **Header**: title (e.g. "F $10.34") + close icon, padding `--space-4`, `--color-border` bottom divider
- **Body**: padding `--space-4`, form fields stacked with `--space-3` gap
- **Footer**: right-aligned action buttons, padding `--space-4`, optional top border `--color-border`. The Robinhood Buy modal pattern: Cancel (ghost) on the left of the action group, primary CTA on the right.

### Iconography
- Library: `lucide-react`
- Default stroke width: `1.5`
- Sizes: 14px (inline), 16px (default), 20px (primary toolbar), 24px (hero)
- Color: inherits from parent text color

---

## C. Tailwind cheat sheet

These are the utility classes generated by the `@theme` block in `globals.css`. Use them directly in JSX.

| Need... | Use... |
|---|---|
| App background | `bg-bg` |
| A panel | `bg-surface rounded-lg p-4` |
| A modal container | `bg-surface-3 rounded-xl shadow-md` |
| A primary CTA | `bg-accent text-accent-fg rounded-pill px-4 py-2 font-medium` |
| A buy/up number | `text-buy font-mono` |
| A sell/down number | `text-sell font-mono` |
| A muted column header | `text-text-muted text-sm` |
| A status pill (filled) | `bg-buy/10 text-buy text-xs px-2 py-0.5 rounded-pill` |
| Mono price | `font-mono tabular-nums` |

---

## D. Editing this file

- **Section A** values become CSS variables in `web/src/app/globals.css` (`@theme` block) and Figma Variables.
- **Section B** is human-readable guidance — not auto-translated, but informs every component decision.
- After edits to Section A, ask Claude: *"Sync tokens — design.md → web + Figma"*. Claude regenerates `globals.css` and updates Figma Variables to match.
- After edits to Section B, ask Claude: *"Apply pattern changes from design.md"*. Claude updates the affected components.
