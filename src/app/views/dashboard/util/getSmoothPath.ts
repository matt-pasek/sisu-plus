export const getSmoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`;
  const [first, ...rest] = points;
  return rest.reduce((path, point, index) => {
    const previous = points[index];
    const next = points[index + 2] ?? point;
    const controlDistance = (point.x - previous.x) / 2;
    const c1x = previous.x + controlDistance;
    const c1y = previous.y + (point.y - (points[index - 1]?.y ?? previous.y)) / 6;
    const c2x = point.x - controlDistance;
    const c2y = point.y - (next.y - previous.y) / 6;
    return `${path} C${c1x} ${c1y}, ${c2x} ${c2y}, ${point.x} ${point.y}`;
  }, `M${first.x} ${first.y}`);
};
