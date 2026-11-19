import { site, type OpeningInterval } from '@/data/site';

export interface OpenStatus {
  isOpen: boolean;
  currentInterval: OpeningInterval | null;
  nextOpening: {
    day: OpeningInterval['day'];
    dayIndex: number;
    open: string;
    isToday: boolean;
  } | null;
}

/**
 * Converts "HH:MM" into minutes since midnight (0..1439).
 */
export function timeToMinutes(hhmm: string): number {
  const parts = hhmm.split(':');
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

/**
 * Extracts local Madrid time components (dayIndex 0..6, minutes 0..1439) from a Date.
 * When `useUtcAsLocal` is true (useful for deterministic unit tests), reads UTC getters directly.
 */
export function getLocalTimeParts(
  date: Date = new Date(),
  useUtcAsLocal = false
): { dayIndex: number; minutes: number; hhmm: string } {
  if (useUtcAsLocal) {
    const dayIndex = date.getUTCDay();
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const hhmm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return { dayIndex, minutes: h * 60 + m, hhmm };
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minuteStr = parts.find((p) => p.type === 'minute')?.value ?? '00';

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayIndex = dayMap[weekdayStr] ?? date.getDay();
  const h = Number(hourStr) % 24;
  const m = Number(minuteStr);
  const hhmm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return { dayIndex, minutes: h * 60 + m, hhmm };
}

/**
 * Evaluates whether the restaurant is currently open and when it next opens.
 */
export function getOpenStatus(
  date: Date = new Date(),
  intervals: OpeningInterval[] = site.hours,
  useUtcAsLocal = false
): OpenStatus {
  if (intervals.length === 0) {
    return { isOpen: false, currentInterval: null, nextOpening: null };
  }

  const { dayIndex, minutes } = getLocalTimeParts(date, useUtcAsLocal);

  const todayIntervals = intervals
    .filter((i) => i.dayIndex === dayIndex)
    .sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));

  for (const interval of todayIntervals) {
    const start = timeToMinutes(interval.open);
    const end = timeToMinutes(interval.close);
    if (minutes >= start && minutes < end) {
      return {
        isOpen: true,
        currentInterval: interval,
        nextOpening: null,
      };
    }
  }

  // Check if there is a later interval today
  for (const interval of todayIntervals) {
    const start = timeToMinutes(interval.open);
    if (start > minutes) {
      return {
        isOpen: false,
        currentInterval: null,
        nextOpening: {
          day: interval.day,
          dayIndex: interval.dayIndex,
          open: interval.open,
          isToday: true,
        },
      };
    }
  }

  // Otherwise check the next 7 days in order
  for (let offset = 1; offset <= 7; offset++) {
    const targetDay = (dayIndex + offset) % 7;
    const dayIntervals = intervals
      .filter((i) => i.dayIndex === targetDay)
      .sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));

    const first = dayIntervals[0];
    if (first) {
      return {
        isOpen: false,
        currentInterval: null,
        nextOpening: {
          day: first.day,
          dayIndex: first.dayIndex,
          open: first.open,
          isToday: false,
        },
      };
    }
  }

  return { isOpen: false, currentInterval: null, nextOpening: null };
}

/**
 * Generates 15-minute pickup time slots for today's opening intervals.
 */
export function getPickupTimeSlots(
  date: Date = new Date(),
  intervals: OpeningInterval[] = site.hours,
  useUtcAsLocal = false
): string[] {
  const { dayIndex } = getLocalTimeParts(date, useUtcAsLocal);
  const todayIntervals = intervals
    .filter((i) => i.dayIndex === dayIndex)
    .sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));

  const targetIntervals =
    todayIntervals.length > 0
      ? todayIntervals
      : intervals.filter((i) => i.dayIndex === 5); // fallback to Friday slots if day has none

  const slots: string[] = [];
  for (const interval of targetIntervals) {
    const start = timeToMinutes(interval.open) + 15; // first pickup 15m after open
    const end = timeToMinutes(interval.close);
    for (let t = start; t <= end; t += 15) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0');
      const mm = String(t % 60).padStart(2, '0');
      const label = `${hh}:${mm}`;
      if (!slots.includes(label)) {
        slots.push(label);
      }
    }
  }
  return slots;
}
