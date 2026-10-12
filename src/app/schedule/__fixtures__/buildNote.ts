import { helsinkiWallTimeToInstant } from '../time';
import type { NoteOccurrence } from '../types';

export const buildNote = (
  noteId: string,
  dateKey: string,
  startHour: number,
  endHour: number,
  overrides: Partial<NoteOccurrence> = {},
): NoteOccurrence => ({
  id: `note:${noteId}@${dateKey}`,
  noteId,
  name: `Note ${noteId}`,
  recurring: false,
  seriesId: noteId,
  index: 0,
  start: helsinkiWallTimeToInstant(dateKey, Math.round(startHour * 60)),
  end: helsinkiWallTimeToInstant(dateKey, Math.round(endHour * 60)),
  dateKey,
  cancelled: false,
  locationIds: [],
  notice: null,
  ...overrides,
});
