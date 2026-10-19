import { useCallback, useEffect, useState } from 'react';
import { importTimetable, mapLinkedSessions } from '@/app/api/dataPoints/calendar/mapLinkedTimetable';
import { requestOriginGrant, requestTimetable } from '@/app/api/dataPoints/calendar/timetableMessages';
import { normalizeTimetableUrl, timetableOrigin } from '@/app/api/dataPoints/calendar/timetableUrl';
import type { CalendarCourse } from '@/app/api/dataPoints/calendar/types';
import type { DateRange } from '@/app/schedule';
import { TIMETABLE_GRANT_KEY } from '@/shared/timetables/timetables';
import type { TimetableDraft } from '../types';

export const useTimetableDraft = (
  course: CalendarCourse,
  code: string | null,
  range: DateRange,
): { draft: TimetableDraft; submit: (input: string) => void; allow: () => void } => {
  const [draft, setDraft] = useState<TimetableDraft>({ step: 'idle' });

  const load = useCallback(
    async (url: string) => {
      setDraft({ step: 'loading', url });
      const result = await requestTimetable(url);
      if (!result.ok) {
        setDraft(
          result.reason === 'permission'
            ? { step: 'permission', url, waiting: false }
            : { step: 'failed', url, reason: result.reason },
        );
        return;
      }
      const imported = importTimetable(result.text, code);
      setDraft(
        imported
          ? { step: 'preview', url, imported, sessions: mapLinkedSessions(course, imported, range) }
          : { step: 'failed', url, reason: 'notCalendar' },
      );
    },
    [course, code, range],
  );

  const submit = useCallback(
    (input: string) => {
      const url = normalizeTimetableUrl(input);
      if (url) void load(url);
      else setDraft({ step: 'invalid' });
    },
    [load],
  );

  const allow = useCallback(() => {
    if (draft.step !== 'permission') return;
    const origin = timetableOrigin(draft.url);
    if (origin) void requestOriginGrant(origin);
    setDraft({ ...draft, waiting: true });
  }, [draft]);

  useEffect(() => {
    if (draft.step !== 'permission') return;
    const { url } = draft;
    const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === 'local' && changes[TIMETABLE_GRANT_KEY]) void load(url);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [draft, load]);

  return { draft, submit, allow };
};
