import type { Class, ClassSchedule } from "@/types/database";

/**
 * Returns the next occurrence (start Date) of a class session after fromDate,
 * based on schedule slots and term. Returns null if no schedule, no slots, or term is in the past.
 */
export function getNextOccurrence(
  schedule: ClassSchedule | null | undefined,
  fromDate: Date
): Date | null {
  if (!schedule?.slots?.length) return null;

  const termEnd = schedule.termEnd
    ? new Date(schedule.termEnd + "T23:59:59")
    : null;
  const termStart = schedule.termStart
    ? new Date(schedule.termStart + "T00:00:00")
    : null;

  let candidate: Date | null = null;

  for (const slot of schedule.slots) {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const d = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), startH, startM, 0, 0);
    const currentDay = fromDate.getDay();
    let daysToAdd = (slot.dayOfWeek - currentDay + 7) % 7;
    if (daysToAdd === 0 && fromDate >= d) daysToAdd = 7;
    d.setDate(d.getDate() + daysToAdd);

    if (d <= fromDate) continue;
    if (termEnd && d > termEnd) continue;
    if (termStart) {
      const termStartDate = new Date(schedule.termStart! + "T00:00:00");
      if (d < termStartDate) continue;
    }

    if (!candidate || d < candidate) candidate = d;
  }

  return candidate;
}

/**
 * Sorts classes by next occurrence (soonest first). Classes with no next occurrence go to the end.
 */
export function sortClassesByNextOccurrence(
  classes: Class[],
  fromDate: Date
): Class[] {
  return [...classes].sort((a, b) => {
    const nextA = getNextOccurrence(a.schedule, fromDate);
    const nextB = getNextOccurrence(b.schedule, fromDate);
    if (!nextA && !nextB) return 0;
    if (!nextA) return 1;
    if (!nextB) return -1;
    return nextA.getTime() - nextB.getTime();
  });
}

/**
 * Formats the next occurrence for display, e.g. "月 09:00". Returns null if no next occurrence.
 */
export function formatNextOccurrence(
  schedule: ClassSchedule | null | undefined,
  fromDate: Date,
  locale: string
): string | null {
  const next = getNextOccurrence(schedule, fromDate);
  if (!next) return null;
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(next);
  const time = next.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${weekday} ${time}`;
}
