import { helsinkiDateKey, type Clash, type Session } from '@/app/schedule';
import type { NextClassModel } from '../types';

const LATER_TODAY_LIMIT = 2;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

export const pickNextClass = (attended: Session[], now: Date): NextClassModel | null => {
  const live = attended.filter((session) => !session.cancelled).sort(byStart);
  const session = live.find((item) => item.end > now);
  if (!session) return null;
  const today = helsinkiDateKey(now);
  return {
    session,
    laterToday: live
      .filter((item) => item.id !== session.id && item.dateKey === today && item.start >= session.start)
      .slice(0, LATER_TODAY_LIMIT),
  };
};

export const clashCourseNames = (
  sessionId: string,
  clashesBySession: Map<string, Clash[]>,
  sessions: Session[],
): string[] => {
  const names = (clashesBySession.get(sessionId) ?? [])
    .flatMap((clash) => clash.sessionIds.filter((id) => id !== sessionId))
    .map((id) => sessions.find((session) => session.id === id)?.courseName)
    .filter((name): name is string => name != null);
  return [...new Set(names)];
};
