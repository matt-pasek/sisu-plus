import {
  isCalendarText,
  isGrantableOrigin,
  MAX_TIMETABLE_BYTES,
  validTimetableUrl,
} from '@/shared/timetables/timetables';
import type { TimetableFetchResult } from '@/shared/timetables/TimetableFetchResult.type';

export const fetchTimetable = async (value: unknown): Promise<TimetableFetchResult> => {
  const url = validTimetableUrl(value);
  if (!url) return { ok: false, reason: 'invalid' };
  const granted = await chrome.permissions.contains({ origins: [`${url.origin}/*`] });
  if (!granted) return { ok: false, reason: 'permission' };
  const response = await fetch(url.toString(), { credentials: 'omit', cache: 'no-store' }).catch(() => null);
  if (!response || !response.ok) return { ok: false, reason: 'network' };
  if (Number(response.headers.get('content-length') ?? 0) > MAX_TIMETABLE_BYTES) {
    return { ok: false, reason: 'tooLarge' };
  }
  const text = await response.text().catch(() => null);
  if (text == null) return { ok: false, reason: 'network' };
  if (text.length > MAX_TIMETABLE_BYTES) return { ok: false, reason: 'tooLarge' };
  return isCalendarText(text) ? { ok: true, text } : { ok: false, reason: 'notCalendar' };
};

export const openOriginGrant = async (origin: unknown): Promise<boolean> => {
  if (!isGrantableOrigin(origin)) return false;
  await chrome.tabs.create({ url: chrome.runtime.getURL(`onboarding.html?grant=${encodeURIComponent(origin)}`) });
  return true;
};
