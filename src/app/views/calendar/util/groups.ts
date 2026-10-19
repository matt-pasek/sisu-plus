import type { CalendarCourse, CalendarGroup, CalendarGroupSet } from '@/app/api/dataPoints/calendar/types';
import { alternativeGroups, choosableGroups } from './groupChoice';
import {
  helsinkiMinutesOfDay,
  statsForCandidate,
  uniqueBy,
  weekdayIndex,
  type AttendancePlan,
  type GroupRef,
  type GroupStats,
  type Session,
} from '@/app/schedule';
import type { PreviewModel } from '../types';
import { formatClock, formatWeekday } from './format';

const MAX_PATTERN_SLOTS = 3;
const EMPTY_PREVIEW: PreviewModel = { sessions: [], clashIds: new Set() };

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

const slotKey = (session: Session): string =>
  `${weekdayIndex(session.dateKey)}|${formatClock(session.start)}|${formatClock(session.end)}`;

const bySlotOrder = (a: Session[], b: Session[]): number =>
  weekdayIndex(a[0].dateKey) - weekdayIndex(b[0].dateKey) ||
  helsinkiMinutesOfDay(a[0].start) - helsinkiMinutesOfDay(b[0].start);

export const weeklyPattern = (sessions: Session[], locale: string): string | null => {
  const active = sessions.filter((session) => !session.cancelled);
  if (active.length === 0) return null;
  const slots = [...new Set(active.map(slotKey))].map((key) => active.filter((session) => slotKey(session) === key));
  const repeated = slots.filter((slot) => slot.length >= 2);
  const chosen = repeated.length > 0 ? [...repeated].sort(bySlotOrder).slice(0, MAX_PATTERN_SLOTS) : [slots[0]];
  return chosen
    .map(([first]) => `${formatWeekday(first.dateKey, locale)} ${formatClock(first.start)}–${formatClock(first.end)}`)
    .join(', ');
};

export const sessionsByGroup = (candidates: Session[], courseKey: string): Map<string, Session[]> => {
  const own = candidates.filter((session) => session.courseKey === courseKey && session.groupId != null);
  const groupIds = [...new Set(own.map((session) => session.groupId as string))];
  return new Map(
    groupIds.map((groupId) => [
      groupId,
      uniqueBy(
        own.filter((session) => session.groupId === groupId),
        (session) => session.id,
      ).sort(byStart),
    ]),
  );
};

const firstStart = (sessions: Session[] | undefined): number =>
  sessions?.[0]?.start.getTime() ?? Number.MAX_SAFE_INTEGER;

export const sortGroups = (
  groups: CalendarGroup[],
  stats: Map<string, GroupStats>,
  sessions: Map<string, Session[]>,
): CalendarGroup[] =>
  [...groups].sort(
    (a, b) =>
      (stats.get(a.id)?.clashing ?? 0) - (stats.get(b.id)?.clashing ?? 0) ||
      firstStart(sessions.get(a.id)) - firstStart(sessions.get(b.id)),
  );

export const previewModel = (
  candidates: Session[],
  attended: Session[],
  groups: Map<string, GroupRef>,
  groupId: string | null,
  startKey: string,
  endKey: string,
): PreviewModel => {
  const group = groupId ? groups.get(groupId) : undefined;
  if (!group) return EMPTY_PREVIEW;
  const attendedIds = new Set(attended.map((session) => session.id));
  const sessions = uniqueBy(
    candidates.filter(
      (session) =>
        session.groupId === group.id &&
        !session.cancelled &&
        !attendedIds.has(session.id) &&
        session.dateKey >= startKey &&
        session.dateKey < endKey,
    ),
    (session) => session.id,
  ).sort(byStart);
  const siblings = new Set(
    [...groups.values()]
      .filter((ref) => ref.courseKey === group.courseKey && ref.setId === group.setId)
      .map((ref) => ref.id),
  );
  const stats = statsForCandidate(sessions, attended, siblings);
  return {
    sessions,
    clashIds: new Set(stats.perSession.filter((entry) => entry.clashes).map((entry) => entry.sessionId)),
  };
};

export const promptId = (setId: string): string => `prompt:${setId}`;

export const hasGroupChoice = (course: CalendarCourse): boolean =>
  course.groupSets.some((set) => choosableGroups(set).length > 1);

export const requiredSetWithoutGroup = (course: CalendarCourse): string | null =>
  course.groupSets.find((set) => set.min >= 1 && !set.groups.some((group) => group.isInCalendar))?.id ?? null;

export const promptSets = (course: CalendarCourse, plan: AttendancePlan | undefined): CalendarGroupSet[] =>
  course.isInCalendar
    ? course.groupSets.filter(
        (set) =>
          alternativeGroups(set).filter((group) => group.isInCalendar).length >= 2 &&
          !plan?.usual[set.id] &&
          !plan?.dismissed.includes(promptId(set.id)),
      )
    : [];
