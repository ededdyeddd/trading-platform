"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ──────────────────────────────────────────────────────────────────────
 * Types
 * ─────────────────────────────────────────────────────────────────────*/

export type ChartFlag =
  | "signals"
  | "hmr"
  | "alerts"
  | "openPositions"
  | "tpsl"
  | "calendar";

export type SoundFlag = "alerts" | "closing";

export type ImpactLevel =
  | "High impact"
  | "Middle impact"
  | "Low impact"
  | "Lowest impact";

export type WidgetKey = "instruments" | "chart" | "positions" | "order";

export type SettingsState = {
  chart: Record<ChartFlag, boolean>;
  sounds: Record<SoundFlag, boolean>;
  impacts: Record<ImpactLevel, boolean>;
  widgets: Record<WidgetKey, boolean>;
  orderMode: string;
  priceSource: string;
};

type SettingsContextValue = {
  settings: SettingsState;
  setChartFlag: (flag: ChartFlag, value: boolean) => void;
  setSoundFlag: (flag: SoundFlag, value: boolean) => void;
  setImpact: (level: ImpactLevel, value: boolean) => void;
  setWidget: (key: WidgetKey, value: boolean) => void;
  setOrderMode: (mode: string) => void;
  setPriceSource: (src: string) => void;
};

/* ──────────────────────────────────────────────────────────────────────
 * Defaults
 * ─────────────────────────────────────────────────────────────────────*/

const DEFAULTS: SettingsState = {
  chart: {
    signals: false,
    hmr: true,
    alerts: true,
    openPositions: true,
    tpsl: true,
    calendar: true,
  },
  sounds: {
    alerts: false,
    closing: false,
  },
  impacts: {
    "High impact": true,
    "Middle impact": false,
    "Low impact": false,
    "Lowest impact": false,
  },
  widgets: {
    instruments: true,
    chart: true,
    positions: true,
    order: true,
  },
  orderMode: "Regular form",
  priceSource: "Last price",
};

/* ──────────────────────────────────────────────────────────────────────
 * Context
 * ─────────────────────────────────────────────────────────────────────*/

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);

  const setChartFlag = useCallback((flag: ChartFlag, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      chart: { ...prev.chart, [flag]: value },
    }));
  }, []);

  const setSoundFlag = useCallback((flag: SoundFlag, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      sounds: { ...prev.sounds, [flag]: value },
    }));
  }, []);

  const setImpact = useCallback((level: ImpactLevel, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      impacts: { ...prev.impacts, [level]: value },
    }));
  }, []);

  const setWidget = useCallback((key: WidgetKey, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      widgets: { ...prev.widgets, [key]: value },
    }));
  }, []);

  const setOrderMode = useCallback((mode: string) => {
    setSettings((prev) => ({ ...prev, orderMode: mode }));
  }, []);

  const setPriceSource = useCallback((src: string) => {
    setSettings((prev) => ({ ...prev, priceSource: src }));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      setChartFlag,
      setSoundFlag,
      setImpact,
      setWidget,
      setOrderMode,
      setPriceSource,
    }),
    [
      settings,
      setChartFlag,
      setSoundFlag,
      setImpact,
      setWidget,
      setOrderMode,
      setPriceSource,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
