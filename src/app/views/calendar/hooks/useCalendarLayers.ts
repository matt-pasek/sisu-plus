import { useMemo } from 'react';
import type { CalendarNotes } from '@/app/api/dataPoints/calendar/types';
import type { NoteOccurrence } from '@/app/schedule';
import type { SisuPrefs } from '@/app/types/prefs';
import type { LayerControls } from '../types';

const NO_NOTES: NoteOccurrence[] = [];

interface Options {
  prefs: SisuPrefs;
  setPrefs: (patch: Partial<SisuPrefs>) => void;
  notes: CalendarNotes;
}

export const useCalendarLayers = ({ prefs, setPrefs, notes }: Options) => {
  const layers = useMemo<LayerControls>(
    () => ({
      showCancelled: prefs.calendarShowCancelled,
      showNotes: prefs.calendarShowNotes,
      notesFailed: notes.isError,
      onChange: setPrefs,
      onRetryNotes: notes.refetch,
    }),
    [prefs.calendarShowCancelled, prefs.calendarShowNotes, notes.isError, notes.refetch, setPrefs],
  );
  return { layers, shownNotes: prefs.calendarShowNotes ? notes.notes : NO_NOTES };
};
