import type { Occurrence } from './Occurrence.type';

export interface NoteOccurrence extends Occurrence {
  id: string;
  noteId: string;
  name: string;
  recurring: boolean;
}
