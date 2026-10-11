import {
  busyMinutes,
  dayShape,
  helsinkiDateKey,
  helsinkiMinutesOfDay,
  isoWeekNumber,
  seriesKeyOf,
  startOfWeekKey,
  weekdayIndex,
  type Clash,
  type Session,
} from '@/app/schedule';
import type { MonthCell, MonthException, MonthInput, MonthWeek } from '../types';
import { monthGrid } from './dates';

const WEEKDAYS = 5;

const locationKey = (session: Session): string => [...session.locationIds].sort().join('|');

const slotKey = (session: Session): string =>
  `${seriesKeyOf(session)}|${weekdayIndex(session.dateKey)}|${helsinkiMinutesOfDay(session.start)}`;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

// A group can meet in a different room on each weekday, and a slot can move for good between periods,
// so only a week that differs from the same slot's room the week before and after is a one-off change.
export const roomChangeIds = (sessions: Session[]): Set<string> => {
  const located = sessions.filter(
    (session) => !session.cancelled && session.source === 'sisu' && session.locationIds.length > 0,
  );
  const slots = [...new Set(located.map(slotKey))];
  return new Set(
    slots.flatMap((slot) => {
      const members = located.filter((session) => slotKey(session) === slot).sort(byStart);
      return members
        .filter((session, index) => {
          const before = members[index - 1];
          const after = members[index + 1];
          return (
            before != null &&
            after != null &&
            locationKey(before) === locationKey(after) &&
            locationKey(session) !== locationKey(before)
          );
        })
        .map((session) => session.id);
    }),
  );
};

const exceptionsFor = (
  dateKey: string,
  day: Session[],
  live: Session[],
  clashes: Clash[],
  input: MonthInput,
): MonthException[] => [
  ...input.periods
    .filter((period) => period.startDate === dateKey)
    .map((period): MonthException => ({ kind: 'periodStart', name: period.name })),
  ...input.holidays
    .filter((holiday) => holiday.dateKey === dateKey)
    .map((holiday): MonthException => ({ kind: 'holiday', holiday })),
  ...(weekdayIndex(dateKey) < WEEKDAYS && input.noTeachingWeeks.has(startOfWeekKey(dateKey))
    ? [{ kind: 'noTeaching' } as const]
    : []),
  ...live.filter((session) => session.kind === 'exam').map((session): MonthException => ({ kind: 'exam', session })),
  ...clashes.map((clash): MonthException => ({ kind: 'clash', clash })),
  ...live
    .filter((session) => input.roomChangeIds.has(session.id))
    .map((session): MonthException => ({ kind: 'roomChange', session })),
  ...(input.showCancelled
    ? day.filter((session) => session.cancelled).map((session): MonthException => ({ kind: 'cancelled', session }))
    : []),
];

const monthCell = (dateKey: string, input: MonthInput): MonthCell => {
  const base = {
    dateKey,
    inMonth: dateKey.slice(0, 7) === input.monthKey.slice(0, 7),
    isToday: dateKey === input.todayKey,
    isWeekend: weekdayIndex(dateKey) >= WEEKDAYS,
  };
  if (!base.inMonth) return { ...base, minutes: 0, shape: [], hasClash: false, exceptions: [] };
  const day = input.attended.filter((session) => session.dateKey === dateKey);
  const live = day.filter((session) => !session.cancelled);
  const clashes = input.clashes.filter((clash) => helsinkiDateKey(clash.start) === dateKey);
  const clashingIds = new Set(clashes.flatMap((clash) => clash.sessionIds));
  return {
    ...base,
    minutes: busyMinutes(live),
    shape: dayShape(live, clashingIds),
    hasClash: clashes.length > 0,
    exceptions: exceptionsFor(dateKey, day, live, clashes, input),
  };
};

export const monthWeeks = (input: MonthInput): MonthWeek[] =>
  monthGrid(input.monthKey).map((week) => ({
    weekKey: week[0],
    weekNumber: isoWeekNumber(week[0]),
    isCurrent: week.includes(input.todayKey),
    cells: week.map((dateKey) => monthCell(dateKey, input)),
  }));
