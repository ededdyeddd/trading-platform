"use client";

import { useState } from "react";
import {
  Brackets,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Crosshair,
  PenTool,
  Pencil,
  Rows3,
  Smile,
  Spline,
  Triangle,
  Type,
} from "lucide-react";

/**
 * Drawing tools sidebar — chrome only for the prototype. Mirrors the
 * standard MT/TradingView rail: cursor / lines / shapes / fibo / brush
 * / text / sticker. Selecting a tool just updates the local highlight;
 * no actual drawing happens (lightweight-charts has no built-in
 * drawing API; a real impl would need a canvas/SVG overlay anchored
 * to price/time coords). Collapse arrow at the bottom hides the rail.
 */

type ToolId =
  | "cursor"
  | "trend"
  | "channel"
  | "polygon"
  | "fibo"
  | "anchor"
  | "brush"
  | "text"
  | "sticker";

type ToolGroup = { items: { id: ToolId; label: string; icon: React.ReactNode }[] };

const TOOL_GROUPS: ToolGroup[] = [
  {
    items: [{ id: "cursor", label: "Crosshair", icon: <Crosshair size={14} /> }],
  },
  {
    items: [
      { id: "trend", label: "Trend line", icon: <Spline size={14} /> },
      { id: "channel", label: "Channels", icon: <Rows3 size={14} /> },
      { id: "polygon", label: "Polygon", icon: <Triangle size={14} /> },
      { id: "fibo", label: "Fibonacci", icon: <Brackets size={14} /> },
      { id: "anchor", label: "Anchored", icon: <CircleDot size={14} /> },
    ],
  },
  {
    items: [
      { id: "brush", label: "Brush", icon: <PenTool size={14} /> },
      { id: "text", label: "Text", icon: <Type size={14} /> },
      { id: "sticker", label: "Sticker", icon: <Smile size={14} /> },
    ],
  },
];

export function ChartDrawingRail() {
  const [tool, setTool] = useState<ToolId>("cursor");
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="flex w-6 shrink-0 items-start justify-center border-r border-border bg-surface pt-2">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Show drawing tools"
          title="Show drawing tools"
          className="flex h-6 w-6 items-center justify-center rounded text-text-subtle hover:bg-surface-2 hover:text-text"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    );
  }

  return (
    <aside className="flex w-9 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-2">
      {TOOL_GROUPS.map((group, idx) => (
        <div key={idx} className="flex w-full flex-col items-center gap-0.5">
          {idx > 0 && <div className="my-1 h-px w-5 bg-border" />}
          {group.items.map((item) => {
            const active = tool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTool(item.id)}
                aria-label={item.label}
                aria-pressed={active}
                title={item.label}
                className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  active
                    ? "bg-surface-2 text-text"
                    : "text-text-subtle hover:bg-surface-2 hover:text-text-muted"
                }`}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      ))}

      <div className="flex-1" />

      {/* Free-draw quick-toggle stub */}
      <button
        type="button"
        aria-label="Quick pencil"
        title="Quick pencil"
        className="flex h-7 w-7 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2 hover:text-text-muted"
      >
        <Pencil size={14} />
      </button>

      {/* Collapse rail */}
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        aria-label="Hide drawing tools"
        title="Hide drawing tools"
        className="mt-1 flex h-7 w-7 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2 hover:text-text"
      >
        <ChevronLeft size={12} />
      </button>
    </aside>
  );
}
