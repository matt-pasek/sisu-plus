import { helsinkiDateKey, helsinkiMinutesOfDay } from './time';
import type { DayLayout, HourRange, Session } from './types';

export const MAX_COLUMNS = 3;

const byStartThenLongest = (a: Session, b: Session): number =>
  a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime();

const toClusters = (sessions: Session[]): Session[][] =>
  [...sessions].sort(byStartThenLongest).reduce<{ clusters: Session[][]; clusterEnd: number }>(
    (acc, session) => {
      const startsNew = acc.clusters.length === 0 || session.start.getTime() >= acc.clusterEnd;
      return startsNew
        ? { clusters: [...acc.clusters, [session]], clusterEnd: session.end.getTime() }
        : {
            clusters: [...acc.clusters.slice(0, -1), [...acc.clusters[acc.clusters.length - 1], session]],
            clusterEnd: Math.max(acc.clusterEnd, session.end.getTime()),
          };
    },
    { clusters: [], clusterEnd: 0 },
  ).clusters;

const assignColumns = (cluster: Session[]): { id: string; col: number }[] =>
  cluster.reduce<{ columnEnds: number[]; assigned: { id: string; col: number }[] }>(
    (acc, session) => {
      const free = acc.columnEnds.findIndex((end) => end <= session.start.getTime());
      const col = free === -1 ? acc.columnEnds.length : free;
      const columnEnds =
        free === -1
          ? [...acc.columnEnds, session.end.getTime()]
          : acc.columnEnds.map((end, index) => (index === col ? session.end.getTime() : end));
      return { columnEnds, assigned: [...acc.assigned, { id: session.id, col }] };
    },
    { columnEnds: [], assigned: [] },
  ).assigned;

export const layoutDay = (sessions: Session[]): DayLayout =>
  toClusters(sessions).reduce<DayLayout>(
    (layout, cluster) => {
      const assigned = assignColumns(cluster);
      const cols = Math.min(Math.max(...assigned.map((entry) => entry.col)) + 1, MAX_COLUMNS);
      const visible = assigned.filter((entry) => entry.col < MAX_COLUMNS);
      const hidden = assigned.filter((entry) => entry.col >= MAX_COLUMNS);
      return {
        placements: {
          ...layout.placements,
          ...Object.fromEntries(visible.map((entry) => [entry.id, { col: entry.col, cols }])),
        },
        overflow:
          hidden.length === 0
            ? layout.overflow
            : [
                ...layout.overflow,
                {
                  start: new Date(
                    Math.min(
                      ...cluster
                        .filter((session) => hidden.some((entry) => entry.id === session.id))
                        .map((session) => session.start.getTime()),
                    ),
                  ),
                  end: new Date(Math.max(...cluster.map((session) => session.end.getTime()))),
                  sessionIds: hidden.map((entry) => entry.id),
                },
              ],
      };
    },
    { placements: {}, overflow: [] },
  );

export const endMinutesOfDay = (session: Session): number =>
  helsinkiDateKey(session.end) > session.dateKey ? 24 * 60 : helsinkiMinutesOfDay(session.end);

export const visibleHourRange = (sessions: Session[], fallback: HourRange): HourRange =>
  sessions.reduce<HourRange>(
    (range, session) => ({
      startHour: Math.min(range.startHour, Math.floor(helsinkiMinutesOfDay(session.start) / 60)),
      endHour: Math.max(range.endHour, Math.ceil(endMinutesOfDay(session) / 60)),
    }),
    fallback,
  );
