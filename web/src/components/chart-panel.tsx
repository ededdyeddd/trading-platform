"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IPriceLine,
  type ISeriesApi,
  type SeriesOptionsMap,
} from "lightweight-charts";
import {
  AreaChart,
  BarChart3,
  Calendar,
  CandlestickChart,
  ChevronDown,
  LineChart,
  Maximize2,
  Redo2,
  Save,
  Undo2,
  X,
} from "lucide-react";
import {
  DEFAULT_CHART_TYPE,
  DEFAULT_TIMEFRAME,
  POSITIONS,
  PENDING_ORDERS,
  TIMEFRAMES,
  formatUsd,
  getInstrument,
  type Candle,
  type ChartType,
  type Timeframe,
} from "@/lib/mock-data";
import { useActiveInstrument } from "@/lib/active-instrument-context";
import { useChartCandles } from "@/lib/quotes-context";
import { useSettings } from "@/lib/settings-context";

export function ChartPanel() {
  const { activeSymbol } = useActiveInstrument();
  const [chartType, setChartType] = useState<ChartType>(DEFAULT_CHART_TYPE);
  const [timeframe, setTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME);
  const instrument = getInstrument(activeSymbol);
  const candles = useChartCandles(activeSymbol, timeframe);
  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const change =
    lastCandle && firstCandle ? lastCandle.close - firstCandle.open : 0;
  const changePct =
    lastCandle && firstCandle ? (change / firstCandle.open) * 100 : 0;
  const position = POSITIONS.find((p) => p.symbol === activeSymbol);

  return (
    <section className="flex h-full flex-col bg-surface">
      <ChartToolbar
        pnl={position?.pnl ?? null}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />
      <div className="relative flex-1 overflow-hidden">
        <ChartOverlay
          symbol={activeSymbol}
          name={instrument?.name ?? ""}
          timeframe={timeframe}
          ohlc={lastCandle}
          change={change}
          changePct={changePct}
        />
        {/* key includes everything that needs a full chart rebuild:
            switching symbol/timeframe/chart-type all swap the dataset
            or the series renderer, so remount is the cleanest path. */}
        <ChartCanvas
          key={`${activeSymbol}-${timeframe}-${chartType}`}
          symbol={activeSymbol}
          chartType={chartType}
          candles={candles}
        />
      </div>
      <TimeframeStrip value={timeframe} onChange={setTimeframe} />
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Toolbar
 * ─────────────────────────────────────────────────────────────────────*/

const CHART_TYPE_ICONS: Record<ChartType, React.ReactNode> = {
  candle: <CandlestickChart size={13} />,
  line: <LineChart size={13} />,
  area: <AreaChart size={13} />,
  bar: <BarChart3 size={13} />,
};

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  candle: "Candlestick",
  line: "Line",
  area: "Area",
  bar: "Bar",
};

const CHART_TYPES: ChartType[] = ["candle", "line", "area", "bar"];

function ChartToolbar({
  pnl,
  chartType,
  onChartTypeChange,
}: {
  pnl: number | null;
  chartType: ChartType;
  onChartTypeChange: (next: ChartType) => void;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border px-2">
      <ToolbarBtn
        icon={<span className="font-mono text-[11px] italic">fx</span>}
      />
      <ChartTypeMenu value={chartType} onChange={onChartTypeChange} />
      <ToolbarBtn icon={<Undo2 size={13} />} />
      <ToolbarBtn icon={<Redo2 size={13} />} />
      <div className="flex-1" />
      <ToolbarBtn icon={<Save size={13} />} label="Save" hasChevron />
      {pnl !== null && <PnlTag value={pnl} />}
      {/* Fullscreen — visual only for the prototype; hover still
          highlights so the affordance reads as a real button. */}
      <ToolbarBtn icon={<Maximize2 size={13} />} />
    </div>
  );
}

function ToolbarBtn({
  icon,
  label,
  hasChevron,
}: {
  icon?: React.ReactNode;
  label?: string;
  hasChevron?: boolean;
}) {
  return (
    <button className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] text-text-muted hover:bg-surface-2 hover:text-text">
      {icon}
      {label && <span>{label}</span>}
      {hasChevron && <ChevronDown size={11} className="text-text-subtle" />}
    </button>
  );
}

