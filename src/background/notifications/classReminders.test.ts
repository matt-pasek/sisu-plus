/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import type { StoredNotificationPrefs } from '@/app/types/StoredNotificationPrefs.type';
import { normalizeNotificationPrefs } from '@/shared/notifications/normalizeNotificationPrefs';
import { buildCachedSession, buildReminderSnapshot, reminderAt } from './__fixtures__/buildReminderSnapshot';
import {
  classAlarmName,
  classReminderAlarms,
  countClassReminderAlarms,
  horizonAlarmName,
  isClassReminderSnapshot,
  parseClassReminderAlarm,
} from './classReminders';

const MINUTE = 60_000;
const on = (overrides: StoredNotificationPrefs = {}) =>
  normalizeNotificationPrefs({ ...overrides, delivery: { 'class-reminder': 'out-of-app' } });

describe('classReminderAlarms', () => {
  const now = reminderAt('2026-10-13', 8).getTime();

  test('one alarm per class at start minus lead, plus the nudge at 12.00 the day before the horizon', () => {
    const alarms = classReminderAlarms(buildReminderSnapshot(), on(), now);
    expect(alarms).toEqual([
      { name: classAlarmName(10, 'a'), when: reminderAt('2026-10-13', 10).getTime() - 10 * MINUTE },
      { name: classAlarmName(10, 'exam'), when: reminderAt('2026-10-14', 9).getTime() - 10 * MINUTE },
      { name: horizonAlarmName('2026-10-19'), when: reminderAt('2026-10-18', 12).getTime() },
    ]);
  });

  test('uses the chosen lead time', () => {
    const [first] = classReminderAlarms(buildReminderSnapshot(), on({ classReminderLeadMinutes: 30 }), now);
    expect(first).toEqual({ name: classAlarmName(30, 'a'), when: reminderAt('2026-10-13', 9.5).getTime() });
  });

  test('exams only keeps exam sessions', () => {
    const names = classReminderAlarms(buildReminderSnapshot(), on({ classReminderScope: 'exams' }), now).map(
      (alarm) => alarm.name,
    );
    expect(names).toEqual([classAlarmName(10, 'exam'), horizonAlarmName('2026-10-19')]);
  });

  test('skips reminder times that have already passed', () => {
    const late = reminderAt('2026-10-13', 9.9).getTime();
    const names = classReminderAlarms(buildReminderSnapshot(), on(), late).map((alarm) => alarm.name);
    expect(names).toEqual([classAlarmName(10, 'exam'), horizonAlarmName('2026-10-19')]);
  });

  test('nothing when reminders are off or nothing is stored', () => {
    expect(classReminderAlarms(buildReminderSnapshot(), normalizeNotificationPrefs(undefined), now)).toEqual([]);
    expect(classReminderAlarms(null, on(), now)).toEqual([]);
  });

  test('exams-only reminders nudge only when exams follow the horizon', () => {
    const examsOnly = { ...on(), classReminderScope: 'exams' as const };
    const names = (hasExamsAfter: boolean) =>
      classReminderAlarms(buildReminderSnapshot({ hasExamsAfter }), examsOnly, now).map((alarm) => alarm.name);
    expect(names(false)).toEqual([classAlarmName(10, 'exam')]);
    expect(names(true)).toEqual([classAlarmName(10, 'exam'), horizonAlarmName('2026-10-19')]);
  });

  test('a snapshot stored before the exams flag existed still counts as valid', () => {
    const { hasExamsAfter: _dropped, ...older } = buildReminderSnapshot();
    expect(isClassReminderSnapshot(older)).toBe(true);
  });

  test('no nudge when the term has no later classes', () => {
    const names = classReminderAlarms(buildReminderSnapshot({ hasMoreAfter: false }), on(), now).map(
      (alarm) => alarm.name,
    );
    expect(names).toEqual([classAlarmName(10, 'a'), classAlarmName(10, 'exam')]);
  });

  test('the nudge stays at 12.00 Helsinki on both sides of the 25 Oct DST change', () => {
    const early = reminderAt('2026-10-20', 8).getTime();
    const nudgeAt = (horizonKey: string) =>
      classReminderAlarms(buildReminderSnapshot({ sessions: [], horizonKey }), on(), early)[0]?.when;
    expect(nudgeAt('2026-10-25')).toBe(Date.parse('2026-10-24T09:00:00.000Z'));
    expect(nudgeAt('2026-10-26')).toBe(Date.parse('2026-10-25T10:00:00.000Z'));
  });
});

describe('alarm names', () => {
  test('session ids with @ # and : survive the round trip', () => {
    for (const id of ['evt-1@2026-10-13#0', 'linked:9f2c@2026-10-13#2']) {
      expect(parseClassReminderAlarm(classAlarmName(15, id))).toEqual({ kind: 'class', lead: 15, sessionId: id });
    }
    expect(parseClassReminderAlarm(horizonAlarmName('2026-10-19'))).toEqual({
      kind: 'horizon',
      horizonKey: '2026-10-19',
    });
  });

  test('rejects other notifications, unknown leads, extra segments and broken encoding', () => {
    expect(parseClassReminderAlarm('sisu-plus-notification:moodle-deadline:1h:x')).toBeNull();
    expect(parseClassReminderAlarm('sisu-plus-notification:class-reminder:7:a')).toBeNull();
    expect(parseClassReminderAlarm('sisu-plus-notification:class-reminder:10:a:b')).toBeNull();
    expect(parseClassReminderAlarm('sisu-plus-notification:class-reminder:10:%E0%A4%A')).toBeNull();
  });

  test('counts class alarms only', () => {
    expect(
      countClassReminderAlarms([
        classAlarmName(10, 'a'),
        classAlarmName(10, 'b'),
        horizonAlarmName('2026-10-19'),
        'sisu-plus-notification:moodle-fetch',
      ]),
    ).toBe(2);
  });
});

describe('isClassReminderSnapshot', () => {
  test('accepts a well-formed snapshot', () => {
    expect(isClassReminderSnapshot(buildReminderSnapshot())).toBe(true);
  });

  test('rejects missing fields, wrong types and unreadable times', () => {
    const withoutHorizon = Object.fromEntries(
      Object.entries(buildReminderSnapshot()).filter(([key]) => key !== 'horizonKey'),
    );
    expect(isClassReminderSnapshot(withoutHorizon)).toBe(false);
    expect(isClassReminderSnapshot(buildReminderSnapshot({ horizonKey: '19.10.2026' }))).toBe(false);
    expect(
      isClassReminderSnapshot(
        buildReminderSnapshot({ sessions: [buildCachedSession('a', '2026-10-13', 10, { startsAt: 'soon' })] }),
      ),
    ).toBe(false);
    expect(isClassReminderSnapshot({ ...buildReminderSnapshot(), hasMoreAfter: 'yes' })).toBe(false);
    expect(isClassReminderSnapshot(null)).toBe(false);
    expect(isClassReminderSnapshot([])).toBe(false);
  });
});
