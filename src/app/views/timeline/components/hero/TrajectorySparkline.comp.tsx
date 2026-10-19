import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { TrajectoryPoint } from '@/app/views/timeline/util/heroStats';

interface Props {
  points: TrajectoryPoint[];
  target: number | null;
}

const HEIGHT = 20;
const VIEW_WIDTH = 100;
const PADDING = 2;

const toPath = (coordinates: { x: number; y: number }[]) =>
  coordinates.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

export const TrajectorySparkline: React.FC<Props> = ({ points, target }) => {
  const { t } = useTranslationWithPrefix('views.timeline');

  const values = [...points.flatMap((point) => [point.completed, point.total]), ...(target === null ? [] : [target])];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);

  const x = (index: number) => (points.length === 1 ? VIEW_WIDTH / 2 : (index / (points.length - 1)) * VIEW_WIDTH);
  const y = (value: number) => HEIGHT - PADDING - ((value - min) / span) * (HEIGHT - PADDING * 2);

  const totalPath = toPath(points.map((point, index) => ({ x: x(index), y: y(point.total) })));
  const completedPath = toPath(
    points.flatMap((point, index) => (point.hasStarted ? [{ x: x(index), y: y(point.completed) }] : [])),
  );

  return (
    <svg
      role="img"
      aria-label={t('hero.chartLabel')}
      viewBox={`0 0 ${VIEW_WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height: HEIGHT }}
    >
      {target !== null && (
        <line
          x1={0}
          x2={VIEW_WIDTH}
          y1={y(target)}
          y2={y(target)}
          className="stroke-border2"
          strokeWidth={1}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {points.length > 1 && (
        <path
          d={totalPath}
          fill="none"
          className="stroke-lightGrey"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {completedPath !== '' && points.filter((point) => point.hasStarted).length > 1 && (
        <path
          d={completedPath}
          fill="none"
          className="stroke-lighterGreen"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
};
