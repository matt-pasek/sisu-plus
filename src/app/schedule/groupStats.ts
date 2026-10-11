import { uniqueBy } from './collections';
import type { GroupStats, Session } from './types';

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

const overlaps = (a: Session, b: Session): boolean => a.start < b.end && b.start < a.end;

export const statsForCandidate = (
  candidate: Session[],
  attended: Session[],
  ignoreGroupIds: Set<string>,
): GroupStats => {
  const candidateIds = new Set(candidate.map((session) => session.id));
  const others = attended.filter(
    (session) =>
      !session.cancelled &&
      !candidateIds.has(session.id) &&
      !(session.groupIds.length > 0 && session.groupIds.every((id) => ignoreGroupIds.has(id))),
  );
  const sessions = uniqueBy(
    candidate.filter((session) => !session.cancelled),
    (session) => session.id,
  ).sort(byStart);
  const hits = sessions.map((session) => ({
    session,
    clashesWith: others.filter((other) => overlaps(other, session)),
  }));
  return {
    total: sessions.length,
    clashing: hits.filter((hit) => hit.clashesWith.length > 0).length,
    perSession: hits.map((hit) => ({ sessionId: hit.session.id, clashes: hit.clashesWith.length > 0 })),
    clashCourseNames: [...new Set(hits.flatMap((hit) => hit.clashesWith.map((other) => other.courseName)))],
  };
};
