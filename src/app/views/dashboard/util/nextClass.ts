import type { Clash, Session } from '@/app/schedule';
import type { NextClassModel } from '../types';

const FOLLOWING_LIMIT = 3;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

export const pickNextClass = (attended: Session[], now: Date): NextClassModel | null => {
  const live = attended.filter((session) => !session.cancelled).sort(byStart);
  const index = live.findIndex((item) => item.end > now);
  if (index === -1) return null;
  return {
    session: live[index],
    following: live
      .slice(index + 1)
      .filter((item) => item.end > now)
      .slice(0, FOLLOWING_LIMIT),
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
