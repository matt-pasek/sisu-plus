import type { CalendarGroup, CalendarGroupSet } from '@/app/api/dataPoints/calendar/types';
import { classifySessionKind, type SessionKind } from '@/app/schedule';

const EVERYONE_SUFFIX = /\s+(for everyone|kaikille)$/i;
const IMPLEMENTATION_NUMBER = /^\s+\d+\b/;

export const choosableGroups = (set: CalendarGroupSet): CalendarGroup[] =>
  set.groups.filter((group) => !group.cancelled && group.eventIds.length > 0);

export const groupKind = (group: CalendarGroup): SessionKind => classifySessionKind([group.name], false);

const switchedOn = (groups: CalendarGroup[]): number => groups.filter((group) => group.isInCalendar).length;

export const alternativeGroups = (set: CalendarGroupSet): CalendarGroup[] => {
  const groups = choosableGroups(set);
  const kinds = [...new Set(groups.map(groupKind))];
  return kinds
    .map((kind) => groups.filter((group) => groupKind(group) === kind))
    .filter((cluster) => cluster.length >= 2)
    .reduce<CalendarGroup[]>(
      (best, cluster) =>
        switchedOn(cluster) > switchedOn(best) ||
        (switchedOn(cluster) === switchedOn(best) && cluster.length > best.length)
          ? cluster
          : best,
      [],
    );
};

export const shortGroupName = (name: string | null, code: string | null): string | null => {
  if (!name) return name;
  const withoutCode = code && name.startsWith(code) ? name.slice(code.length).replace(IMPLEMENTATION_NUMBER, '') : name;
  const short = withoutCode.replace(EVERYONE_SUFFIX, '').trim();
  return short.length > 0 ? short : name;
};
