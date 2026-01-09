import { toZonedTime } from 'date-fns-tz';
import { isAfter, isBefore } from 'date-fns';
import { FunctionConfig, TimeWindow } from './types.js';

export type ScheduleCheckResult =
  | { allowed: true; reason?: string }
  | { allowed: false; reason: string };

const weekdayMap: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

function buildWindow(date: Date, window: TimeWindow, timezone: string) {
  const [startHour, startMinute] = window.start.split(':').map(Number);
  const [endHour, endMinute] = window.end.split(':').map(Number);

  // Get the zoned date to extract year/month/day in the target timezone
  const zoned = toZonedTime(date, timezone);
  const year = zoned.getFullYear();
  const month = zoned.getMonth();
  const day = zoned.getDate();

  // Create start and end times in the target timezone
  // Use UTC methods to avoid local timezone conversion issues
  const start = new Date(Date.UTC(year, month, day, startHour, startMinute, 0, 0));
  const end = new Date(Date.UTC(year, month, day, endHour, endMinute, 0, 0));

  // Convert to zoned time for comparison
  const zonedStart = toZonedTime(start, timezone);
  const zonedEnd = toZonedTime(end, timezone);

  return { zonedStart, zonedEnd };
}

function isWithinWindow(now: Date, window: TimeWindow, timezone: string) {
  const { zonedStart, zonedEnd } = buildWindow(now, window, timezone);
  const zonedNow = toZonedTime(now, timezone);

  // Normal window (start < end)
  if (isBefore(zonedStart, zonedEnd) || zonedStart.getTime() === zonedEnd.getTime()) {
    return (isAfter(zonedNow, zonedStart) || zonedNow.getTime() === zonedStart.getTime()) && isBefore(zonedNow, zonedEnd);
  }

  // Overnight window (e.g., 22:00-02:00)
  return isAfter(zonedNow, zonedStart) || isBefore(zonedNow, zonedEnd);
}

export function evaluateSchedule(config: FunctionConfig, nowUtc: Date = new Date()): ScheduleCheckResult {
  if (!config.enabled) {
    return { allowed: false, reason: 'Function is disabled' };
  }

  const zoned = toZonedTime(nowUtc, config.timezone);
  const weekday = weekdayMap[zoned.getDay()];
  if (!weekday || !config.days_of_week.includes(weekday as typeof config.days_of_week[number])) {
    return { allowed: false, reason: `Day ${weekday || 'unknown'} not allowed` };
  }

  const match = config.windows.some((window) => isWithinWindow(zoned, window, config.timezone));
  if (!match) {
    return { allowed: false, reason: 'Outside allowed hours' };
  }

  return { allowed: true };
}

