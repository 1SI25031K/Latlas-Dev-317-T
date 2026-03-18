"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";

const ANIM_MS = 220;

type DashboardCustomizeDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const BACKGROUND_COLORS: Array<{ label: string; hex: string }> = [
  { label: "Blue", hex: "#3B82F6" },
  { label: "Purple", hex: "#A855F7" },
  { label: "Pink", hex: "#EC4899" },
  { label: "Red", hex: "#EF4444" },
  { label: "Orange", hex: "#F97316" },
  { label: "Yellow", hex: "#FBBF24" },
  { label: "Green", hex: "#10B981" },
  { label: "Mint", hex: "#2DD4BF" },
  { label: "Teal", hex: "#0D9488" },
  { label: "Cyan", hex: "#06B6D4" },
  { label: "Indigo", hex: "#6366F1" },
  { label: "Brown", hex: "#78716C" },
  { label: "Gray", hex: "#6B7280" },
  { label: "Slate", hex: "#475569" },
  { label: "Zinc", hex: "#71717A" },
  { label: "Rose", hex: "#FB7185" },
];

const SOFTEN_WHITE_RATIO = 0.7;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const v = hex.trim();
  if (!v.startsWith("#")) return null;
  if (v.length !== 7) return null;
  const r = parseInt(v.slice(1, 3), 16);
  const g = parseInt(v.slice(3, 5), 16);
  const b = parseInt(v.slice(5, 7), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

function softenHex(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const inv = 1 - SOFTEN_WHITE_RATIO;
  const r = Math.round(rgb.r * inv + 255 * SOFTEN_WHITE_RATIO);
  const g = Math.round(rgb.g * inv + 255 * SOFTEN_WHITE_RATIO);
  const b = Math.round(rgb.b * inv + 255 * SOFTEN_WHITE_RATIO);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function DashboardCustomizeDrawer({
  open,
  onClose,
}: DashboardCustomizeDrawerProps) {
  const tDash = useTranslations("dashboard");
  const tSettings = useTranslations("settings");

  const {
    theme,
    setTheme,
    backgroundMode,
    setBackgroundMode,
    backgroundColor,
    setBackgroundColor,
  } = useDashboardSettings();

  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  const closeTimerRef = useRef<number | null>(null);

  const isSegmentActive = useMemo(() => {
    return {
      light: theme === "light",
      dark: theme === "dark",
      system: theme === "system",
    };
  }, [theme]);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      setMounted(true);
      // Let DOM mount, then trigger transition.
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    setVisible(false);
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
    }, ANIM_MS);

    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/20 transition-opacity"
        style={{ opacity: visible ? 1 : 0, transitionDuration: `${ANIM_MS}ms` }}
        onMouseDown={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-full max-w-[92vw] w-[360px] border-l bg-transparent"
      >
        <div
          className="h-full"
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            transform: visible ? "translateX(0)" : "translateX(100%)",
            transition: `transform ${ANIM_MS}ms ease-out`,
            backgroundColor: "var(--dashboard-card)",
            borderColor: "var(--dashboard-border)",
            color: "var(--dashboard-text)",
          }}
        >
          <div className="flex h-16 items-center justify-between border-b px-4" style={{ borderColor: "var(--dashboard-border)" }}>
            <div className="text-sm font-semibold" style={{ color: "var(--dashboard-text)" }}>
              テーマ
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-opacity hover:opacity-90"
              style={{ borderColor: "var(--dashboard-border)", backgroundColor: "transparent", color: "var(--dashboard-text-muted)" }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="p-4">
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>
              {tSettings("appearance")}
            </div>

            <div className="mt-3 rounded-full border p-1" style={{ borderColor: "var(--dashboard-border)" }}>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className="flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isSegmentActive.light ? "var(--dashboard-border)" : "transparent",
                    color: isSegmentActive.light ? "var(--dashboard-text)" : "var(--dashboard-text-muted)",
                  }}
                >
                  {tSettings("themeLight")}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className="flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isSegmentActive.dark ? "var(--dashboard-border)" : "transparent",
                    color: isSegmentActive.dark ? "var(--dashboard-text)" : "var(--dashboard-text-muted)",
                  }}
                >
                  {tSettings("themeDark")}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className="flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isSegmentActive.system ? "var(--dashboard-border)" : "transparent",
                    color: isSegmentActive.system ? "var(--dashboard-text)" : "var(--dashboard-text-muted)",
                  }}
                >
                  {tSettings("themeSystem")}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
                {tSettings("background")}
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setBackgroundMode("theme")}
                  className="h-12 w-12 rounded-full border transition-transform hover:scale-110"
                  style={{
                    backgroundColor: "transparent",
                    borderColor:
                      backgroundMode === "theme" ? "var(--dashboard-text)" : "var(--dashboard-border)",
                    color: "var(--dashboard-text)",
                  }}
                  aria-pressed={backgroundMode === "theme"}
                >
                  {backgroundMode === "theme" ? (
                    <span className="block h-full w-full text-xs font-bold leading-none text-center pt-4">✓</span>
                  ) : null}
                </button>

                {BACKGROUND_COLORS.map((c) => {
                  const appliedHex = softenHex(c.hex);
                  const selected =
                    backgroundMode === "solid" &&
                    (backgroundColor === c.hex || backgroundColor === appliedHex);
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setBackgroundColor(appliedHex);
                        setBackgroundMode("solid");
                      }}
                      className="h-12 w-12 shrink-0 rounded-full border transition-transform hover:scale-110"
                      style={{
                        backgroundColor: appliedHex,
                        borderColor: selected ? "var(--dashboard-text)" : "var(--dashboard-border)",
                      }}
                      aria-label={c.label}
                      aria-pressed={selected}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setBackgroundMode("daily")}
                className="mt-3 w-full rounded-2xl border px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                style={{
                  borderColor: "var(--dashboard-border)",
                  color: "var(--dashboard-text)",
                  backgroundColor:
                    backgroundMode === "daily" ? "var(--dashboard-border)" : "transparent",
                }}
              >
                {tDash("dailyWallpaper")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

