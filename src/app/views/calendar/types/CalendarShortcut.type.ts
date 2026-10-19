import type { CalendarView } from './CalendarView.type';

export type CalendarShortcut =
  | { type: 'previous' }
  | { type: 'next' }
  | { type: 'today' }
  | { type: 'newNote' }
  | { type: 'view'; view: CalendarView };
