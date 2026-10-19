import { addDaysToDateKey, toDateKey, weekdayIndex } from './time';
import type { DateRange, Holiday } from './types';

const FRIDAY = 4;
const SATURDAY = 5;

// Anonymous Gregorian algorithm (Meeus/Jones/Butcher).
export const easterSundayKey = (year: number): string => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toDateKey(year, month, day);
};

const firstWeekdayFrom = (dateKey: string, weekday: number): string =>
  addDaysToDateKey(dateKey, (weekday - weekdayIndex(dateKey) + 7) % 7);

export const finnishHolidays = (year: number): Holiday[] => {
  const easter = easterSundayKey(year);
  const holidays: Holiday[] = [
    { dateKey: toDateKey(year, 1, 1), id: 'newYear' },
    { dateKey: toDateKey(year, 1, 6), id: 'epiphany' },
    { dateKey: addDaysToDateKey(easter, -2), id: 'goodFriday' },
    { dateKey: easter, id: 'easterSunday' },
    { dateKey: addDaysToDateKey(easter, 1), id: 'easterMonday' },
    { dateKey: toDateKey(year, 5, 1), id: 'mayDay' },
    { dateKey: addDaysToDateKey(easter, 39), id: 'ascension' },
    { dateKey: addDaysToDateKey(easter, 49), id: 'whitsun' },
    { dateKey: firstWeekdayFrom(toDateKey(year, 6, 19), FRIDAY), id: 'midsummerEve' },
    { dateKey: firstWeekdayFrom(toDateKey(year, 6, 20), SATURDAY), id: 'midsummerDay' },
    { dateKey: firstWeekdayFrom(toDateKey(year, 10, 31), SATURDAY), id: 'allSaints' },
    { dateKey: toDateKey(year, 12, 6), id: 'independence' },
    { dateKey: toDateKey(year, 12, 24), id: 'christmasEve' },
    { dateKey: toDateKey(year, 12, 25), id: 'christmasDay' },
    { dateKey: toDateKey(year, 12, 26), id: 'stStephens' },
  ];
  return [...holidays].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
};

export const holidaysInRange = (range: DateRange): Holiday[] => {
  const firstYear = Number(range.startKey.slice(0, 4));
  const lastYear = Number(range.endKey.slice(0, 4));
  return Array.from({ length: lastYear - firstYear + 1 }, (_, offset) => finnishHolidays(firstYear + offset))
    .flat()
    .filter((holiday) => holiday.dateKey >= range.startKey && holiday.dateKey < range.endKey);
};
