import { isoWeekNumber, seriesKeyOf, type Clash, type Session } from '@/app/schedule';
import type { SessionChip } from '../types';

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

export const sessionsOnDay = (sessions: Session[], dateKey: string): Session[] =>
  sessions.filter((session) => session.dateKey === dateKey);

export const sessionsInRange = (sessions: Session[], startKey: string, endKey: string): Session[] =>
  sessions.filter((session) => session.dateKey >= startKey && session.dateKey < endKey);

export const seriesOf = (seriesKey: string, sessions: Session[]): Session[] =>
  sessions.filter((session) => seriesKeyOf(session) === seriesKey).sort(byStart);

export const groupByWeek = (sessions: Session[]): { week: number; sessions: Session[] }[] =>
  sessions.reduce<{ week: number; sessions: Session[] }[]>((groups, session) => {
    const week = isoWeekNumber(session.dateKey);
    const last = groups[groups.length - 1];
    return last && last.week === week
      ? [...groups.slice(0, -1), { week, sessions: [...last.sessions, session] }]
      : [...groups, { week, sessions: [session] }];
  }, []);

const clashChip = (clashes: Clash[] | undefined): SessionChip[] => {
  if (!clashes || clashes.length === 0) return [];
  return clashes.some((clash) => clash.kind === 'full')
    ? [{ type: 'clash' }]
    : [{ type: 'partialClash', minutes: Math.max(...clashes.map((clash) => clash.minutes)) }];
};

export const sessionChips = (
  session: Session,
  previous: Session | undefined,
  clashes: Clash[] | undefined,
): SessionChip[] => [
  ...(session.cancelled ? [{ type: 'cancelled' } as const] : []),
  ...clashChip(clashes),
  ...(previous && previous.locationIds.join() !== session.locationIds.join() ? [{ type: 'roomChanged' } as const] : []),
];
