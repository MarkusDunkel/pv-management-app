export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = MINUTE_MS * 60;
export const DAY_MS = HOUR_MS * 24;

export const toDateTimeString = (date: Date) =>
  date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const toTimeString = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const toDateString = (date: Date) =>
  date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

export const diffInDaysLocal = (a: Date, b: Date): number => {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
};

/**
 * Returns true if the given timestamp (ms since epoch)
 * is within ±15 minutes of local midnight.
 */
export function isAroundMidnight(timestamp: number): boolean {
  const date = new Date(timestamp);
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);

  const diff = Math.abs(timestamp - midnight.getTime());
  const FIFTEEN_MIN_MS = 15 * MINUTE_MS;

  // Handle the case where time is just after midnight (next day's 00:00)
  const nextMidnight = new Date(midnight);
  nextMidnight.setDate(midnight.getDate() + 1);
  const diffToNext = Math.abs(nextMidnight.getTime() - timestamp);

  return diff <= FIFTEEN_MIN_MS || diffToNext <= FIFTEEN_MIN_MS;
}
