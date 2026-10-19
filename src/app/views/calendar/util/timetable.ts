import type { Session } from '@/app/schedule';
import { weeklyPattern } from './groups';

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

const dayMonth = (dateKey: string): string => `${Number(dateKey.slice(8, 10))}.${Number(dateKey.slice(5, 7))}.`;

export const previewSummary = (
  sessions: Session[],
  locale: string,
): { count: number; first: string | null; last: string | null; pattern: string | null } => {
  const active = sessions.filter((session) => !session.cancelled).sort(byStart);
  const first = active[0];
  const last = active[active.length - 1];
  return {
    count: active.length,
    first: first ? dayMonth(first.dateKey) : null,
    last: last ? dayMonth(last.dateKey) : null,
    pattern: weeklyPattern(active, locale),
  };
};
