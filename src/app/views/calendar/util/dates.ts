import { addDaysToDateKey, addMonthsToDateKey, daysBetween, startOfWeekKey } from '@/app/schedule';

export const weekDateKeys = (anchorKey: string): string[] => {
  const monday = startOfWeekKey(anchorKey);
  return Array.from({ length: 7 }, (_, index) => addDaysToDateKey(monday, index));
};

export const monthStartKey = (dateKey: string): string => `${dateKey.slice(0, 7)}-01`;

export const monthGrid = (monthKey: string): string[][] => {
  const first = monthStartKey(monthKey);
  const last = addDaysToDateKey(addMonthsToDateKey(first, 1), -1);
  const firstMonday = startOfWeekKey(first);
  const weekCount = Math.floor(daysBetween(firstMonday, last) / 7) + 1;
  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDaysToDateKey(firstMonday, week * 7 + day)),
  );
};

export const findPeriodName = (
  dateKey: string,
  periods: { name: string; startDate: string; endDate: string }[],
): string | null => periods.find((period) => period.startDate <= dateKey && dateKey < period.endDate)?.name ?? null;
