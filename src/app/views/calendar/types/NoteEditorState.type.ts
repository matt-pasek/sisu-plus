import type { NoteDraft } from '@/app/api/dataPoints/calendar/types';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import type { AnchorRect } from './AnchorRect.type';

export interface NoteEditorState {
  draft: NoteDraft;
  noteId: string | null;
  base: CalendarEvent | null;
  anchor: AnchorRect;
  returnFocus: HTMLElement | null;
  attempted: boolean;
}
