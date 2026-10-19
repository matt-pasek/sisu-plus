/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildReminderSnapshot, reminderAt } from './__fixtures__/buildReminderSnapshot';
import { getNotificationStrings } from './backgroundStrings';
import { classReminderPayload } from './classReminderPayload';

const en = getNotificationStrings('en');
const fi = getNotificationStrings('fi');
const classAlarm = { kind: 'class', lead: 10, sessionId: 'a' } as const;

describe('classReminderPayload', () => {
  const snapshot = buildReminderSnapshot();

  test('names the course, the time left, the kind and the room', () => {
    expect(classReminderPayload(snapshot, classAlarm, reminderAt('2026-10-13', 9 + 50 / 60).getTime(), en)).toEqual({
      body: 'Lecture · AUD1B',
      eventId: 'a',
      source: 'sisu',
      title: 'Course a in 10 minutes',
      type: 'class-reminder',
    });
  });

  test('says the minutes actually left when the alarm fires late', () => {
    const payload = classReminderPayload(snapshot, classAlarm, reminderAt('2026-10-13', 9 + 57 / 60).getTime(), en);
    expect(payload?.title).toBe('Course a in 3 minutes');
  });

  test('uses a singular minute in English and Finnish copy in Finnish', () => {
    const lastMinute = reminderAt('2026-10-13', 10).getTime() - 30_000;
    expect(classReminderPayload(snapshot, classAlarm, lastMinute, en)?.title).toBe('Course a in 1 minute');
    expect(classReminderPayload(snapshot, classAlarm, reminderAt('2026-10-13', 9.5).getTime(), fi)?.title).toBe(
      'Course a 30 minuutin päästä',
    );
  });

  test('drops a reminder once the class has started, or when the session is gone', () => {
    expect(classReminderPayload(snapshot, classAlarm, reminderAt('2026-10-13', 10).getTime(), en)).toBeNull();
    expect(
      classReminderPayload(snapshot, { ...classAlarm, sessionId: 'gone' }, reminderAt('2026-10-13', 9).getTime(), en),
    ).toBeNull();
    expect(classReminderPayload(null, classAlarm, 0, en)).toBeNull();
  });

  test('the horizon nudge names the last covered day', () => {
    const horizon = { kind: 'horizon', horizonKey: '2026-10-19' } as const;
    expect(classReminderPayload(snapshot, horizon, 0, en)).toEqual({
      body: 'Open Sisu to keep them going.',
      eventId: 'horizon:2026-10-19',
      source: 'sisu',
      title: 'Class reminders stop after Mon 19.10',
      type: 'class-reminder',
    });
    expect(classReminderPayload(snapshot, horizon, 0, fi)?.title).toBe('Tuntimuistutukset loppuvat Mon 19.10 jälkeen');
  });

  test('a stale nudge says nothing', () => {
    expect(classReminderPayload(snapshot, { kind: 'horizon', horizonKey: '2026-10-18' }, 0, en)).toBeNull();
    expect(
      classReminderPayload(
        buildReminderSnapshot({ hasMoreAfter: false }),
        { kind: 'horizon', horizonKey: '2026-10-19' },
        0,
        en,
      ),
    ).toBeNull();
  });
});
