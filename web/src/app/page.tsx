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
import { SettingsProvider } from "@/lib/settings-context";

export default function Home() {
  return (
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
  );
}

function Terminal() {
  const [activeRailPanel, setActiveRailPanel] =
    useState<RailPanel>("instruments");

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
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel
            id="context"
            defaultSize="22%"
            minSize="15%"
            maxSize="40%"
          >
            <ContextualPanel active={activeRailPanel} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel id="middle" defaultSize="50%" minSize="30%">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel id="chart" defaultSize="72%" minSize="30%">
                <ChartPanel />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel id="positions" defaultSize="28%" minSize="10%">
                <PositionsPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            id="order"
            defaultSize="28%"
            minSize="20%"
            maxSize="45%"
          >
            <OrderPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status bar — full width, fixed 36px */}
      <div className="shrink-0 border-t border-border">
        <StatusBar />
      </div>
    </div>
  );
}
