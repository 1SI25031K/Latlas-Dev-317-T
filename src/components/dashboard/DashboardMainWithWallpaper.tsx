"use client";

import { useEffect, useState } from "react";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import { getBingWallpaperUrl } from "@/lib/bing-wallpaper";

type Props = { children: React.ReactNode };

export function DashboardMainWithWallpaper({ children }: Props) {
  const { backgroundMode, backgroundColor } = useDashboardSettings();
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

  const contentTextShadow =
    "0 1px 2px rgba(0,0,0,0.65), 0 0 8px rgba(255,255,255,0.25)";

  if (backgroundMode === "daily") {
    return (
      <div className="relative min-h-full w-full">
        {dailyUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${dailyUrl})` }}
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-black/40"
          aria-hidden
        />
        <div
          className="relative z-10 min-h-full"
          style={{ textShadow: contentTextShadow }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full w-full" style={{ backgroundColor }}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.32)" }}
        aria-hidden
      />
      <div
        className="relative z-10 min-h-full"
        style={{ textShadow: contentTextShadow }}
      >
        {children}
      </div>
    </div>
  );
}
