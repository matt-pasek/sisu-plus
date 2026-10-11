import { isTimetableFetchResult } from '@/shared/timetables/timetables';
import type { TimetableFetchResult } from '@/shared/timetables/TimetableFetchResult.type';

export const requestTimetable = (url: string): Promise<TimetableFetchResult> =>
  new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: 'FETCH_TIMETABLE', url }, (response: unknown) =>
      resolve(isTimetableFetchResult(response) ? response : { ok: false, reason: 'network' }),
    ),
  );

export const requestOriginGrant = (origin: string): Promise<boolean> =>
  new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: 'OPEN_ORIGIN_GRANT', origin }, (response: unknown) =>
      resolve(typeof response === 'object' && response !== null && (response as { ok?: unknown }).ok === true),
    ),
  );
