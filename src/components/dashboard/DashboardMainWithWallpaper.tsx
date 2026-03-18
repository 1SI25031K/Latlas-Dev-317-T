"use client";

import { useEffect, useState } from "react";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import { getBingWallpaperUrl } from "@/lib/bing-wallpaper";

type Props = { children: React.ReactNode };

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const v = hex.trim();
  if (!v.startsWith("#")) return null;
  if (v.length === 4) {
    const r = parseInt(v[1] + v[1], 16);
    const g = parseInt(v[2] + v[2], 16);
    const b = parseInt(v[3] + v[3], 16);
    return { r, g, b };
  }
  if (v.length !== 7) return null;
  const r = parseInt(v.slice(1, 3), 16);
  const g = parseInt(v.slice(3, 5), 16);
  const b = parseInt(v.slice(5, 7), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  // WCAG relative luminance
  const srgb = [rgb.r, rgb.g, rgb.b].map((c) => c / 255);
  const linear = srgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  return relativeLuminance(rgb) > 0.5;
}

const SOFTEN_WHITE_RATIO = 0.7;

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

export function DashboardMainWithWallpaper({ children }: Props) {
  const { backgroundMode, backgroundColor, resolvedTheme } = useDashboardSettings();
  const [dailyUrl, setDailyUrl] = useState<string | null>(null);

  useEffect(() => {
    if (backgroundMode !== "daily") {
      setDailyUrl(null);
      return;
    }
    let cancelled = false;
    getBingWallpaperUrl().then((url) => {
      if (!cancelled && url) setDailyUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [backgroundMode]);

  if (backgroundMode === "theme") {
    return <>{children}</>;
  }

  const overlayOpacity = 0.4;
  const dailyOverlayColor =
    resolvedTheme === "light"
      ? `rgba(255,255,255,${overlayOpacity})`
      : `rgba(0,0,0,${overlayOpacity})`;

  // Background-dependent text vars (override children inline styles via CSS vars)
  const dailyText = resolvedTheme === "light"
    ? { text: "#171717", muted: "#6b7280" }
    : { text: "#c9d1d9", muted: "#8b949e" };

  const solidAppliedHex = backgroundMode === "solid" ? softenHex(backgroundColor) : backgroundColor;
  const solidIsLight = isLightColor(solidAppliedHex);
  const solidText = solidIsLight
    ? { text: "#171717", muted: "#6b7280" }
    : { text: "#c9d1d9", muted: "#8b949e" };

  const textVars =
    backgroundMode === "daily"
      ? { "--dashboard-text": dailyText.text, "--dashboard-text-muted": dailyText.muted }
      : { "--dashboard-text": solidText.text, "--dashboard-text-muted": solidText.muted };

  const useDarkText = backgroundMode === "daily" ? resolvedTheme === "light" : solidIsLight;
  // text-shadow can make the whole UI look "blurred" on top of photos.
  // We disable it to restore crisp text.
  const contentTextShadow = "none";

  if (backgroundMode === "daily") {
    return (
      <div
        className="relative min-h-full w-full"
        style={textVars as React.CSSProperties}
      >
        {dailyUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${dailyUrl})` }}
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: dailyOverlayColor }}
          aria-hidden
        />
        <div className="relative z-10 min-h-full" style={{ textShadow: contentTextShadow }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-full w-full"
      style={{ backgroundColor: solidAppliedHex, ...(textVars as React.CSSProperties) }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: solidIsLight ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.28)",
        }}
        aria-hidden
      />
      <div className="relative z-10 min-h-full" style={{ textShadow: contentTextShadow }}>
        {children}
      </div>
    </div>
  );
}
