import type { Clash, SeriesClashSummary, Session } from './types';

const MINUTE_MS = 60_000;

const byStart = (a: Session, b: Session): number => a.start.getTime() - b.start.getTime();

const durationMinutes = (session: Session): number =>
  Math.round((session.end.getTime() - session.start.getTime()) / MINUTE_MS);

const overlapMinutes = (a: Session, b: Session): number =>
  Math.round((Math.min(a.end.getTime(), b.end.getTime()) - Math.max(a.start.getTime(), b.start.getTime())) / MINUTE_MS);

const toClash = (a: Session, b: Session): Clash => {
  const minutes = overlapMinutes(a, b);
  return {
    id: [a.id, b.id].sort().join('|'),
    sessionIds: [a.id, b.id],
    start: new Date(Math.max(a.start.getTime(), b.start.getTime())),
    end: new Date(Math.min(a.end.getTime(), b.end.getTime())),
    minutes,
    kind: minutes >= Math.min(durationMinutes(a), durationMinutes(b)) ? 'full' : 'partial',
    involvesExam: a.kind === 'exam' || b.kind === 'exam',
  };
};

export const findClashes = (sessions: Session[]): Clash[] => {
  const active = sessions.filter((session) => !session.cancelled).sort(byStart);
  return active
    .flatMap((a, index) =>
      active
        .slice(index + 1)
        .filter((b) => b.id !== a.id && b.start < a.end && overlapMinutes(a, b) > 0)
        .map((b) => toClash(a, b)),
    )
    .sort((x, y) => Number(y.involvesExam) - Number(x.involvesExam) || x.start.getTime() - y.start.getTime());
};

export const groupClashesBySession = (clashes: Clash[]): Map<string, Clash[]> =>
  clashes.reduce((map, clash) => {
    clash.sessionIds.forEach((id) => map.set(id, [...(map.get(id) ?? []), clash]));
    return map;
  }, new Map<string, Clash[]>());

export const summarizeSeriesClashes = (
  seriesId: string,
  sessions: Session[],
  clashesBySession: Map<string, Clash[]>,
): SeriesClashSummary => {
  const byId = new Map(sessions.map((session) => [session.id, session]));
  const series = sessions.filter((session) => session.seriesId === seriesId && !session.cancelled).sort(byStart);
  const perSession = series.map((session) => ({
    sessionId: session.id,
    clashes: (clashesBySession.get(session.id) ?? []).length > 0,
  }));
  const otherSessions = series
    .flatMap((session) =>
      (clashesBySession.get(session.id) ?? []).flatMap((clash) => clash.sessionIds.filter((id) => id !== session.id)),
    )
    .map((id) => byId.get(id))
    .filter((other): other is Session => other != null && other.seriesId !== seriesId);
  return {
    total: series.length,
    clashing: perSession.filter((entry) => entry.clashes).length,
    perSession,
    otherSessions: [...new Map(otherSessions.map((other) => [other.seriesId, other])).values()],
  };
};
