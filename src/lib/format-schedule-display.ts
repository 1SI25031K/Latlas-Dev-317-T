import type { ClassSchedule } from "@/types/database";

/** 0=Sun, 1=Mon, ... 6=Sat. Jan 7 2024 is Sunday. */
const SUNDAY = new Date(2024, 0, 7);

function getShortWeekday(dayOfWeek: number, locale: string): string {
  const d = new Date(SUNDAY);
  d.setDate(SUNDAY.getDate() + dayOfWeek);
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
}

/**
 * Formats class schedule slots as a short summary string, e.g. "Mon 09:00–10:00, Wed 14:00–15:00".
 * Returns empty string if no slots.
 */
export function formatScheduleSummary(
  schedule: ClassSchedule | null | undefined,
  locale: string
): string {
  if (!schedule?.slots?.length) return "";
  const parts = schedule.slots
    .slice()
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
    .map(
      (slot) =>
        `${getShortWeekday(slot.dayOfWeek, locale)} ${slot.startTime}–${slot.endTime}`
    );
  return parts.join(", ");
}
