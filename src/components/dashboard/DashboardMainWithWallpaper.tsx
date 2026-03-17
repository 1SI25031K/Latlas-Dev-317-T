"use client";

import { useEffect, useState } from "react";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import { getBingWallpaperUrl } from "@/lib/bing-wallpaper";

type Props = { children: React.ReactNode };

export function DashboardMainWithWallpaper({ children }: Props) {
  const { wallpaperOn } = useDashboardSettings();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!wallpaperOn) {
      setImageUrl(null);
      return;
    }
    let cancelled = false;
    getBingWallpaperUrl().then((url) => {
      if (!cancelled && url) setImageUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [wallpaperOn]);

  if (!wallpaperOn) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-full w-full">
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden
      />
      <div className="relative z-10 min-h-full">{children}</div>
    </div>
  );
}
