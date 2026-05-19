"use client";

import { useState } from "react";
import { ChartPanel } from "@/components/chart-panel";
import { ContextualPanel } from "@/components/contextual-panel";
import { HeaderBar } from "@/components/header-bar";
import { OrderPanel } from "@/components/order-panel";
import { PositionsPanel } from "@/components/positions-panel";
import { SideRail, type RailPanel } from "@/components/side-rail";
import { StatusBar } from "@/components/status-bar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ActiveInstrumentProvider } from "@/lib/active-instrument-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { PositionsProvider } from "@/lib/positions-context";
import { QuotesProvider } from "@/lib/quotes-context";
import { SettingsProvider, useSettings } from "@/lib/settings-context";
import { ToastProvider } from "@/lib/toast-context";

export default function Home() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <QuotesProvider>
            <PositionsProvider>
              <ActiveInstrumentProvider>
                <Terminal />
              </ActiveInstrumentProvider>
            </PositionsProvider>
          </QuotesProvider>
        </FavoritesProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}

function Terminal() {
  const [activeRailPanel, setActiveRailPanel] =
    useState<RailPanel>("instruments");
  const { settings } = useSettings();
  const { widgets } = settings;

  const showMiddle = widgets.chart || widgets.positions;
  const anyVisible = widgets.instruments || showMiddle || widgets.order;

  // Re-mount the group when visibility changes so default sizes redistribute
  // across the currently visible panels — react-resizable-panels keeps the
  // last user-sized values otherwise.
  const layoutKey = `${widgets.instruments}-${widgets.chart}-${widgets.positions}-${widgets.order}`;

  return (
    <div className="flex h-screen w-screen flex-col bg-bg">
      {/* Header — full width, fixed 52px */}
      <header className="h-[52px] shrink-0 border-b border-border">
        <HeaderBar />
      </header>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side rail — fixed 48px, no resize */}
        <aside className="w-12 shrink-0 border-r border-border bg-bg">
          <SideRail active={activeRailPanel} onChange={setActiveRailPanel} />
        </aside>

        {/* Resizable panel tree */}
        {anyVisible ? (
          <ResizablePanelGroup
            key={layoutKey}
            orientation="horizontal"
            className="flex-1"
          >
            {widgets.instruments && (
              <ResizablePanel
                id="context"
                defaultSize="22%"
                minSize="15%"
                maxSize="40%"
              >
                <ContextualPanel active={activeRailPanel} />
              </ResizablePanel>
            )}

            {widgets.instruments && (showMiddle || widgets.order) && (
              <ResizableHandle withHandle />
            )}

            {showMiddle && (
              <ResizablePanel id="middle" defaultSize="50%" minSize="30%">
                <ResizablePanelGroup orientation="vertical">
                  {widgets.chart && (
                    <ResizablePanel id="chart" defaultSize="72%" minSize="30%">
                      <ChartPanel />
                    </ResizablePanel>
                  )}
                  {widgets.chart && widgets.positions && (
                    <ResizableHandle withHandle />
                  )}
                  {widgets.positions && (
                    <ResizablePanel
                      id="positions"
                      defaultSize="28%"
                      minSize="10%"
                    >
                      <PositionsPanel />
                    </ResizablePanel>
                  )}
                </ResizablePanelGroup>
              </ResizablePanel>
            )}

            {showMiddle && widgets.order && <ResizableHandle withHandle />}

            {widgets.order && (
              <ResizablePanel
                id="order"
                defaultSize="28%"
                minSize="20%"
                maxSize="45%"
              >
                <OrderPanel />
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-text-muted">
            All widgets hidden — enable some via the Widgets menu.
          </div>
        )}
      </div>

      {/* Status bar — full width, fixed 36px */}
      <div className="shrink-0 border-t border-border">
        <StatusBar />
      </div>
    </div>
  );
}
