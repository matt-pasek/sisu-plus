import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import type { NoteOccurrence } from '@/app/schedule';
import type { NotePopoverState } from './NotePopoverState.type';

export interface NoteController {
  popover: NotePopoverState | null;
  eventsById: Map<string, CalendarEvent>;
  openNote: (note: NoteOccurrence, element: HTMLElement) => void;
  closePopover: () => void;
  deleteDay: (note: NoteOccurrence) => void;
  deleteSeries: (note: NoteOccurrence) => void;
  hasOverlay: boolean;
  closeOverlay: () => void;
}