function ChartTypeMenu({
  value,
  onChange,
}: {
  value: ChartType;
  onChange: (next: ChartType) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, handleOutsideClick, handleKey]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Chart type: ${CHART_TYPE_LABELS[value]}`}
        className="flex h-7 items-center gap-1 rounded-md px-2 text-text-muted hover:bg-surface-2 hover:text-text"
      >
        {CHART_TYPE_ICONS[value]}
        <ChevronDown size={11} className="text-text-subtle" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-md border border-border bg-surface-2 py-1 shadow-lg"
        >
          {CHART_TYPES.map((type) => {
            const selected = type === value;
            return (
              <button
                key={type}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(type);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                  selected
                    ? "bg-surface-3 text-text"
                    : "text-text-muted hover:bg-surface-3 hover:text-text"
                }`}
              >
                {CHART_TYPE_ICONS[type]}
                <span>{CHART_TYPE_LABELS[type]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PnlTag({ value }: { value: number }) {
  const positive = value > 0;
  return (
    <button
      className={`flex h-7 items-center gap-1.5 rounded-md px-2 font-mono text-[11px] ${
        positive ? "bg-buy-soft text-buy" : "bg-sell-soft text-sell"
      }`}
    >
      <span>
        {positive ? "+" : "−"}
        {formatUsd(Math.abs(value)).replace("$", "$")}
      </span>
      <X size={11} className="opacity-70" />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Overlay (OHLC info on top-left of chart)
 * ─────────────────────────────────────────────────────────────────────*/

function ChartOverlay({
  symbol,
  name,
  timeframe,
  ohlc,
  change,
  changePct,
}: {
  symbol: string;
  name: string;
  timeframe: Timeframe;
  ohlc?: { open: number; high: number; low: number; close: number };
  change: number;
  changePct: number;
}) {
  if (!ohlc) return null;
  const positive = change >= 0;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-3 font-mono text-[11px]">
      <span className="font-sans font-semibold text-text">
        {symbol}{" "}
        <span className="font-normal text-text-muted">· {timeframe}</span>
      </span>
      <span className="text-text-muted">{name}</span>
      <span className="flex gap-2 text-text-muted">
        <span>O <span className="text-text">{ohlc.open.toFixed(2)}</span></span>
        <span>H <span className="text-text">{ohlc.high.toFixed(2)}</span></span>
        <span>L <span className="text-text">{ohlc.low.toFixed(2)}</span></span>
        <span>C <span className="text-text">{ohlc.close.toFixed(2)}</span></span>
      </span>
      <span className={positive ? "text-buy" : "text-sell"}>
        {positive ? "+" : "−"}
        {Math.abs(change).toFixed(2)} ({positive ? "+" : "−"}
        {Math.abs(changePct).toFixed(2)}%)
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Canvas — lightweight-charts integration.
 *
 * Series renderer (candle/bar/line/area) is picked by `chartType`. The
 * full ChartCanvas remounts on any of symbol/timeframe/chartType
 * changing (via `key` at the call site), so within one mount these are
 * effectively constants — no in-place series-swap code needed.
 * ─────────────────────────────────────────────────────────────────────*/

function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

type SeriesKind = "Candlestick" | "Bar" | "Line" | "Area";
type AnyPriceSeries = ISeriesApi<SeriesKind>;
type CandleSeriesType = keyof SeriesOptionsMap;

function buildOhlcPayload(c: Candle) {
  return { time: c.time as never, open: c.open, high: c.high, low: c.low, close: c.close };
}

function buildValuePayload(c: Candle) {
  return { time: c.time as never, value: c.close };
}

function ChartCanvas({
  symbol,
  chartType,
  candles,
}: {
  symbol: string;
  chartType: ChartType;
  candles: Candle[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const priceSeriesRef = useRef<AnyPriceSeries | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const { settings } = useSettings();
  const showOpenPositions = settings.chart.openPositions;
  const showTpSlStopLimit = settings.chart.tpsl;

  // Effect 1: mount the chart, series, volume, resize observer (runs once
  // per `key` — the call site re-keys on symbol/timeframe/chartType, so
  // this effect's closure captures the right values for this mount).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const buy = readToken("--buy", "#C8FF00");
    const sell = readToken("--sell", "#E84545");
    const accent = readToken("--accent", "#C8FF00");
    const textMuted = readToken("--text-muted", "#7C8B95");
    const textSubtle = readToken("--text-subtle", "#5A6770");
    const border = readToken("--border", "#1F2A30");

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: textMuted,
        fontFamily:
          '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: border, style: LineStyle.Dotted },
        horzLines: { color: border, style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: textSubtle, width: 1, style: LineStyle.Dashed },
        horzLine: { color: textSubtle, width: 1, style: LineStyle.Dashed },
      },
      rightPriceScale: { borderColor: border },
      timeScale: {
        borderColor: border,
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: false,
    });

    // Series renderer per chartType.
    let priceSeries: AnyPriceSeries;
    if (chartType === "candle") {
      priceSeries = chart.addSeries(CandlestickSeries, {
        upColor: buy,
        downColor: sell,
        borderUpColor: buy,
        borderDownColor: sell,
        wickUpColor: buy,
        wickDownColor: sell,
        priceLineColor: accent,
        priceLineStyle: LineStyle.Dashed,
        priceLineWidth: 1,
      });
      priceSeries.setData(
        candles.map(buildOhlcPayload) as never
      );
    } else if (chartType === "bar") {
      priceSeries = chart.addSeries(BarSeries, {
        upColor: buy,
        downColor: sell,
        priceLineColor: accent,
        priceLineStyle: LineStyle.Dashed,
        priceLineWidth: 1,
      });
      priceSeries.setData(
        candles.map(buildOhlcPayload) as never
      );
    } else if (chartType === "line") {
      priceSeries = chart.addSeries(LineSeries, {
        color: accent,
        lineWidth: 2,
        priceLineColor: accent,
        priceLineStyle: LineStyle.Dashed,
        priceLineWidth: 1,
      });
      priceSeries.setData(
        candles.map(buildValuePayload) as never
      );
    } else {
      // area
      priceSeries = chart.addSeries(AreaSeries, {
        lineColor: accent,
        topColor: `${accent}55`,
        bottomColor: `${accent}05`,
        lineWidth: 2,
        priceLineColor: accent,
        priceLineStyle: LineStyle.Dashed,
        priceLineWidth: 1,
      });
      priceSeries.setData(
        candles.map(buildValuePayload) as never
      );
    }
    priceSeriesRef.current = priceSeries;

    const volumeSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        color: textSubtle,
      },
      1
    );
    volumeSeriesRef.current = volumeSeries;
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as never,
        value: c.volume,
        color: c.close >= c.open ? `${buy}80` : `${sell}80`,
      }))
    );

    const panes = chart.panes();
    if (panes.length > 1) {
      panes[1].setHeight(Math.max(56, container.clientHeight * 0.18));
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      chart.applyOptions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup; remount is driven by `key` on the call site
  }, []);

  // Live tick: forward the latest candle to the series. Payload shape
  // depends on chartType — OHLC for candle/bar, {time,value} for
  // line/area. lightweight-charts' `update()` resolves "same time →
  // mutate last bar" vs "newer time → append" automatically.
  const lastCandle = candles[candles.length - 1];
  useEffect(() => {
    const priceSeries = priceSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!priceSeries || !volumeSeries || !lastCandle) return;

    if (chartType === "candle" || chartType === "bar") {
      priceSeries.update(buildOhlcPayload(lastCandle) as never);
    } else {
      priceSeries.update(buildValuePayload(lastCandle) as never);
    }

    const buy = readToken("--buy", "#C8FF00");
    const sell = readToken("--sell", "#E84545");
    volumeSeries.update({
      time: lastCandle.time as never,
      value: lastCandle.volume,
      color: lastCandle.close >= lastCandle.open ? `${buy}80` : `${sell}80`,
    });
  }, [lastCandle, chartType]);

  // Effect: ENTRY line(s) — gated by `Open positions` toggle
  useEffect(() => {
    const series = priceSeriesRef.current;
    if (!series || !showOpenPositions) return;

    const positions = POSITIONS.filter((p) => p.symbol === symbol);
    if (positions.length === 0) return;

    const info = readToken("--info", "#5BC0EB");

    const lines: IPriceLine[] = positions.map((position) =>
      series.createPriceLine({
        price: position.openPrice,
        color: info,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "Entry",
      })
    );

    return () => {
      lines.forEach((line) => series.removePriceLine(line));
    };
  }, [showOpenPositions, symbol]);

  // Effect: TP / SL / Stop / Limit markers — one toggle covers all four
  // marker types (TP and SL of open positions, plus pending-order
  // trigger lines)
  useEffect(() => {
    const series = priceSeriesRef.current;
    if (!series || !showTpSlStopLimit) return;

    const buy = readToken("--buy", "#C8FF00");
    const sell = readToken("--sell", "#E84545");
    const text = readToken("--text", "#FFFFFF");

    const lines: IPriceLine[] = [];

    for (const position of POSITIONS.filter((p) => p.symbol === symbol)) {
      if (position.takeProfit !== null) {
        lines.push(
          series.createPriceLine({
            price: position.takeProfit,
            color: buy,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: "TP",
          })
        );
      }
      if (position.stopLoss !== null) {
        lines.push(
          series.createPriceLine({
            price: position.stopLoss,
            color: sell,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: "SL",
          })
        );
      }
    }

    for (const order of PENDING_ORDERS.filter((o) => o.symbol === symbol)) {
      const triggerPrice = order.limitPrice ?? order.stopPrice;
      if (triggerPrice !== null && triggerPrice !== undefined) {
        lines.push(
          series.createPriceLine({
            price: triggerPrice,
            color: text,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: order.type === "limit" ? "Limit" : "Stop",
          })
        );
      }
    }

    return () => {
      lines.forEach((line) => series.removePriceLine(line));
    };
  }, [showTpSlStopLimit, symbol]);

  return <div ref={containerRef} className="absolute inset-0" />;
}

