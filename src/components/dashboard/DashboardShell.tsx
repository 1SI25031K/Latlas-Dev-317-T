"use client";

import { useState, useCallback, useEffect } from "react";
import { DashboardMainWithWallpaper } from "@/components/dashboard/DashboardMainWithWallpaper";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 400;
const SIDEBAR_DEFAULT = 256;
const STORAGE_KEY = "latlas-sidebar-width";
const SIDEBAR_COLLAPSED_WIDTH = 72;

type DashboardShellProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardShell({ sidebar, children }: DashboardShellProps) {
  const { sidebarCollapsed } = useDashboardSettings();
  const [width, setWidth] = useState(SIDEBAR_DEFAULT);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!Number.isNaN(n) && n >= SIDEBAR_MIN && n <= SIDEBAR_MAX) {
        setWidth(n);
      }
    }
  }, []);

  const persistWidth = useCallback((w: number) => {
    setWidth(w);
    try {
      localStorage.setItem(STORAGE_KEY, String(w));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!dragging) return;
    if (sidebarCollapsed) {
      setDragging(false);
      return;
    }
    function onMove(e: MouseEvent) {
      const w = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX));
      persistWidth(w);
    }
    function onUp() {
      setDragging(false);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging, persistWidth]);

  const effectiveWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : width;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside
        className="flex shrink-0 flex-col"
        style={{
          width: `${effectiveWidth}px`,
          backgroundColor: "var(--dashboard-sidebar)",
          borderRight: "1px solid var(--dashboard-border)",
        }}
      >
        {sidebar}
      </aside>
      {!sidebarCollapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
          onMouseDown={() => setDragging(true)}
          className="w-1 shrink-0 cursor-col-resize transition-colors hover:bg-green-500/30 focus:outline-none focus-visible:bg-green-500/50"
          style={{ minWidth: 4 }}
        />
      )}
      <main className="min-w-0 flex-1 overflow-auto">
        <DashboardMainWithWallpaper>{children}</DashboardMainWithWallpaper>
      </main>
    </div>
  );
}
