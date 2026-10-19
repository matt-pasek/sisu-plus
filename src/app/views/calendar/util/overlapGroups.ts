import { clusterBlocks, type Session, type TimedBlock } from '@/app/schedule';

const MIN_LANE_WIDTH = 120;

export const splitOverlaps = (sessions: Session[]): { singles: Session[]; groups: Session[][] } => {
  const clusters = clusterBlocks(sessions);
  return {
    singles: clusters.filter((cluster) => cluster.length === 1).flat(),
    groups: clusters.filter((cluster) => cluster.length > 1),
  };
};

export const groupBlock = (group: Session[]): TimedBlock => ({
  id: `group:${group.map((session) => session.id).join('|')}`,
  start: new Date(Math.min(...group.map((session) => session.start.getTime()))),
  end: new Date(Math.max(...group.map((session) => session.end.getTime()))),
  dateKey: group[0].dateKey,
});

export const lanesThatFit = (columnWidth: number): number => Math.floor(columnWidth / MIN_LANE_WIDTH);
