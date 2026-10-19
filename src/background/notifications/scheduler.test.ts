/// <reference types="bun-types" />

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { buildCachedSession, buildReminderSnapshot } from './__fixtures__/buildReminderSnapshot';
import { classAlarmName } from './classReminders';
import { scheduleNotificationAlarms, syncClassReminders } from './scheduler';
import { EMPTY_NOTIFICATION_CACHE, getNotificationCache, NOTIFICATION_CACHE_KEY } from './storage';
import type { ClassReminderSnapshot } from './types';

type Store = Record<string, unknown>;

const HOUR = 3_600_000;

const fakeChrome = (local: Store, sync: Store) => ({
  storage: {
    local: {
      get: async (key: string) => ({ [key]: local[key] }),
      set: async (items: Store) => {
        Object.assign(local, items);
      },
    },
    sync: {
      get: async (key: string) => ({ [key]: sync[key] }),
    },
  },
  alarms: {
    create: async () => undefined,
    clear: async () => true,
  },
});

const upcoming = (ids: string[]): ClassReminderSnapshot => {
  const dateKey = new Date(Date.now() + 2 * HOUR).toISOString().slice(0, 10);
  return buildReminderSnapshot({
    sessions: ids.map((id, index) =>
      buildCachedSession(id, dateKey, 0, {
        startsAt: new Date(Date.now() + (index + 2) * HOUR).toISOString(),
        endsAt: new Date(Date.now() + (index + 3) * HOUR).toISOString(),
      }),
    ),
    hasMoreAfter: false,
  });
};

describe('class reminder scheduling', () => {
  const globals = globalThis as { chrome?: unknown };

  beforeEach(() => {
    globals.chrome = fakeChrome(
      { [NOTIFICATION_CACHE_KEY]: { ...EMPTY_NOTIFICATION_CACHE, calendar: upcoming(['a1', 'a2', 'a3', 'a4', 'a5']) } },
      { notificationPrefs: { delivery: { 'class-reminder': 'out-of-app' } } },
    );
  });

  afterEach(() => {
    delete globals.chrome;
  });

  test('a snapshot synced while alarms are being rescheduled is kept, with its own alarms', async () => {
    const newer = upcoming(['b1']);
    await Promise.all([scheduleNotificationAlarms(), syncClassReminders(newer)]);
    const cache = await getNotificationCache();
    expect(cache.calendar).toEqual(newer);
    expect(cache.scheduledAlarms.filter((name) => name.includes(':class-reminder:'))).toEqual([
      classAlarmName(10, 'b1'),
    ]);
  });
});
