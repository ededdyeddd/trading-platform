"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useSettings,
  type ChartFlag,
  type ImpactLevel,
  type SoundFlag,
} from "@/lib/settings-context";

type ChartToggle = {
  id: ChartFlag;
  label: string;
  hasNested?: boolean;
};

const CHART_TOGGLES: ChartToggle[] = [
  { id: "signals", label: "Signals" },
  { id: "hmr", label: "HMR periods" },
  { id: "alerts", label: "Price alerts" },
  { id: "openPositions", label: "Open positions" },
  { id: "tpsl", label: "TP / SL / Stop / Limit" },
  { id: "calendar", label: "Economic calendar", hasNested: true },
];

const IMPACT_LEVELS: ImpactLevel[] = [
  "High impact",
  "Middle impact",
  "Low impact",
  "Lowest impact",
];

const SOUND_TOGGLES: { id: SoundFlag; label: string }[] = [
  { id: "alerts", label: "Price alerts" },
  { id: "closing", label: "Closing by TP / SL / SO" },
];

export function SettingsPanel() {
  const { settings, setChartFlag, setSoundFlag, setImpact } = useSettings();

  return (
    <div className="flex flex-col gap-5 px-3 pb-6">
      {/* Show on chart */}
      <Group title="Show on chart">
        {CHART_TOGGLES.map((t) => (
          <div key={t.id}>
            <ToggleRow
              label={t.label}
              checked={settings.chart[t.id]}
              onCheckedChange={(v) => setChartFlag(t.id, v)}
            />
            {t.hasNested && settings.chart[t.id] && (
              <div className="ml-2 flex flex-col gap-2 pb-2 pl-2">
                {IMPACT_LEVELS.map((level) => (
                  <CheckboxRow
                    key={level}
                    label={level}
                    checked={settings.impacts[level]}
                    onCheckedChange={(v) => setImpact(level, v)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </Group>

      {/* Sound effects */}
      <Group title="Sound effects" hasHelp>
        {SOUND_TOGGLES.map((t) => (
          <ToggleRow
            key={t.id}
            label={t.label}
            checked={settings.sounds[t.id]}
            onCheckedChange={(v) => setSoundFlag(t.id, v)}
          />
        ))}
      </Group>

      {/* Open order mode */}
      <Group title="Open order mode">
        <DropdownRow value={settings.orderMode} />
      </Group>

      {/* Price source */}
      <Group title="Price source">
        <DropdownRow value={settings.priceSource} />
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
    <label className="flex cursor-pointer items-center justify-between py-1.5 text-xs">
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
    <label className="flex cursor-pointer items-center gap-2 text-xs">
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
