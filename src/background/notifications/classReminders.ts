import { addDaysToDateKey, helsinkiWallTimeToInstant } from '@/app/schedule/time';
import type { ClassReminderLead } from '@/app/types/ClassReminderLead.type';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import { isClassReminderLead } from '@/shared/notifications/normalizeNotificationPrefs';
import type { CachedClassSession, ClassReminderSnapshot } from './types';

export const CLASS_REMINDER_ALARM_PREFIX = 'sisu-plus-notification:class-reminder:';
const HORIZON_TRIGGER = 'horizon';
const MINUTE_MS = 60_000;
const NUDGE_MINUTES_OF_DAY = 12 * 60;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export interface AlarmSpec {
  name: string;
  when: number;
}

export type ClassReminderAlarm =
  | { kind: 'class'; lead: ClassReminderLead; sessionId: string }
  | { kind: 'horizon'; horizonKey: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isInstant = (value: unknown): value is string => isString(value) && Number.isFinite(Date.parse(value));

const isCachedClassSession = (value: unknown): value is CachedClassSession =>
  isRecord(value) &&
  isString(value.id) &&
  isInstant(value.startsAt) &&
  isInstant(value.endsAt) &&
  isString(value.courseName) &&
  isString(value.kindLabel) &&
  isString(value.room) &&
  typeof value.isExam === 'boolean';

export const isClassReminderSnapshot = (value: unknown): value is ClassReminderSnapshot =>
  isRecord(value) &&
  Array.isArray(value.sessions) &&
  value.sessions.every(isCachedClassSession) &&
  isString(value.horizonKey) &&
  DATE_KEY.test(value.horizonKey) &&
  isString(value.horizonLabel) &&
  typeof value.hasMoreAfter === 'boolean' &&
  (value.hasExamsAfter === undefined || typeof value.hasExamsAfter === 'boolean') &&
  typeof value.syncedAt === 'number' &&
  Number.isFinite(value.syncedAt);

export const classAlarmName = (lead: ClassReminderLead, sessionId: string): string =>
  `${CLASS_REMINDER_ALARM_PREFIX}${lead}:${encodeURIComponent(sessionId)}`;

export const horizonAlarmName = (horizonKey: string): string =>
  `${CLASS_REMINDER_ALARM_PREFIX}${HORIZON_TRIGGER}:${encodeURIComponent(horizonKey)}`;

const safeDecode = (value: string): string | null => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

export const parseClassReminderAlarm = (name: string): ClassReminderAlarm | null => {
  if (!name.startsWith(CLASS_REMINDER_ALARM_PREFIX)) return null;
  const [trigger, encoded, ...rest] = name.slice(CLASS_REMINDER_ALARM_PREFIX.length).split(':');
  if (!trigger || !encoded || rest.length > 0) return null;
  const id = safeDecode(encoded);
  if (id == null) return null;
  if (trigger === HORIZON_TRIGGER) return { kind: 'horizon', horizonKey: id };
  const lead = Number(trigger);
  return isClassReminderLead(lead) ? { kind: 'class', lead, sessionId: id } : null;
};

const nudgeTime = (horizonKey: string): number =>
  helsinkiWallTimeToInstant(addDaysToDateKey(horizonKey, -1), NUDGE_MINUTES_OF_DAY).getTime();

// Snapshots stored before hasExamsAfter existed fall back to any later class.
export const wantsHorizonNudge = (snapshot: ClassReminderSnapshot, scope: NotificationPrefs['classReminderScope']) =>
  scope === 'exams' ? (snapshot.hasExamsAfter ?? snapshot.hasMoreAfter) : snapshot.hasMoreAfter;

export const classReminderAlarms = (
  snapshot: ClassReminderSnapshot | null,
  prefs: NotificationPrefs,
  now: number,
): AlarmSpec[] => {
  if (!snapshot || prefs.delivery['class-reminder'] === 'off') return [];
  const lead = prefs.classReminderLeadMinutes;
  const classes = snapshot.sessions
    .filter((session) => prefs.classReminderScope === 'all' || session.isExam)
    .map((session) => ({
      name: classAlarmName(lead, session.id),
      when: Date.parse(session.startsAt) - lead * MINUTE_MS,
    }));
  const nudge = wantsHorizonNudge(snapshot, prefs.classReminderScope)
    ? [{ name: horizonAlarmName(snapshot.horizonKey), when: nudgeTime(snapshot.horizonKey) }]
    : [];
  return [...classes, ...nudge].filter((alarm) => alarm.when > now);
};

export const countClassReminderAlarms = (names: string[]): number =>
  names.filter((name) => parseClassReminderAlarm(name)?.kind === 'class').length;
