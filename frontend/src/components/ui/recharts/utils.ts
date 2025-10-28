import { isAroundMidnight, toDateString, toTimeString } from '@/components/date-utils';

/**
 * Returns an array of timestamps for every 2 hours between the min and max dates,
 * aligned to local time. Includes all midnights and 2-hour intervals in between.
 * Handles DST transitions correctly.
 */
export const getHourTicks = (dates: number[], res: number): number[] => {
  if (!dates?.length) return [];

  const minTs = Math.min(...dates);
  const maxTs = Math.max(...dates);

  // Normalize start and end to local midnights
  const start = new Date(minTs);
  start.setHours(0, 0, 0, 0);

  const end = new Date(maxTs);
  //   end.setDays(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);
  end.setHours(0, 0, 0, 0);

  const ticks: number[] = [];
  const cur = new Date(start);

  while (cur.getTime() <= maxTs) {
    ticks.push(cur.getTime());
    cur.setHours(cur.getHours() + res);
  }

  return ticks.filter((it) => it >= minTs);
};

export const getMidnightTicks = (dates: number[]): number[] => {
  if (!dates?.length) return [];

  const minTs = Math.min(...dates);
  const maxTs = Math.max(...dates);

  const start = new Date(minTs);
  start.setHours(0, 0, 0, 0);

  const end = new Date(maxTs);
  end.setHours(0, 0, 0, 0);

  const ticks: number[] = [];
  const cur = new Date(start);

  while (cur.getTime() <= end.getTime()) {
    ticks.push(cur.getTime());
    cur.setDate(cur.getDate() + 1);
    cur.setHours(0, 0, 0, 0);
  }

  return ticks.filter((it) => it >= minTs);
};

export const daytimeResolvedTickFormatter = (label: number) => {
  if (isAroundMidnight(label)) {
    return toDateString(new Date(label));
  }

  return toTimeString(new Date(label));
};
