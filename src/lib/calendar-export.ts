import { addDays, parseISO, format } from "date-fns";
import { createEvents } from "ics";
import type { ClassSchedule, ClassScheduleSlot } from "@/types/database";

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

/** Get first occurrence of dayOfWeek on or after date (date is YYYY-MM-DD, dayOfWeek 0=Sun..6=Sat). */
function getFirstOccurrence(termStartStr: string, dayOfWeek: number): Date {
  const termStart = parseISO(termStartStr);
  const d0 = termStart.getDay();
  const diff = (dayOfWeek - d0 + 7) % 7;
  return addDays(termStart, diff);
}

/** Format date for Google Calendar: YYYYMMDDTHHmmss (local) or Z for UTC. We use local. */
function formatGoogleDate(d: Date, timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d2 = new Date(d);
  d2.setHours(h, m, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d2.getFullYear()}${pad(d2.getMonth() + 1)}${pad(d2.getDate())}T${pad(d2.getHours())}${pad(d2.getMinutes())}${pad(d2.getSeconds())}`;
}

/** UNTIL for RRULE: end of termEnd date in UTC. */
function formatUntil(termEndStr: string): string {
  const d = parseISO(termEndStr);
  d.setHours(23, 59, 59, 999);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T235959Z`;
}

export function buildGoogleCalendarUrl(
  title: string,
  slot: ClassScheduleSlot,
  termStart: string,
  termEnd: string
): string {
  const first = getFirstOccurrence(termStart, slot.dayOfWeek);
  const startStr = formatGoogleDate(first, slot.startTime);
  const endStr = formatGoogleDate(first, slot.endTime);
  const untilStr = formatUntil(termEnd);
  const byDay = BYDAY[slot.dayOfWeek];
  const base = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startStr}/${endStr}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${untilStr}`,
  });
  return `${base}?${params.toString()}`;
}

/** Build RRULE string (without "RRULE:" prefix) for ics. */
export function buildRrule(slot: ClassScheduleSlot, termEnd: string): string {
  const byDay = BYDAY[slot.dayOfWeek];
  const untilStr = formatUntil(termEnd);
  return `FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${untilStr}`;
}

export function getCalendarSlotParams(
  schedule: ClassSchedule | null | undefined
): { slots: ClassScheduleSlot[]; termStart: string; termEnd: string } | null {
  if (!schedule?.slots?.length) return null;
  const termStart = schedule.termStart || schedule.termEnd || format(new Date(), "yyyy-MM-dd");
  const termEnd = schedule.termEnd || termStart;
  return { slots: schedule.slots, termStart, termEnd };
}

/** Generate .ics file content for a class (multiple recurring events). Returns ics string or null. */
export function generateIcsForClass(
  title: string,
  schedule: ClassSchedule | null | undefined
): string | null {
  const params = getCalendarSlotParams(schedule);
  if (!params) return null;
  const { slots, termStart, termEnd } = params;
  const events: Parameters<typeof createEvents>[0] = slots.map((slot) => {
    const first = getFirstOccurrence(termStart, slot.dayOfWeek);
    const [sh, sm] = slot.startTime.split(":").map(Number);
    const [eh, em] = slot.endTime.split(":").map(Number);
    const start: [number, number, number, number, number] = [
      first.getFullYear(),
      first.getMonth() + 1,
      first.getDate(),
      sh,
      sm,
    ];
    const end: [number, number, number, number, number] = [
      first.getFullYear(),
      first.getMonth() + 1,
      first.getDate(),
      eh,
      em,
    ];
    return {
      title,
      start,
      end,
      recurrenceRule: buildRrule(slot, termEnd),
    };
  });
  const result = createEvents(events);
  if (result.error) return null;
  return result.value ?? null;
}
