"use client";

import { Calendar, ListFilter, Settings } from "lucide-react";

export type RailPanel = "instruments" | "calendar" | "settings";

const RAIL_ITEMS: { id: RailPanel; label: string; icon: React.ReactNode }[] = [
  { id: "instruments", label: "Instruments", icon: <ListFilter size={16} /> },
  { id: "calendar", label: "Calendar", icon: <Calendar size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

export function SideRail({
  active,
  onChange,
}: {
  active: RailPanel;
  onChange: (panel: RailPanel) => void;
}) {
  return (
    <nav className="flex h-full flex-col items-center gap-1 py-3">
      {RAIL_ITEMS.map((item) => (
        <RailButton
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={item.id === active}
          onClick={() => onChange(item.id)}
        />
      ))}
    </nav>
  );
}

function RailButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-surface-2 text-text"
          : "text-text-subtle hover:bg-surface-2 hover:text-text-muted"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent"
        />
      )}
      {icon}
    </button>
  );
}
