"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Minus,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useActiveInstrument } from "@/lib/active-instrument-context";

/**
 * AI Insights panel — sits in the left column under the Instruments
 * widget. Shows a Buy / Hold / Sell call for the active symbol with a
 * speedometer-style gauge, a small bullet list of supporting signals,
 * and a last-updated timestamp.
 *
 * All numbers are mocked deterministically from the symbol string so
 * the panel reads as "stable" intel (same call between renders) but
 * varies symbol-to-symbol. The timestamp resets when the active symbol
 * changes — that's the only piece that uses wall-clock time.
 */

type AiKind = "buy" | "hold" | "sell";

type AiInsights = {
  kind: AiKind;
  score: number;
  expectedReturnPct: number;
  benchmark: string;
  riskAdjusted: "positive" | "neutral" | "negative";
  analystBuyPct: number;
  trend: "uptrend" | "sideways" | "downtrend";
};

export function AiSummaryPanel() {
  const { activeSymbol } = useActiveInstrument();
  const insights = useMemo(() => getAiInsights(activeSymbol), [activeSymbol]);

  // Wall-clock snapshot for "Last updated" — reset whenever the symbol
  // changes so each instrument gets a freshly-stamped read.
  const [updatedAt, setUpdatedAt] = useState<Date>(() => new Date());
  useEffect(() => {
    setUpdatedAt(new Date());
  }, [activeSymbol]);

  return (
    <aside className="flex h-full flex-col bg-surface">
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-1.5">
          <Sparkles size={11} className="text-accent" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            AI Insights
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-subtle">
          {activeSymbol}
        </span>
      </header>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          <RecommendationCard insights={insights} />
          <InsightList insights={insights} />
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-1 rounded-md border border-border bg-surface-2 px-3 text-xs text-text hover:bg-surface-3"
          >
            More details <ChevronRight size={12} />
          </button>
          <Footer updatedAt={updatedAt} />
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Recommendation card — Buy/Hold/Sell + gauge + score
 * ─────────────────────────────────────────────────────────────────────*/

const KIND_LABEL: Record<AiKind, string> = {
  buy: "Buy",
  hold: "Hold",
  sell: "Sell",
};
const KIND_CLASS: Record<AiKind, string> = {
  buy: "text-buy",
  hold: "text-warning",
  sell: "text-sell",
};

function RecommendationCard({ insights }: { insights: AiInsights }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2 p-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-[9px] uppercase tracking-wider text-text-subtle">
          Recommendation
        </span>
        <span
          className={`text-2xl font-semibold leading-tight ${KIND_CLASS[insights.kind]}`}
        >
          {KIND_LABEL[insights.kind]}
        </span>
        <span className="mt-0.5 font-mono text-[11px] text-text-muted">
          Score {insights.score}/100
        </span>
      </div>
      <Gauge score={insights.score} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Bullet list of supporting signals
 * ─────────────────────────────────────────────────────────────────────*/

function InsightList({ insights }: { insights: AiInsights }) {
  const positiveReturn = insights.expectedReturnPct >= 0;
  const ReturnIcon = positiveReturn ? TrendingUp : TrendingDown;
  const returnClass = positiveReturn ? "text-buy" : "text-sell";

  const riskClass =
    insights.riskAdjusted === "positive"
      ? "text-buy"
      : insights.riskAdjusted === "negative"
        ? "text-sell"
        : "text-warning";

  const TrendIcon =
    insights.trend === "uptrend"
      ? TrendingUp
      : insights.trend === "downtrend"
        ? TrendingDown
        : Minus;
  const trendClass =
    insights.trend === "uptrend"
      ? "text-buy"
      : insights.trend === "downtrend"
        ? "text-sell"
        : "text-warning";
  const trendLabel =
    insights.trend === "uptrend"
      ? "Uptrend"
      : insights.trend === "downtrend"
        ? "Downtrend"
        : "Sideways";

  return (
    <ul className="flex flex-col gap-2 text-xs">
      <Item icon={<ReturnIcon size={12} className={returnClass} />}>
        Expected return{" "}
        <span className={`font-mono font-medium ${returnClass}`}>
          {positiveReturn ? "+" : ""}
          {insights.expectedReturnPct}%
        </span>
        , {insights.benchmark}
      </Item>
      <Item icon={<ShieldCheck size={12} className={riskClass} />}>
        Risk-adjusted return is{" "}
        <span className={`font-medium ${riskClass}`}>
          {insights.riskAdjusted}
        </span>
      </Item>
      <Item icon={<ThumbsUp size={12} className="text-info" />}>
        <span className="font-mono font-medium text-text">
          {insights.analystBuyPct}%
        </span>{" "}
        of analysts recommend buying
      </Item>
      <Item icon={<TrendIcon size={12} className={trendClass} />}>
        <span className={`font-medium ${trendClass}`}>{trendLabel}</span>
      </Item>
    </ul>
  );
}

function Item({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2 text-text-muted">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="leading-snug">{children}</span>
    </li>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Footer — last-updated timestamp + methodology link
 * ─────────────────────────────────────────────────────────────────────*/

function Footer({ updatedAt }: { updatedAt: Date }) {
  const formatted = updatedAt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-2 text-[10px] text-text-subtle">
      <span>Last data update: {formatted}</span>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="text-info hover:underline"
      >
        Methodology &amp; disclosures
      </a>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Gauge — half-circle SVG with three-segment arc + needle
 * ─────────────────────────────────────────────────────────────────────*/

function Gauge({ score }: { score: number }) {
  const cx = 50;
  const cy = 50;
  const r = 38;
  // Score → theta on a half-circle: 0 → -90° (west), 100 → +90° (east).
  const theta = -90 + (score / 100) * 180;
  const needle = polar(cx, cy, r - 8, theta);
  return (
    <svg
      viewBox="0 0 100 60"
      className="h-12 w-20 shrink-0"
      aria-hidden="true"
    >
      <path
        d={arc(cx, cy, r, -90, -30)}
        stroke="var(--color-sell)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={arc(cx, cy, r, -30, 30)}
        stroke="var(--color-warning)"
        strokeWidth={6}
        fill="none"
      />
      <path
        d={arc(cx, cy, r, 30, 90)}
        stroke="var(--color-buy)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={needle.x}
        y2={needle.y}
        stroke="var(--color-text)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--color-text)" />
    </svg>
  );
}

function polar(cx: number, cy: number, r: number, thetaDeg: number) {
  const rad = (thetaDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  // Sweep flag 1 = clockwise in SVG user space (y points down); going
  // west → north → east along the top of the circle is clockwise.
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/* ──────────────────────────────────────────────────────────────────────
 * Deterministic mock insights
 * ─────────────────────────────────────────────────────────────────────*/

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getAiInsights(symbol: string): AiInsights {
  const h = hash(symbol);

  // Score range biased toward the upper half — most names land in
  // "Hold" / "Buy". Buckets align with the gauge's coloured zones
  // (red 0-33, amber 34-66, green 67-100).
  const score = 25 + (h % 70); // 25..94
  const kind: AiKind = score >= 67 ? "buy" : score >= 34 ? "hold" : "sell";

  const swing = (h >> 4) % 50;
  const expectedReturnPct =
    kind === "buy"
      ? Number((swing / 1.5 + 8).toFixed(1))
      : kind === "sell"
        ? -Number((swing / 2.5 + 4).toFixed(1))
        : Number((((h >> 6) % 11) - 5).toFixed(1));

  const benchmark =
    expectedReturnPct > 8
      ? "above S&P 500"
      : expectedReturnPct < -3
        ? "below S&P 500"
        : "in line with S&P 500";

  const riskAdjusted: AiInsights["riskAdjusted"] =
    kind === "buy" ? "positive" : kind === "sell" ? "negative" : "neutral";

  const analystBuyPct =
    kind === "buy"
      ? 70 + ((h >> 8) % 25)
      : kind === "hold"
        ? 40 + ((h >> 8) % 25)
        : 15 + ((h >> 8) % 25);

  const trend: AiInsights["trend"] =
    kind === "buy" ? "uptrend" : kind === "sell" ? "downtrend" : "sideways";

  return {
    kind,
    score,
    expectedReturnPct,
    benchmark,
    riskAdjusted,
    analystBuyPct,
    trend,
  };
}
