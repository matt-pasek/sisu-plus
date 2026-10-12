import { useMemo } from 'react';
import type { CalendarDeadline, CalendarDeadlines, CalendarNotes } from '@/app/api/dataPoints/calendar/types';
import { requestNotificationSettingsOpen } from '@/app/controlCenter/notificationSettingsEvents';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';
import { todayKey, type NoteOccurrence } from '@/app/schedule';
import type { SisuPrefs } from '@/app/types/prefs';
import { getMoodleCalendarExportUrlFromConfig } from '@/shared/domains';
import { normalizeNotificationPrefs } from '@/shared/notifications/normalizeNotificationPrefs';
import type { LayerControls } from '../types';
import { reminderStatus } from '../util';

const NO_NOTES: NoteOccurrence[] = [];
const NO_DEADLINES: CalendarDeadline[] = [];

interface Options {
  prefs: SisuPrefs;
  setPrefs: (patch: Partial<SisuPrefs>) => void;
  notes: CalendarNotes;
  deadlines: CalendarDeadlines;
}

export const useCalendarLayers = ({ prefs, setPrefs, notes, deadlines }: Options) => {
  const { cache } = useNotificationCache();
  const snapshot = cache?.calendar ?? null;
  const reminders = useMemo(
    () => reminderStatus(normalizeNotificationPrefs(prefs.notificationPrefs), snapshot, todayKey()),
    [prefs.notificationPrefs, snapshot],
  );
  const layers = useMemo<LayerControls>(
    () => ({
      showCancelled: prefs.calendarShowCancelled,
      showNotes: prefs.calendarShowNotes,
      showDeadlines: prefs.calendarShowDeadlines,
      notesFailed: notes.isError,
      deadlineStatus: deadlines.status,
      onChange: setPrefs,
      onRetryNotes: notes.refetch,
      onRetryDeadlines: deadlines.refetch,
      onConnectMoodle: () => {
        if (prefs.universityConfig) window.open(getMoodleCalendarExportUrlFromConfig(prefs.universityConfig));
      },
      reminders,
      onSetUpReminders: requestNotificationSettingsOpen,
    }),
    [
      prefs.calendarShowCancelled,
      prefs.calendarShowNotes,
      prefs.calendarShowDeadlines,
      prefs.universityConfig,
      notes.isError,
      notes.refetch,
      deadlines.status,
      deadlines.refetch,
      setPrefs,
      reminders,
    ],
  );
  return {
    layers,
    shownNotes: prefs.calendarShowNotes ? notes.notes : NO_NOTES,
    shownDeadlines: prefs.calendarShowDeadlines ? deadlines.deadlines : NO_DEADLINES,
  };
};
