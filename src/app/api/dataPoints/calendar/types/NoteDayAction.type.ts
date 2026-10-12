import type { CalendarEvent } from '@/app/api/generated/IlmoApi';

export type NoteDayAction = { type: 'delete'; noteId: string } | { type: 'update'; event: CalendarEvent };
