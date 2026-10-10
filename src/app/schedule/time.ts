export const HELSINKI_TIME_ZONE = 'Europe/Helsinki';

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: HELSINKI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

interface HelsinkiParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const pad = (value: number): string => String(value).padStart(2, '0');

const parseDateKey = (dateKey: string): { year: number; month: number; day: number } => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
};

const dateKeyToUtcMs = (dateKey: string): number => {
  const { year, month, day } = parseDateKey(dateKey);
  return Date.UTC(year, month - 1, day);
};

const utcMsToDateKey = (ms: number): string => {
  const date = new Date(ms);
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
};

export const toDateKey = (year: number, month: number, day: number): string => `${year}-${pad(month)}-${pad(day)}`;

export const getHelsinkiParts = (instant: Date): HelsinkiParts => {
  const parts = Object.fromEntries(partsFormatter.formatToParts(instant).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
};

export const helsinkiDateKey = (instant: Date): string => {
  const { year, month, day } = getHelsinkiParts(instant);
  return toDateKey(year, month, day);
};

export const helsinkiMinutesOfDay = (instant: Date): number => {
  const { hour, minute } = getHelsinkiParts(instant);
  return hour * 60 + minute;
};

const helsinkiOffsetMinutes = (instant: Date): number => {
  const { year, month, day, hour, minute } = getHelsinkiParts(instant);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const instantToMinute = Math.floor(instant.getTime() / MINUTE_MS) * MINUTE_MS;
  return Math.round((wallAsUtc - instantToMinute) / MINUTE_MS);
};

// Two passes: the first guess can land on the wrong side of a DST switch.
export const helsinkiWallTimeToInstant = (dateKey: string, minutesOfDay: number): Date => {
  const { year, month, day } = parseDateKey(dateKey);
  const wallAsUtc = Date.UTC(year, month - 1, day, 0, minutesOfDay);
  const firstGuess = new Date(wallAsUtc - helsinkiOffsetMinutes(new Date(wallAsUtc)) * MINUTE_MS);
  return new Date(wallAsUtc - helsinkiOffsetMinutes(firstGuess) * MINUTE_MS);
};

export const addDaysToDateKey = (dateKey: string, days: number): string =>
  utcMsToDateKey(dateKeyToUtcMs(dateKey) + days * DAY_MS);

export const addMonthsToDateKey = (dateKey: string, months: number): string => {
  const { year, month, day } = parseDateKey(dateKey);
  const lastDayOfTarget = new Date(Date.UTC(year, month - 1 + months + 1, 0)).getUTCDate();
  return utcMsToDateKey(Date.UTC(year, month - 1 + months, Math.min(day, lastDayOfTarget)));
};

export const daysBetween = (fromKey: string, toKey: string): number =>
  Math.round((dateKeyToUtcMs(toKey) - dateKeyToUtcMs(fromKey)) / DAY_MS);

export const weekdayIndex = (dateKey: string): number => (new Date(dateKeyToUtcMs(dateKey)).getUTCDay() + 6) % 7;

export const startOfWeekKey = (dateKey: string): string => addDaysToDateKey(dateKey, -weekdayIndex(dateKey));

export const isoWeekNumber = (dateKey: string): number => {
  const thursday = addDaysToDateKey(dateKey, 3 - weekdayIndex(dateKey));
  const weekOneMonday = startOfWeekKey(toDateKey(parseDateKey(thursday).year, 1, 4));
  return Math.floor(daysBetween(weekOneMonday, thursday) / 7) + 1;
};

export const todayKey = (now: Date = new Date()): string => helsinkiDateKey(now);
