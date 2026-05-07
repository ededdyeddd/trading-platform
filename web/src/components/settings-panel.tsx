"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

type ChartToggle = {
  id: string;
  label: string;
  defaultOn?: boolean;
  hasNested?: boolean;
};

const CHART_TOGGLES: ChartToggle[] = [
  { id: "signals", label: "Signals" },
  { id: "hmr", label: "HMR periods", defaultOn: true },
  { id: "alerts", label: "Price alerts", defaultOn: true },
  { id: "positions", label: "Open positions", defaultOn: true },
  { id: "tpsl", label: "TP / SL / Stop / Limit" },
  { id: "calendar", label: "Economic calendar", defaultOn: true, hasNested: true },
];

const IMPACT_LEVELS = ["High impact", "Middle impact", "Low impact", "Lowest impact"];

export function SettingsPanel() {
  const [chartFlags, setChartFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(CHART_TOGGLES.map((t) => [t.id, !!t.defaultOn]))
  );
  const [impacts, setImpacts] = useState<Record<string, boolean>>({
    "High impact": true,
    "Middle impact": false,
    "Low impact": false,
    "Lowest impact": false,
  });
  const [soundFlags, setSoundFlags] = useState<Record<string, boolean>>({
    alerts: false,
    closing: false,
  });

  return (
    <div className="flex flex-col gap-5 px-3 pb-6">
      {/* Show on chart */}
      <Group title="Show on chart">
        {CHART_TOGGLES.map((t) => (
          <div key={t.id}>
            <ToggleRow
              label={t.label}
              checked={chartFlags[t.id]}
              onCheckedChange={(v) =>
                setChartFlags((prev) => ({ ...prev, [t.id]: v }))
              }
            />
            {t.hasNested && chartFlags[t.id] && (
              <div className="ml-2 flex flex-col gap-2 pb-2 pl-2">
                {IMPACT_LEVELS.map((level) => (
                  <CheckboxRow
                    key={level}
                    label={level}
                    checked={impacts[level]}
                    onCheckedChange={(v) =>
                      setImpacts((prev) => ({ ...prev, [level]: v }))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </Group>

      {/* Sound effects */}
      <Group title="Sound effects" hasHelp>
        <ToggleRow
          label="Price alerts"
          checked={soundFlags.alerts}
          onCheckedChange={(v) => setSoundFlags((p) => ({ ...p, alerts: v }))}
        />
        <ToggleRow
          label="Closing by TP / SL / SO"
          checked={soundFlags.closing}
          onCheckedChange={(v) => setSoundFlags((p) => ({ ...p, closing: v }))}
        />
      </Group>

      {/* Open order mode */}
      <Group title="Open order mode">
        <DropdownRow value="Regular form" />
      </Group>

      {/* Price source (placeholder section header — Exness has it) */}
      <Group title="Price source">
        <DropdownRow value="Last price" />
      </Group>
    </div>
  );
}

function Group({
  title,
  hasHelp,
  children,
}: {
  title: string;
  hasHelp?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        <span>{title}</span>
        {hasHelp && <HelpCircle size={11} className="text-text-subtle" />}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-1.5 text-xs cursor-pointer">
      <span className="text-text">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function CheckboxRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      <span className="text-text">{label}</span>
    </label>
  );
}

function DropdownRow({ value }: { value: string }) {
  return (
    <button className="flex h-9 items-center justify-between rounded-md border border-border bg-surface-2 px-3 text-xs hover:bg-surface-3">
      <span className="text-text">{value}</span>
      <ChevronDown size={12} className="text-text-muted" />
    </button>
  );
}
