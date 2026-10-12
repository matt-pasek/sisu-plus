import type { NoteDraft } from '@/app/api/dataPoints/calendar/types';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import type { NoteOccurrence } from '@/app/schedule';
import type { AnchorRect } from './AnchorRect.type';
import type { NoteEditorState } from './NoteEditorState.type';
import type { NotePopoverState } from './NotePopoverState.type';
import type { NoteSlot } from './NoteSlot.type';

export interface NoteController {
  popover: NotePopoverState | null;
  editor: NoteEditorState | null;
  eventsById: Map<string, CalendarEvent>;
  draftSlot: NoteSlot | null;
  openNote: (note: NoteOccurrence, element: HTMLElement) => void;
  closePopover: () => void;
  deleteDay: (note: NoteOccurrence) => void;
  deleteSeries: (note: NoteOccurrence) => void;
  openNew: (slot: NoteSlot, anchor: AnchorRect, returnFocus: HTMLElement | null) => void;
  edit: (note: NoteOccurrence) => void;
  changeDraft: (draft: NoteDraft) => void;
  save: () => void;
  cancel: () => void;
  hasOverlay: boolean;
  closeOverlay: () => void;
}
