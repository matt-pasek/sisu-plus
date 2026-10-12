import type { NoteDraft } from '@/app/api/dataPoints/calendar/types';
import type { AnchorRect } from './AnchorRect.type';

export interface NoteEditorState {
  draft: NoteDraft;
  noteId: string | null;
  anchor: AnchorRect;
  returnFocus: HTMLElement | null;
  attempted: boolean;
}
