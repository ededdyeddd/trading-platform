"use client";

import { useState } from "react";
import { ContextualPanel } from "@/components/contextual-panel";
import { HeaderBar } from "@/components/header-bar";
import { SideRail, type RailPanel } from "@/components/side-rail";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const [activeRailPanel, setActiveRailPanel] = useState<RailPanel>("instruments");

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
                <Stub label="ChartPanel" />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel id="positions" defaultSize="28%" minSize="10%">
                <Stub label="PositionsPanel" />
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
            <Stub label="OrderPanel" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status bar — full width, fixed 36px */}
      <footer className="h-9 shrink-0 border-t border-border">
        <Stub label="StatusBar" />
      </footer>
    </div>
  );
}

function Stub({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface text-text-subtle">
      <span className="font-mono text-[11px] uppercase tracking-wider">
        {label} · coming next
      </span>
    </div>
  );
}
