"use client";

import { X } from "lucide-react";
import { InstrumentsPanel } from "./instruments-panel";
import { SettingsPanel } from "./settings-panel";
import type { RailPanel } from "./side-rail";

const PANEL_TITLES: Record<RailPanel, string> = {
  instruments: "Instruments",
  calendar: "Calendar",
  settings: "Settings",
};

export function ContextualPanel({
  active,
  onClose,
}: {
  active: RailPanel;
  onClose?: () => void;
}) {
  return (
    <aside className="flex h-full flex-col bg-surface">
      <header className="flex h-9 shrink-0 items-center justify-between px-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {PANEL_TITLES[active]}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <X size={12} />
          </button>
        )}
      </header>
      <div className="flex-1 overflow-y-auto">
        {active === "instruments" && <InstrumentsPanel />}
        {active === "calendar" && <CalendarStub />}
        {active === "settings" && <SettingsPanel />}
      </div>
    </aside>
  );
}

function CalendarStub() {
  return (
    <div className="flex h-full items-center justify-center px-4 text-center text-xs text-text-subtle">
      Economic calendar — coming soon
    </div>
  );
}
