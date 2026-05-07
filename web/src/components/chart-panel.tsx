"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
} from "lightweight-charts";
import {
  Calendar,
  Camera,
  ChevronDown,
  LayoutGrid,
  Maximize2,
  Redo2,
  Save,
  TrendingUp,
  Undo2,
  X,
} from "lucide-react";
import {
  ACTIVE_SYMBOL,
  CANDLES,
  POSITIONS,
  PENDING_ORDERS,
  formatUsd,
  getInstrument,
} from "@/lib/mock-data";
import { useSettings } from "@/lib/settings-context";

const TIMEFRAMES = ["5y", "1y", "6m", "3m", "1m", "5d", "1d"] as const;

export function ChartPanel() {
  const instrument = getInstrument(ACTIVE_SYMBOL);
  const candles = CANDLES[ACTIVE_SYMBOL] ?? [];
  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const change =
    lastCandle && firstCandle ? lastCandle.close - firstCandle.open : 0;
  const changePct =
    lastCandle && firstCandle ? (change / firstCandle.open) * 100 : 0;
  const position = POSITIONS.find((p) => p.symbol === ACTIVE_SYMBOL);

  return (
    <section className="flex h-full flex-col bg-surface">
      <ChartToolbar pnl={position?.pnl ?? null} />
      <div className="relative flex-1 overflow-hidden">
        <ChartOverlay
          symbol={ACTIVE_SYMBOL}
          name={instrument?.name ?? ""}
          ohlc={lastCandle}
          change={change}
          changePct={changePct}
        />
        <ChartCanvas />
      </div>
      <TimeframeStrip />
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Toolbar
 * ─────────────────────────────────────────────────────────────────────*/

function ChartToolbar({ pnl }: { pnl: number | null }) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border px-2">
      <ToolbarBtn label="1m" />
      <ToolbarBtn icon={<TrendingUp size={13} />} />
      <ToolbarBtn
        icon={<span className="font-mono text-[11px] italic">fx</span>}
        label="Indicators"
      />
      <ToolbarBtn icon={<LayoutGrid size={13} />} />
      <ToolbarBtn icon={<Undo2 size={13} />} />
      <ToolbarBtn icon={<Redo2 size={13} />} />
      <div className="flex-1" />
      <ToolbarBtn icon={<Save size={13} />} label="Save" hasChevron />
      <ToolbarBtn icon={<Camera size={13} />} />
      {pnl !== null && <PnlTag value={pnl} />}
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
  ohlc,
  change,
  changePct,
}: {
  symbol: string;
  name: string;
  ohlc?: { open: number; high: number; low: number; close: number };
  change: number;
  changePct: number;
}) {
  if (!ohlc) return null;
  const positive = change >= 0;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-3 font-mono text-[11px]">
      <span className="font-sans font-semibold text-text">
        {symbol} <span className="font-normal text-text-muted">· 1m</span>
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
 * Canvas — lightweight-charts integration
 *
 * Two effects:
 *   1. Mount the chart + series ONCE
 *   2. Manage position/pending lines reactively, keyed on settings flags
 * ─────────────────────────────────────────────────────────────────────*/

function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

function ChartCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const { settings } = useSettings();
  const showOpenPositions = settings.chart.openPositions;
  const showTpSlStopLimit = settings.chart.tpsl;

  // Effect 1: mount the chart, series, volume, resize observer (runs once)
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

    const candleSeries = chart.addSeries(CandlestickSeries, {
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
    candleSeriesRef.current = candleSeries;

    candleSeries.setData(
      CANDLES[ACTIVE_SYMBOL].map((c) => ({
        time: c.time as never,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    const volumeSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        color: textSubtle,
      },
      1
    );
    volumeSeries.setData(
      CANDLES[ACTIVE_SYMBOL].map((c) => ({
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
      candleSeriesRef.current = null;
      chart.remove();
    };
  }, []);

  // Effect 2: ENTRY line(s) — gated by `Open positions` toggle
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series || !showOpenPositions) return;

    const positions = POSITIONS.filter((p) => p.symbol === ACTIVE_SYMBOL);
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
  }, [showOpenPositions]);

  // Effect 3: TP / SL / Stop / Limit markers — one toggle covers all four marker types
  // (TP and SL of open positions, plus pending-order trigger lines)
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series || !showTpSlStopLimit) return;

    const buy = readToken("--buy", "#C8FF00");
    const sell = readToken("--sell", "#E84545");
    const text = readToken("--text", "#FFFFFF");

    const lines: IPriceLine[] = [];

    // TP / SL of open positions
    for (const position of POSITIONS.filter(
      (p) => p.symbol === ACTIVE_SYMBOL
    )) {
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

    // Pending order trigger lines (Buy/Sell Limit, Stop)
    for (const order of PENDING_ORDERS.filter(
      (o) => o.symbol === ACTIVE_SYMBOL
    )) {
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
  }, [showTpSlStopLimit]);

  return <div ref={containerRef} className="absolute inset-0" />;
}

/* ──────────────────────────────────────────────────────────────────────
 * Timeframe range strip
 * ─────────────────────────────────────────────────────────────────────*/

function TimeframeStrip() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utc = now.toISOString().slice(11, 19);

  return (
    <div className="flex h-9 shrink-0 items-center gap-1 border-t border-border px-2 text-[11px]">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          className={`flex h-6 w-9 items-center justify-center rounded ${
            tf === "1m"
              ? "bg-surface-2 font-medium text-text"
              : "text-text-muted hover:bg-surface-2 hover:text-text"
          }`}
        >
          {tf}
        </button>
      ))}
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
