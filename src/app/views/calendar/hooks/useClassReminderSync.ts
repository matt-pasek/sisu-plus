import { useEffect, useMemo, useRef } from 'react';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { canSyncReminders, formatSessionDate, reminderSyncKey, toReminderSnapshot } from '../util';

export const useClassReminderSync = (data: CalendarData, now: Date): void => {
  const { t, i18n } = useTranslationWithPrefix('views.calendar');
  const locale = i18n.language;
  const ready = canSyncReminders(data);
  const snapshot = useMemo(
    () =>
      ready
        ? toReminderSnapshot(data.attended, data.rooms, data.range, now, {
            kind: (kind) => t(`kinds.${kind}`),
            room: { noRoom: t('event.noRoom'), unavailable: t('event.roomUnavailable') },
            date: (dateKey) => formatSessionDate(dateKey, locale),
          })
        : null,
    [ready, data.attended, data.rooms, data.range, now, t, locale],
  );
  const lastSent = useRef<string | null>(null);
  useEffect(() => {
    if (!snapshot) return;
    const key = reminderSyncKey(snapshot);
    if (key === lastSent.current) return;
    lastSent.current = key;
    void chrome.runtime.sendMessage({ type: 'SYNC_CLASS_REMINDERS', payload: snapshot });
  }, [snapshot]);
};
