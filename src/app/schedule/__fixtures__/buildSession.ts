import { helsinkiWallTimeToInstant } from '../time';
import type { Session } from '../types';

export const buildSession = (
  id: string,
  dateKey: string,
  startHour: number,
  endHour: number,
  overrides: Partial<Session> = {},
): Session => ({
  id,
  seriesId: `series-${id}`,
  index: 0,
  start: helsinkiWallTimeToInstant(dateKey, Math.round(startHour * 60)),
  end: helsinkiWallTimeToInstant(dateKey, Math.round(endHour * 60)),
  dateKey,
  cancelled: false,
  locationIds: [],
  notice: null,
  courseKey: `course-${id}`,
  courseName: `Course ${id}`,
  courseUnitId: null,
  groupId: null,
  groupName: null,
  groupIds: [],
  kind: 'lecture',
  colorIndex: 0,
  source: 'sisu',
  locationText: null,
  ...overrides,
});
