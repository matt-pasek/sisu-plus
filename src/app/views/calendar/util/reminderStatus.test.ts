/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildReminderSnapshot } from '@/background/notifications/__fixtures__/buildReminderSnapshot';
import { normalizeNotificationPrefs } from '@/shared/notifications/normalizeNotificationPrefs';
import { reminderStatus } from './reminderStatus';

const on = normalizeNotificationPrefs({ delivery: { 'class-reminder': 'out-of-app' }, classReminderLeadMinutes: 15 });

describe('reminderStatus', () => {
  test('off by default', () => {
    expect(reminderStatus(normalizeNotificationPrefs(undefined), buildReminderSnapshot(), '2026-10-13')).toEqual({
      kind: 'off',
    });
  });

  test('on shows the lead and how far reminders reach', () => {
    expect(reminderStatus(on, buildReminderSnapshot(), '2026-10-13')).toEqual({
      kind: 'on',
      leadMinutes: 15,
      untilLabel: 'Mon 19.10',
    });
  });

  test('a snapshot that has run out, or none at all, shows no date', () => {
    expect(reminderStatus(on, buildReminderSnapshot(), '2026-10-20')).toEqual({
      kind: 'on',
      leadMinutes: 15,
      untilLabel: null,
    });
    expect(reminderStatus(on, null, '2026-10-13')).toEqual({ kind: 'on', leadMinutes: 15, untilLabel: null });
  });
});
