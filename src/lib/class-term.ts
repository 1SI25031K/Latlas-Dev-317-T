import type { ClassSchedule } from "@/types/database";

export function localDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Term ended: termEnd is strictly before today's local date */
export function isClassTermEnded(
  schedule: { termEnd?: string | null } | null | undefined,
  now: Date = new Date()
): boolean {
  const te = schedule?.termEnd?.trim();
  if (!te) return false;
  return te < localDateYMD(now);
}

/** YYYY-MM-DD must be strictly after today (local) */
export function isTermEndDateValid(termEnd: string, now: Date = new Date()): boolean {
  const t = termEnd.trim();
  if (!t) return true;
  return t > localDateYMD(now);
}

export function utcDateYMD(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Server-side: term end must be after UTC "today" if set */
export function isTermEndValidForServer(termEnd: string): boolean {
  const t = termEnd.trim();
  if (!t) return true;
  return t > utcDateYMD(new Date());
}
