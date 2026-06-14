import { parseIcsCalendar } from '@ts-ics/schema-zod';
import type { IcsEvent } from 'ts-ics';
import { fetchMoodleCalendar } from '@/background/moodle/moodleFetch';
import { deliverNotification } from '@/background/notifications/delivery';
import { getNotificationPrefs } from '@/background/notifications/prefs';
import { getNotificationCache, patchNotificationCache, setNotificationCache } from '@/background/notifications/storage';
import type {
  CachedMoodleDeadline,
  CachedRegistrationEvent,
  NotificationCache,
  NotificationPayload,
  SisuNotificationSyncPayload,
} from '@/background/notifications/types';
import type { NotificationType } from '@/app/types/NotificationType.type';
import {
  getBackgroundLocale,
  getNotificationStrings,
  type NotificationStrings,
} from '@/background/notifications/backgroundStrings';

const ALARM_PREFIX = 'sisu-plus-notification';
const MOODLE_FETCH_ALARM = `${ALARM_PREFIX}:moodle-fetch`;
const SISU_SYNC_CHECK_ALARM = `${ALARM_PREFIX}:sisu-sync-check`;
const MS_PER_DAY = 86_400_000;
const MOODLE_FETCH_INTERVAL_MINUTES = 24 * 60;
const SISU_SYNC_STALE_DAYS = 5;

const isFutureTime = (time: number, now = Date.now()) => Number.isFinite(time) && time > now;

const encodePart = (value: string) => encodeURIComponent(value);

const decodePart = (value: string) => decodeURIComponent(value);

const getEventDate = (event: IcsEvent): Date | null => event.end?.date ?? event.start.date ?? null;

const getAlarmName = (type: NotificationType, trigger: string, eventId: string) =>
  `${ALARM_PREFIX}:${type}:${trigger}:${encodePart(eventId)}`;

const createAlarm = async (name: string, when: number): Promise<string | null> => {
  if (!isFutureTime(when)) return null;
  await chrome.alarms.create(name, { when });
  return name;
};

const clearScheduledAlarms = async (cache: NotificationCache) => {
  await Promise.all(cache.scheduledAlarms.map((name) => chrome.alarms.clear(name)));
};

const getMoodleAlarmTimes = (dueAt: string) => {
  const dueTime = new Date(dueAt).getTime();
  return [
    { trigger: '24h', when: dueTime - MS_PER_DAY },
    { trigger: '1h', when: dueTime - 60 * 60 * 1000 },
  ];
};

const toMoodleDeadline = (event: IcsEvent): CachedMoodleDeadline | null => {
  const date = getEventDate(event);
  if (!date) return null;

  return {
    course: event.categories?.[0] ?? null,
    dueAt: date.toISOString(),
    id: event.uid,
    title: event.summary,
  };
};

const getRegistrationOpenGroups = (registrations: CachedRegistrationEvent[]) => {
  const groups = new Map<string, CachedRegistrationEvent[]>();

  registrations.forEach((registration) => {
    if (!registration.opensAt || registration.enrolled) return;
    groups.set(registration.opensAt, [...(groups.get(registration.opensAt) ?? []), registration]);
  });

  return groups;
};

export const scheduleNotificationAlarms = async () => {
  const prefs = await getNotificationPrefs();
  const cache = await getNotificationCache();
  const scheduledAlarms: string[] = [];

  await clearScheduledAlarms(cache);

  if (prefs.delivery['moodle-deadline'] !== 'off') {
    await chrome.alarms.create(MOODLE_FETCH_ALARM, {
      delayInMinutes: 1,
      periodInMinutes: MOODLE_FETCH_INTERVAL_MINUTES,
    });
    scheduledAlarms.push(MOODLE_FETCH_ALARM);

    for (const deadline of cache.moodle.deadlines) {
      for (const alarm of getMoodleAlarmTimes(deadline.dueAt)) {
        const name = await createAlarm(getAlarmName('moodle-deadline', alarm.trigger, deadline.id), alarm.when);
        if (name) scheduledAlarms.push(name);
      }
    }
  }

  if (prefs.delivery['registration-open'] !== 'off') {
    for (const [opensAt] of getRegistrationOpenGroups(cache.sisu.registrations)) {
      const when = new Date(opensAt).getTime() - prefs.registrationOpenLeadMinutes * 60 * 1000;
      const name = await createAlarm(getAlarmName('registration-open', 'open', opensAt), when);
      if (name) scheduledAlarms.push(name);
    }
  }

  if (prefs.delivery['registration-close'] !== 'off') {
    for (const registration of cache.sisu.registrations) {
      if (!registration.closesAt || registration.enrolled) continue;
      const when = new Date(registration.closesAt).getTime() - MS_PER_DAY;
      const name = await createAlarm(getAlarmName('registration-close', '24h', registration.id), when);
      if (name) scheduledAlarms.push(name);
    }
  }

  if (prefs.delivery['sisu-sync'] !== 'off') {
    await chrome.alarms.create(SISU_SYNC_CHECK_ALARM, { delayInMinutes: 10, periodInMinutes: 12 * 60 });
    scheduledAlarms.push(SISU_SYNC_CHECK_ALARM);
  }

  await setNotificationCache({ ...cache, scheduledAlarms });
};

