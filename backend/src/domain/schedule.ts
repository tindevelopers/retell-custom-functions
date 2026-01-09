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

  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);
  const zonedStart = toZonedTime(start, timezone);

  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);
  const zonedEnd = toZonedTime(end, timezone);

  return { zonedStart, zonedEnd };
}

function isWithinWindow(now: Date, window: TimeWindow, timezone: string) {
  const { zonedStart, zonedEnd } = buildWindow(now, window, timezone);

  // Normal window (start < end)
  if (isBefore(zonedStart, zonedEnd) || zonedStart.getTime() === zonedEnd.getTime()) {
    return isAfter(now, zonedStart) && isBefore(now, zonedEnd);
  }

  // Overnight window (e.g., 22:00-02:00)
  return isAfter(now, zonedStart) || isBefore(now, zonedEnd);
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

