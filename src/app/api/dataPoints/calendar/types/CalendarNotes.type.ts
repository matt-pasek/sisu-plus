import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import type { NoteOccurrence } from '@/app/schedule';

export interface CalendarNotes {
  events: CalendarEvent[];
  notes: NoteOccurrence[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
