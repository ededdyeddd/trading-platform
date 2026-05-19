"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ACTIVE_SYMBOL, OPEN_TABS } from "@/lib/mock-data";

/**
 * Active-instrument provider — what symbol the chart, order panel,
 * and instruments-panel highlight currently track, plus which tabs
 * exist in the header.
 *
 * Combined state (`openTabs` + `activeSymbol`) lets `closeTab` pick
 * a sensible neighbor to activate when the active tab is closed,
 * without juggling two `useState`s. Initial values come from
 * `OPEN_TABS` / `ACTIVE_SYMBOL` so SSR and first client render match.
 */

type State = { openTabs: string[]; activeSymbol: string };

type Ctx = {
  activeSymbol: string;
  openTabs: string[];
  setActiveSymbol: (symbol: string) => void;
  /** Add symbol to openTabs if missing, then activate it. */
  openTab: (symbol: string) => void;
  /** Remove symbol from openTabs; if it was active, activate a neighbor.
   *  No-op when only one tab remains (we don't allow a tabless terminal). */
  closeTab: (symbol: string) => void;
};

const ActiveInstrumentContext = createContext<Ctx | null>(null);

export function ActiveInstrumentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<State>(() => ({
    openTabs: [...OPEN_TABS],
    activeSymbol: ACTIVE_SYMBOL,
  }));

  const setActiveSymbol = useCallback((symbol: string) => {
    setState((prev) =>
      prev.activeSymbol === symbol ? prev : { ...prev, activeSymbol: symbol }
    );
  }, []);

  const openTab = useCallback((symbol: string) => {
    setState((prev) => ({
      openTabs: prev.openTabs.includes(symbol)
        ? prev.openTabs
        : [...prev.openTabs, symbol],
      activeSymbol: symbol,
    }));
  }, []);

  const closeTab = useCallback((symbol: string) => {
    setState((prev) => {
      const idx = prev.openTabs.indexOf(symbol);
      if (idx === -1) return prev;
      const nextTabs = prev.openTabs.filter((s) => s !== symbol);
      if (nextTabs.length === 0) return prev; // keep at least one tab open
      const nextActive =
        prev.activeSymbol === symbol
          ? nextTabs[Math.max(0, idx - 1)]
          : prev.activeSymbol;
      return { openTabs: nextTabs, activeSymbol: nextActive };
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      activeSymbol: state.activeSymbol,
      openTabs: state.openTabs,
      setActiveSymbol,
      openTab,
      closeTab,
    }),
    [state, setActiveSymbol, openTab, closeTab]
  );

  return (
    <ActiveInstrumentContext.Provider value={value}>
      {children}
    </ActiveInstrumentContext.Provider>
  );
}

export function useActiveInstrument(): Ctx {
  const ctx = useContext(ActiveInstrumentContext);
  if (!ctx) {
    throw new Error(
      "useActiveInstrument must be used inside <ActiveInstrumentProvider>"
    );
  }
  return ctx;
}
