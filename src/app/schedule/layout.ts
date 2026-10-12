import { helsinkiDateKey, helsinkiMinutesOfDay } from './time';
import type { DayLayout, HourRange, TimedBlock } from './types';

export const MAX_COLUMNS = 3;

const byStartThenLongest = (a: TimedBlock, b: TimedBlock): number =>
  a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime();

const toClusters = (blocks: TimedBlock[]): TimedBlock[][] =>
  [...blocks].sort(byStartThenLongest).reduce<{ clusters: TimedBlock[][]; clusterEnd: number }>(
    (acc, block) => {
      const startsNew = acc.clusters.length === 0 || block.start.getTime() >= acc.clusterEnd;
      return startsNew
        ? { clusters: [...acc.clusters, [block]], clusterEnd: block.end.getTime() }
        : {
            clusters: [...acc.clusters.slice(0, -1), [...acc.clusters[acc.clusters.length - 1], block]],
            clusterEnd: Math.max(acc.clusterEnd, block.end.getTime()),
          };
    },
    { clusters: [], clusterEnd: 0 },
  ).clusters;

const assignColumns = (cluster: TimedBlock[]): { id: string; col: number }[] =>
  cluster.reduce<{ columnEnds: number[]; assigned: { id: string; col: number }[] }>(
    (acc, block) => {
      const free = acc.columnEnds.findIndex((end) => end <= block.start.getTime());
      const col = free === -1 ? acc.columnEnds.length : free;
      const columnEnds =
        free === -1
          ? [...acc.columnEnds, block.end.getTime()]
          : acc.columnEnds.map((end, index) => (index === col ? block.end.getTime() : end));
      return { columnEnds, assigned: [...acc.assigned, { id: block.id, col }] };
    },
    { columnEnds: [], assigned: [] },
  ).assigned;

export const layoutDay = (blocks: TimedBlock[]): DayLayout =>
  toClusters(blocks).reduce<DayLayout>(
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
                        .filter((block) => hidden.some((entry) => entry.id === block.id))
                        .map((block) => block.start.getTime()),
                    ),
                  ),
                  end: new Date(Math.max(...cluster.map((block) => block.end.getTime()))),
                  sessionIds: hidden.map((entry) => entry.id),
                },
              ],
      };
    },
    { placements: {}, overflow: [] },
  );

export const endMinutesOfDay = (block: TimedBlock): number =>
  helsinkiDateKey(block.end) > block.dateKey ? 24 * 60 : helsinkiMinutesOfDay(block.end);

export const visibleHourRange = (blocks: TimedBlock[], fallback: HourRange): HourRange =>
  blocks.reduce<HourRange>(
    (range, block) => ({
      startHour: Math.min(range.startHour, Math.floor(helsinkiMinutesOfDay(block.start) / 60)),
      endHour: Math.max(range.endHour, Math.ceil(endMinutesOfDay(block) / 60)),
    }),
    fallback,
  );
