"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboardSettings } from "@/components/dashboard/DashboardSettingsContext";
import {
  getHeaderClockTextColor,
  headerClockIsCompactFont,
  headerClockFontFamily,
  headerClockGoogleFontHrefs,
} from "@/lib/header-clock";

const WIDE_MIN_PX = 1100;

type Props = {
  locale: string;
};

export function HeaderClock({ locale }: Props) {
  const {
    resolvedTheme,
    clockFontId,
    clock24Hour,
    clockShowSeconds,
    clockLarge,
  } = useDashboardSettings();
  const [wide, setWide] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      ...(clockShowSeconds ? { second: "2-digit" } : {}),
      hour12: !clock24Hour,
    });
  }, [locale, clock24Hour, clockShowSeconds]);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${WIDE_MIN_PX}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const hrefs = headerClockGoogleFontHrefs();
    hrefs.forEach((href, i) => {
      const id = `latlas-header-clock-fonts-${i}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!wide) return null;

  const color = getHeaderClockTextColor(resolvedTheme);
  const family = headerClockFontFamily(clockFontId);
  const compact = headerClockIsCompactFont(clockFontId);
  const timeStr = formatter.format(now);

  const fontSize = clockLarge
    ? compact
      ? "1.05rem"
      : "1.28rem"
    : compact
      ? "0.95rem"
      : "1.125rem";

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 max-h-[2.75rem] max-w-[40%] -translate-x-1/2 -translate-y-1/2 truncate text-center tabular-nums leading-tight"
      style={{
        fontFamily: family,
        fontSize,
        fontWeight: 600,
        color,
        letterSpacing: "0.02em",
      }}
      aria-live="polite"
      aria-atomic="true"
      lang={locale}
    >
      {timeStr}
    </div>
  );
}
