import { isoWeekNumber, seriesKeyOf, type Clash, type Session } from '@/app/schedule';
import type { SessionBadge, SessionChip } from '../types';

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

export const sessionsOnDay = <T extends { dateKey: string }>(items: T[], dateKey: string): T[] =>
  items.filter((item) => item.dateKey === dateKey);

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

const BADGE_CHIPS: Record<SessionBadge, SessionChip> = {
  swapped: { type: 'swapped' },
  skipping: { type: 'skipping' },
  swapUnavailable: { type: 'swapUnavailable' },
};

export const sessionBadges = (
  skipped: Session[],
  swappedIn: Set<string>,
  unavailableSwaps: Set<string>,
): Map<string, SessionBadge> =>
  new Map<string, SessionBadge>([
    ...[...swappedIn].map((id): [string, SessionBadge] => [id, 'swapped']),
    ...[...unavailableSwaps].map((id): [string, SessionBadge] => [id, 'swapUnavailable']),
    ...skipped.map((session): [string, SessionBadge] => [session.id, 'skipping']),
  ]);

export const sessionChips = (
  session: Session,
  previous: Session | undefined,
  clashes: Clash[] | undefined,
  badge: SessionBadge | null = null,
): SessionChip[] => [
  ...(badge ? [BADGE_CHIPS[badge]] : []),
  ...(session.cancelled ? [{ type: 'cancelled' } as const] : []),
  ...clashChip(clashes),
  ...(previous && previous.locationIds.join() !== session.locationIds.join() ? [{ type: 'roomChanged' } as const] : []),
];