// Silence unused-import noise from intentionally-kept type re-exports.
export type { CandleSeriesType };

/* ──────────────────────────────────────────────────────────────────────
 * Timeframe range strip
 * ─────────────────────────────────────────────────────────────────────*/

function TimeframeStrip({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (next: Timeframe) => void;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utc = now.toISOString().slice(11, 19);

  return (
    <div className="flex h-9 shrink-0 items-center gap-1 border-t border-border px-2 text-[11px]">
      {TIMEFRAMES.map((tf) => {
        const active = tf === value;
        return (
          <button
            key={tf}
            type="button"
            onClick={() => onChange(tf)}
            aria-pressed={active}
            className={`flex h-6 w-9 items-center justify-center rounded transition-colors ${
              active
                ? "bg-surface-2 font-medium text-text"
                : "text-text-muted hover:bg-surface-2 hover:text-text"
            }`}
          >
            {tf}
          </button>
        );
      })}
      <button className="ml-1 flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-2 hover:text-text">
        <Calendar size={12} />
      </button>
      <div className="flex-1" />
      <span className="font-mono text-text-muted">{utc} UTC</span>
      <button className="rounded px-2 py-1 text-text-muted hover:bg-surface-2 hover:text-text">
        auto
      </button>
    </div>
  );
}
