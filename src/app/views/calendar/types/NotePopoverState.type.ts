import type { NoteOccurrence } from '@/app/schedule';
import type { AnchorRect } from './AnchorRect.type';

export interface NotePopoverState {
  note: NoteOccurrence;
  element: HTMLElement;
  anchor: AnchorRect;
}
