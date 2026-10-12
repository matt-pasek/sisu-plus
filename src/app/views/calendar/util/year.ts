import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import {
  addDaysToDateKey,
  addMonthsToDateKey,
  busyMinutes,
  daysBetween,
  helsinkiDateKey,
  isoWeekNumber,
  startOfWeekKey,
  termRangeFor,
  type DateRange,
  type Session,
} from '@/app/schedule';
import type { HeavyWeek, LoadLevel, YearBand, YearInput, YearWeek } from '../types';
import { formatMonthShort } from './format';

const WEEKDAYS = 5;
const THURSDAY_OFFSET = 3;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

export const loadLevel = (minutes: number): LoadLevel => {
  if (minutes <= 0) return 0;
  if (minutes <= 120) return 1;
  if (minutes <= 240) return 2;
  if (minutes <= 360) return 3;
  return 4;
};

export const yearWeeks = (input: YearInput): YearWeek[] => {
  const first = startOfWeekKey(input.range.startKey);
  const count = Math.ceil(daysBetween(first, input.range.endKey) / 7);
  const live = input.attended.filter((session) => !session.cancelled);
  const clashDays = new Set(input.clashes.map((clash) => helsinkiDateKey(clash.start)));
  const holidays = new Map(input.holidays.map((holiday) => [holiday.dateKey, holiday]));
  const currentWeek = startOfWeekKey(input.todayKey);
  const deadlineCounts = input.deadlines.reduce(
    (counts, deadline) => new Map(counts).set(deadline.dateKey, (counts.get(deadline.dateKey) ?? 0) + 1),
    new Map<string, number>(),
  );
  return Array.from({ length: count }, (_, weekIndex) => {
    const weekKey = addDaysToDateKey(first, weekIndex * 7);
    return {
      weekKey,
      weekNumber: isoWeekNumber(weekKey),
      isCurrent: weekKey === currentWeek,
      days: Array.from({ length: WEEKDAYS }, (_, dayIndex) => {
        const dateKey = addDaysToDateKey(weekKey, dayIndex);
        const inYear = dateKey >= input.range.startKey && dateKey < input.range.endKey;
        const day = inYear ? live.filter((session) => session.dateKey === dateKey) : [];
        const minutes = busyMinutes(day);
        return {
          dateKey,
          inYear,
          minutes,
          level: loadLevel(minutes),
          exam: day.some((session) => session.kind === 'exam'),
          clash: inYear && clashDays.has(dateKey),
          holiday: inYear ? (holidays.get(dateKey) ?? null) : null,
          isToday: dateKey === input.todayKey,
          deadlines: inYear ? (deadlineCounts.get(dateKey) ?? 0) : 0,
        };
      }),
    };
  });
};

const spanOf = (weeks: YearWeek[], startKey: string, endKey: string): { from: number; to: number } | null => {
  const indexes = weeks
    .map((week, index) => ({ week, index }))
    .filter(({ week }) => week.weekKey < endKey && addDaysToDateKey(week.weekKey, 7) > startKey)
    .map(({ index }) => index);
  return indexes.length > 0 ? { from: indexes[0], to: indexes[indexes.length - 1] } : null;
};

export const periodBands = (
  weeks: YearWeek[],
  periods: { name: string; startDate: string; endDate: string }[],
): YearBand[] =>
  periods.flatMap((period) => {
    const span = spanOf(weeks, period.startDate, period.endDate);
    return span ? [{ kind: 'period' as const, label: period.name, ...span }] : [];
  });

const mergeRuns = (weeks: YearWeek[], kind: YearBand['kind'], labelOf: (week: YearWeek) => string | null) =>
  weeks.reduce<YearBand[]>((bands, week, index) => {
    const label = labelOf(week);
    if (label == null) return bands;
    const last = bands[bands.length - 1];
    return last && last.label === label && last.to === index - 1
      ? [...bands.slice(0, -1), { ...last, to: index }]
      : [...bands, { kind, label, from: index, to: index }];
  }, []);

export const noTeachingBands = (weeks: YearWeek[], noTeaching: Set<string>, label: string): YearBand[] =>
  mergeRuns(weeks, 'noTeaching', (week) => (noTeaching.has(week.weekKey) ? label : null));

export const monthBands = (weeks: YearWeek[], locale: string): YearBand[] =>
  mergeRuns(weeks, 'month', (week) => formatMonthShort(addDaysToDateKey(week.weekKey, THURSDAY_OFFSET), locale));

export const heaviestWeeks = (weeks: YearWeek[], count = 3): HeavyWeek[] =>
  weeks
    .map((week) => ({
      weekKey: week.weekKey,
      weekNumber: week.weekNumber,
      minutes: week.days.reduce((sum, day) => sum + day.minutes, 0),
    }))
    .filter((week) => week.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes || a.weekKey.localeCompare(b.weekKey))
    .slice(0, count);

export const upcomingExams = (attended: Session[], todayKey: string, range: DateRange): Session[] => {
  const fromKey = todayKey >= range.startKey && todayKey < range.endKey ? todayKey : range.startKey;
  return attended
    .filter(
      (session) =>
        !session.cancelled && session.kind === 'exam' && session.dateKey >= fromKey && session.dateKey < range.endKey,
    )
    .sort(byStart);
};

export const emptyFutureTerm = (range: DateRange, attended: Session[], todayKey: string): DateRange | null => {
  const terms = [termRangeFor(range.startKey), termRangeFor(addMonthsToDateKey(range.startKey, 6))];
  return (
    terms.find(
      (term) =>
        term.startKey > todayKey &&
        !attended.some((session) => session.dateKey >= term.startKey && session.dateKey < term.endKey),
    ) ?? null
  );
};

export const plannedCourseCount = (
  courses: Pick<TimelineCourse, 'isEnrolled' | 'plannedPeriods'>[],
  term: DateRange,
): number =>
  courses.filter(
    (course) =>
      !course.isEnrolled &&
      course.plannedPeriods.some((period) => period.startDate < term.endKey && period.endDate > term.startKey),
  ).length;
