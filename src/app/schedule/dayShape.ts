import { endMinutesOfDay } from './layout';
import { helsinkiMinutesOfDay } from './time';
import type { HourRange, Session, ShapeLane, ShapeSegment } from './types';

const MINUTE_MS = 60_000;

export const SHAPE_HOURS: HourRange = { startHour: 8, endHour: 19 };

const byStart = (a: Session, b: Session): number =>
  a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime() || a.id.localeCompare(b.id);

const overlaps = (a: Session, b: Session): boolean => a.start < b.end && b.start < a.end;

// A student cannot sit in two clashing sessions, so overlapping time counts once.
export const busyMinutes = (sessions: Session[]): number =>
  Math.round(
    [...sessions].sort(byStart).reduce(
      (acc, session) => {
        const start = Math.max(session.start.getTime(), acc.until);
        const end = session.end.getTime();
        return end > start
          ? { total: acc.total + (end - start) / MINUTE_MS, until: end }
          : { total: acc.total, until: Math.max(acc.until, end) };
      },
      { total: 0, until: 0 },
    ).total,
  );

const laneAt = (sorted: Session[], index: number): ShapeLane => {
  const overlappingIndexes = sorted
    .map((other, otherIndex) => ({ other, otherIndex }))
    .filter(({ other, otherIndex }) => otherIndex !== index && overlaps(other, sorted[index]))
    .map(({ otherIndex }) => otherIndex);
  if (overlappingIndexes.length === 0) return 'full';
  return overlappingIndexes.some((otherIndex) => otherIndex < index) ? 'bottom' : 'top';
};

export const dayShape = (
  sessions: Session[],
  clashingIds: Set<string>,
  range: HourRange = SHAPE_HOURS,
): ShapeSegment[] => {
  const offset = range.startHour * 60;
  const span = (range.endHour - range.startHour) * 60;
  const sorted = [...sessions].sort(byStart);
  return sorted.flatMap((session, index) => {
    const from = Math.max(helsinkiMinutesOfDay(session.start) - offset, 0);
    const to = Math.min(endMinutesOfDay(session) - offset, span);
    if (to <= from) return [];
    return [
      {
        sessionId: session.id,
        colorIndex: session.colorIndex,
        left: from / span,
        width: (to - from) / span,
        lane: laneAt(sorted, index),
        clashing: clashingIds.has(session.id),
      },
    ];
  });
};