export const refreshMoodleDeadlines = async () => {
  const text = await fetchMoodleCalendar();
  const calendar = parseIcsCalendar(text);
  const deadlines = (calendar.events ?? [])
    .map(toMoodleDeadline)
    .filter((deadline): deadline is CachedMoodleDeadline => deadline != null)
    .filter((deadline) => new Date(deadline.dueAt).getTime() > Date.now())
    .sort((first, second) => first.dueAt.localeCompare(second.dueAt))
    .slice(0, 40);

  await patchNotificationCache((cache) => ({
    ...cache,
    moodle: {
      deadlines,
      lastFetch: Date.now(),
    },
  }));

  await scheduleNotificationAlarms();
};

export const syncSisuNotificationCache = async (payload: SisuNotificationSyncPayload) => {
  await patchNotificationCache((cache) => ({
    ...cache,
    sisu: {
      lastSync: payload.syncedAt ?? Date.now(),
      registrations: payload.registrations,
    },
  }));

  await scheduleNotificationAlarms();
};

const getMoodlePayload = (
  cache: NotificationCache,
  eventId: string,
  trigger: string,
  s: NotificationStrings,
): NotificationPayload | null => {
  const deadline = cache.moodle.deadlines.find((item) => item.id === eventId);
  if (!deadline) return null;

  return {
    body: `${deadline.title}${deadline.course ? ` (${deadline.course})` : ''}`,
    eventId: `${deadline.id}:${trigger}`,
    source: 'moodle',
    title: trigger === '1h' ? s.moodleTitleHour : s.moodleTitleTomorrow,
    type: 'moodle-deadline',
  };
};

const getRegistrationOpenPayload = (
  cache: NotificationCache,
  opensAt: string,
  trigger: string,
  leadMinutes: number,
  s: NotificationStrings,
): NotificationPayload | null => {
  const registrations = getRegistrationOpenGroups(cache.sisu.registrations).get(opensAt) ?? [];
  if (registrations.length === 0) return null;

  const lead = leadMinutes > 0 ? s.leadTime(leadMinutes) : '';
  const single = registrations.length === 1;

  return {
    body: single
      ? s.registrationOpenBodySingle(registrations[0].name, lead)
      : s.registrationOpenBodyMulti(registrations.length, lead),
    eventId: `${opensAt}:${trigger}`,
    source: 'sisu',
    title: single ? s.registrationOpenTitleSingle(lead) : s.registrationOpenTitleMulti(lead),
    type: 'registration-open',
  };
};

const getRegistrationClosePayload = (
  cache: NotificationCache,
  eventId: string,
  s: NotificationStrings,
): NotificationPayload | null => {
  const registration = cache.sisu.registrations.find((item) => item.id === eventId && !item.enrolled);
  if (!registration) return null;

  return {
    body: s.registrationCloseBody(registration.name),
    eventId: registration.id,
    source: 'sisu',
    title: s.registrationCloseTitle,
    type: 'registration-close',
  };
};

const getSisuSyncPayload = (cache: NotificationCache, s: NotificationStrings): NotificationPayload | null => {
  const lastSync = cache.sisu.lastSync;
  if (lastSync && Date.now() - lastSync < SISU_SYNC_STALE_DAYS * MS_PER_DAY) return null;

  return {
    body: s.sisuSyncBody,
    eventId: `sisu-sync:${Math.floor(Date.now() / MS_PER_DAY)}`,
    source: 'sisu',
    title: s.sisuSyncTitle,
    type: 'sisu-sync',
  };
};

export const handleNotificationAlarm = async (alarmName: string) => {
  if (alarmName === MOODLE_FETCH_ALARM) {
    await refreshMoodleDeadlines();
    return;
  }

  const [cache, prefs, locale] = await Promise.all([
    getNotificationCache(),
    getNotificationPrefs(),
    getBackgroundLocale(),
  ]);
  const s = getNotificationStrings(locale);

  if (alarmName === SISU_SYNC_CHECK_ALARM) {
    const payload = getSisuSyncPayload(cache, s);
    if (payload) await deliverNotification(payload);
    return;
  }

  if (!alarmName.startsWith(`${ALARM_PREFIX}:`)) return;

  const [, type, trigger, encodedEventId] = alarmName.split(':');
  if (!type || !trigger || !encodedEventId) return;

  const eventId = decodePart(encodedEventId);
  const payload =
    type === 'moodle-deadline'
      ? getMoodlePayload(cache, eventId, trigger, s)
      : type === 'registration-open'
        ? getRegistrationOpenPayload(cache, eventId, trigger, prefs.registrationOpenLeadMinutes, s)
        : type === 'registration-close'
          ? getRegistrationClosePayload(cache, eventId, s)
          : null;

  if (payload) await deliverNotification(payload);
};
