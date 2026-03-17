"use client";

import { useTranslations } from "next-intl";
import {
  buildGoogleCalendarUrl,
  getCalendarSlotParams,
  generateIcsForClass,
} from "@/lib/calendar-export";
import type { ClassSchedule } from "@/types/database";

type ClassCalendarLinksProps = {
  className: string;
  schedule: ClassSchedule | null | undefined;
};

export function ClassCalendarLinks({ className, schedule }: ClassCalendarLinksProps) {
  const t = useTranslations("class");
  const params = getCalendarSlotParams(schedule);

  function handleDownloadIcs() {
    const ics = generateIcsForClass(className, schedule);
    if (!ics) return;
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "class.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!params) return null;

  const { slots, termStart, termEnd } = params;

  return (
    <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--dashboard-border)", backgroundColor: "var(--dashboard-bg)" }}>
      <p className="text-sm font-medium" style={{ color: "var(--dashboard-text)" }}>
        {t("addToCalendar")}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {slots.map((slot, i) => {
          const url = buildGoogleCalendarUrl(className, slot, termStart, termEnd);
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              {t("googleCalendar")} {slots.length > 1 ? `#${i + 1}` : ""}
            </a>
          );
        })}
        <button
          type="button"
          onClick={handleDownloadIcs}
          className="rounded-2xl border px-3 py-1.5 text-sm font-medium hover:opacity-90"
          style={{
            borderColor: "var(--dashboard-border)",
            color: "var(--dashboard-text)",
          }}
        >
          {t("downloadIcs")}
        </button>
      </div>
    </div>
  );
}
