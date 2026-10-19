import { addDaysToDateKey, daysBetween, startOfWeekKey } from './time';
import type { DateRange, PeriodSpan, Session } from './types';

const isTeaching = (session: Session): boolean => !session.cancelled && session.kind !== 'exam';

const mondaysIn = (span: DateRange): string[] => {
  const first = startOfWeekKey(span.startKey);
  const count = Math.ceil(daysBetween(first, span.endKey) / 7);
  return Array.from({ length: count }, (_, index) => addDaysToDateKey(first, index * 7));
};

// Only periods the student is otherwise taught in count, so a term without enrolments stays quiet.
export const noTeachingWeeks = (sessions: Session[], periods: PeriodSpan[], range: DateRange): Set<string> => {
  const teaching = sessions.filter(isTeaching);
  const taughtWeeks = new Set(teaching.map((session) => startOfWeekKey(session.dateKey)));
  return new Set(
    periods.flatMap((period) => {
      const startKey = period.startDate > range.startKey ? period.startDate : range.startKey;
      const endKey = period.endDate < range.endKey ? period.endDate : range.endKey;
      if (startKey >= endKey) return [];
      const taughtInPeriod = teaching.some((session) => session.dateKey >= startKey && session.dateKey < endKey);
      if (!taughtInPeriod) return [];
      return mondaysIn({ startKey, endKey }).filter(
        (monday) => monday >= startKey && addDaysToDateKey(monday, 5) <= endKey && !taughtWeeks.has(monday),
      );
    }),
  );
};
