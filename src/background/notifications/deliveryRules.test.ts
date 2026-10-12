/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { notificationTargetPath, shouldQueueUnread } from './deliveryRules';

describe('shouldQueueUnread', () => {
  test('class reminders are never queued', () => {
    expect(shouldQueueUnread('class-reminder', 'in-app', 0, false)).toBe(false);
    expect(shouldQueueUnread('class-reminder', 'both', 0, false)).toBe(false);
  });

  test('other in-app notifications nobody saw are queued, as before', () => {
    expect(shouldQueueUnread('moodle-deadline', 'in-app', 0, false)).toBe(true);
    expect(shouldQueueUnread('moodle-deadline', 'in-app', 1, false)).toBe(false);
    expect(shouldQueueUnread('moodle-deadline', 'both', 0, true)).toBe(false);
    expect(shouldQueueUnread('moodle-deadline', 'out-of-app', 0, false)).toBe(false);
  });
});

describe('notificationTargetPath', () => {
  test('class reminders open the calendar, everything else the front page', () => {
    expect(notificationTargetPath('sisu-plus-notification:class-reminder:evt@2026-10-13#0')).toBe('/student/calendar');
    expect(notificationTargetPath('sisu-plus-notification:class-reminder:dev-test')).toBe('/student/calendar');
    expect(notificationTargetPath('sisu-plus-notification:moodle-deadline:x:1h')).toBe('/student/frontpage');
  });
});
